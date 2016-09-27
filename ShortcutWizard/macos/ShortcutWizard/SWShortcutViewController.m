/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information
 
 Abstract:
 View controller to manage a a table view that displays a collection of shortcuts.
 
  When requested (by clicking the Fetch ShortcutWizards button), the controller creates an asynchronous NSURLSession task to retrieve JSON data about earthshortcuts. Earthquake data are compared with any existing managed objects to determine whether there are new shortcuts. New managed objects are created to represent new data, and saved to the persistent store on a private queue.
 */

#import "SWShortcutViewController.h"
#import "SWShortcuts.h"
#import "SWCoreDataStackManager.h"

@interface SWShortcutWizardsViewController () <NSTableViewDataSource, NSTableViewDelegate>

@property (weak) IBOutlet NSTableView *tableView;
@property (weak) IBOutlet NSButton *fetchShortcutWizardsButton;
@property (weak) IBOutlet NSProgressIndicator *progressIndicator;

@property (nonatomic) NSArray<SWShortcutWizard *> *shortcuts;
@property (nonatomic) NSManagedObjectContext *managedObjectContext;

@end

NSString *const ColumnIdentifierPlace = @"placeName";
NSString *const ColumnIdentifierTime = @"time";
NSString *const ColumnIdentifierMagnitude = @"magnitude";

NSString *EARTHQUAKES_ERROR_DOMAIN = @"EARTHQUAKES_ERROR_DOMAIN";


@implementation SWShortcutWizardsViewController

#pragma mark - View Life Cycle

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(contextDidSaveNotificationHandler:)
                                                 name:NSManagedObjectContextDidSaveNotification
                                               object:nil
     ];

    self.managedObjectContext = [SWCoreDataStackManager sharedManager].mainQueueContext;
    [self reloadTableView:self];
}

- (void)dealloc {
    
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Core Data Batch importing

- (IBAction)fetchShortcutWizards:(id)sender {
    // Ensure the button can't be pressed again until the fetch is complete.
    self.fetchShortcutWizardsButton.enabled = NO;
    self.progressIndicator.hidden = NO;
    [self.progressIndicator startAnimation:nil];

    // Create an NSURLSession and then session task to contact the earthquake server and retrieve JSON data.
    // Because this server is out of our control and does not offer a secure communication channel,
    // we'll use the http version of the URL and add "earthquake.usgs.gov" to the "NSExceptionDomains"
    // value in the apps's info.plist. When you commmunicate with your own servers, or when the services you
    // use offer a secure communication option, you should always prefer to use HTTPS.
    NSURL *jsonURL = [NSURL URLWithString:@"http://earthquake.usgs.gov/earthshortcuts/feed/v1.0/summary/all_month.geojson"];

    NSURLSession *session = [NSURLSession sessionWithConfiguration: [NSURLSessionConfiguration ephemeralSessionConfiguration]];

    NSURLSessionDataTask *task = [session dataTaskWithURL:jsonURL completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {

        if (!data) {
            [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
                NSLog(@"Error connecting: %@", [error localizedDescription]);
                NSString *description = NSLocalizedString(@"Could not get data from the remote server", @"Failed to connect to server");
                NSDictionary *dict = @{NSLocalizedDescriptionKey:description, NSUnderlyingErrorKey:error};
                NSError *connectionError = [NSError errorWithDomain:EARTHQUAKES_ERROR_DOMAIN code:101 userInfo:dict];
                [NSApp presentError:connectionError];
                self.fetchShortcutWizardsButton.enabled = YES;
                [self.progressIndicator stopAnimation:nil];
                self.progressIndicator.hidden = YES;

            }];
            return;
        }

        NSError *anyError = nil;
        
        NSDictionary *jsonDictionary = [NSJSONSerialization JSONObjectWithData:data options:0 error:&anyError];
        if (!jsonDictionary) {
            [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
                NSLog(@"Error creating JSON dictionary: %@", [anyError localizedDescription]);
                NSString *description = NSLocalizedString(@"Could not analyze earthquake data", @"Failed to unpack JSON");
                NSDictionary *dict = @{NSLocalizedDescriptionKey:description, NSUnderlyingErrorKey:anyError};
                NSError *jsonDataError = [NSError errorWithDomain:EARTHQUAKES_ERROR_DOMAIN code:102 userInfo:dict];
                [NSApp presentError:jsonDataError];
                self.fetchShortcutWizardsButton.enabled = YES;
                [self.progressIndicator stopAnimation:nil];
                self.progressIndicator.hidden = YES;

            }];
            return;
        }
        
        if (! [self importFromJsonDictionary:jsonDictionary error:&anyError]) {
            [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
                NSLog(@"Error importing JSON dictionary: %@", [anyError localizedDescription]);
                NSString *description = NSLocalizedString(@"Could not import earthquake data", @"Failed to importing JSON dictionary");
                NSDictionary *dict = @{NSLocalizedDescriptionKey:description, NSUnderlyingErrorKey:anyError};
                NSError *coreDataError = [NSError errorWithDomain:EARTHQUAKES_ERROR_DOMAIN code:102 userInfo:dict];
                [NSApp presentError:coreDataError];
                self.fetchShortcutWizardsButton.enabled = YES;
                [self.progressIndicator stopAnimation:nil];
                self.progressIndicator.hidden = YES;

            }];
            return;
        };
        
        // Bounce back to the main queue to reload the table view and reenable the fetch button.
        [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
            [self reloadTableView:nil];
            self.fetchShortcutWizardsButton.enabled = YES;
            [self.progressIndicator stopAnimation:nil];
            self.progressIndicator.hidden = YES;

        }];
    }];

    [task resume];
}

- (BOOL)importFromJsonDictionary:(NSDictionary *)jsonDictionary error:(NSError * __autoreleasing *)error {
    
    // Create a context on a private queue to fetch existing shortcuts to compare with incoming data and create new shortcuts as required.
    NSManagedObjectContext *taskContext = [[SWCoreDataStackManager sharedManager] newPrivateQueueContextWithNewPSC:error];
    if (!taskContext) {
        return false;
    }
    
    // Sort the dictionaries by code; this way they can be compared in parallel with existing shortcuts.
    NSArray *featuresArray = jsonDictionary[@"features"];
    NSArray *sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"properties.code" ascending:YES]];
    featuresArray = [featuresArray sortedArrayUsingDescriptors:sortDescriptors];
    
    // To avoid a high memory footprint, process records in batches.
    const NSUInteger batchSize = 128;

    NSUInteger totalFeatureCount = featuresArray.count;
    NSUInteger numBatches = totalFeatureCount / batchSize;
    numBatches += totalFeatureCount % batchSize > 0 ? 1 : 0;
    
    for (NSUInteger batchNumber = 0; batchNumber < numBatches; batchNumber++) {
        
        NSInteger rangeStart = batchNumber * batchSize;
        NSInteger rangeLength = MIN(batchSize, totalFeatureCount - batchNumber * batchSize);
        
        NSRange range = NSMakeRange(rangeStart, rangeLength);
        NSArray *featuresBatchArray = [featuresArray subarrayWithRange:range];
        
        if (![self importFromFeaturesArray:featuresBatchArray usingContext:taskContext error:error]) {
            return false;
        }
    }
    return true;
}

- (BOOL)importFromFeaturesArray:(NSArray *)featuresArray usingContext:(NSManagedObjectContext *)taskContext
                      error:(NSError * __autoreleasing *)error {
    
    // Create a request to fetch existing shortcuts with the same codes as those in the JSON data.
    // Existing shortcuts will be updated with new data; if there isn't a match, then create a new quake to represent the event.
    NSFetchRequest *matchingShortcutWizardRequest = [NSFetchRequest fetchRequestWithEntityName:@"ShortcutWizard"];
    
    // Get the codes for each of the features and store them in an array.
    NSArray *codes = [featuresArray valueForKeyPath:@"properties.code"];
    
    matchingShortcutWizardRequest.predicate = [NSPredicate predicateWithFormat:@"code in %@" argumentArray:@[codes]];
    
    [taskContext performBlockAndWait:^{
        
        NSArray *matchingShortcutWizards = [taskContext executeFetchRequest:matchingShortcutWizardRequest error:error];
        if (matchingShortcutWizards) {
            
            for (NSManagedObject *matchingShortcutWizard in matchingShortcutWizards) {
                [taskContext deleteObject: matchingShortcutWizard];
            }
        }
        
        for (NSDictionary *result in featuresArray) {
            // For each feature in turn, retrieve the properties for the quake and create a new quake or update an existing one accordingly.
            NSDictionary * shortcutDictionary = result[@"properties"];
            SWShortcutWizard *shortcut = [NSEntityDescription insertNewObjectForEntityForName:@"ShortcutWizard" inManagedObjectContext:taskContext];
            [shortcut updateFromDictionary:shortcutDictionary];
        }
        
        if ([taskContext hasChanges]) {
            
            if (![taskContext save:error]) {
                return;
            }
            [taskContext reset];
        }
    }];
    
    return *error ? false : true;
}

// Handler for NSManagedObjectContextDidSaveNotification.
// Observe NSManagedObjectContextDidSaveNotification and merge the changes to the main context from other contexts.
// We rely on this to sync between contexts, thus avoid most of merge conflicts and keep UI refresh.
// In the sample code, we don’t edit the main context so not syncing with the private queue context won’t trigger any issue.
// However, a real app may not as simple as this. We normally need to handle this notificaiton.

- (void)contextDidSaveNotificationHandler:(NSNotification *)notification {
    
    if (notification.object != self.managedObjectContext) {
        
        [self.managedObjectContext performBlock:^{
            [self.managedObjectContext mergeChangesFromContextDidSaveNotification:notification];
        }];
    }
}

#pragma mark - Convenience

/// Fetch shortcuts ordered in time and reload the table view.
- (void)reloadTableView:(id)sender {
    NSFetchRequest *request = [NSFetchRequest fetchRequestWithEntityName:@"ShortcutWizard"];
    request.sortDescriptors = @[[NSSortDescriptor sortDescriptorWithKey:@"time" ascending:NO]];

    NSError *anyError;

    NSArray *fetchedShortcutWizards = [self.managedObjectContext executeFetchRequest:request error:&anyError];

    if (!fetchedShortcutWizards) {
        NSLog(@"Error fetching: %@", [anyError localizedDescription]);
        NSString *description = NSLocalizedString(@"Error attepmpting to update data", @"Failed to fetch earthquake data");
        NSDictionary *dict = @{NSLocalizedDescriptionKey:description, NSUnderlyingErrorKey:anyError};
        NSError *connectionError = [NSError errorWithDomain:EARTHQUAKES_ERROR_DOMAIN code:106 userInfo:dict];
        [NSApp presentError:connectionError];
        return;
    }

    self.shortcuts = fetchedShortcutWizards;

    [self.tableView reloadData];
}

#pragma mark - NSTableViewDataSource

-(NSInteger)numberOfRowsInTableView:(NSTableView *)tableView {
    return self.shortcuts.count;
}

#pragma mark - NSTableViewDelegate

-(NSView *)tableView:(NSTableView *)tableView viewForTableColumn:(NSTableColumn *)tableColumn row:(NSInteger)row {
    NSString *identifier = [tableColumn identifier];
    
    NSTableCellView *cellView = [tableView makeViewWithIdentifier:identifier owner:self];

    SWShortcutWizard *shortcut = self.shortcuts[row];

    if ([identifier isEqualToString:ColumnIdentifierPlace]) {
        cellView.textField.stringValue = shortcut.placeName;
    }
    else if ([identifier isEqualToString:ColumnIdentifierTime]) {
        cellView.textField.objectValue = shortcut.time;
    }
    else if ([identifier isEqualToString:ColumnIdentifierMagnitude]) {
        cellView.textField.objectValue = @(shortcut.magnitude);
    }

    return cellView;
}

@end

