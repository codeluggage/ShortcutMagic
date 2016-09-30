/*
 Copyright (C) 2016 Apple Inc. All Rights Reserved.
 See LICENSE.txt for this sample’s licensing information
 
 Abstract:
 Singleton controller to manage the main Core Data stack for the application. It vends a persistent store coordinator, and for convenience the managed object model and URL for the persistent store and application documents directory.
 */

#import "SWCoreDataStackManager.h"

NSString *const ApplicationDocumentsDirectoryName = @"ShortcutWizard";
NSString *const MainStoreFileName = @"ShortcutWizard.storedata";
NSString *const ErrorDomain = @"CoreDataStackManager";


@interface SWCoreDataStackManager ()
// Managed object model for the application.
@property (nonatomic, readonly) NSManagedObjectModel *managedObjectModel;
// Primary persistent store coordinator for the application.
@property (nonatomic, readonly) NSPersistentStoreCoordinator *persistentStoreCoordinator;

// URL for directory the application uses to store the Core Data store file.
@property (nonatomic, readonly) NSURL *applicationSupportDirectory;
// URL for the Core Data store file.
@property (nonatomic, readonly) NSURL *storeURL;
@end



@implementation SWCoreDataStackManager
@synthesize managedObjectModel = _managedObjectModel;
@synthesize persistentStoreCoordinator = _persistentStoreCoordinator;
@synthesize mainQueueContext = _mainQueueContext;
@synthesize applicationSupportDirectory = _applicationSupportDirectory;
@synthesize storeURL = _storeURL;

+ (instancetype)sharedManager {
    static SWCoreDataStackManager *sharedManager = nil;
    static dispatch_once_t once;
    
    dispatch_once(&once, ^{
        sharedManager = [[self alloc] init];
    });

    return sharedManager;
}

- (NSManagedObjectModel *)managedObjectModel {

    if (! _managedObjectModel) {
        
        NSURL *modelURL = [[NSBundle mainBundle] URLForResource:@"ShortcutWizard" withExtension:@"momd"];
        _managedObjectModel = [[NSManagedObjectModel alloc] initWithContentsOfURL:modelURL];
    }
    return _managedObjectModel;
}

- (NSPersistentStoreCoordinator *)persistentStoreCoordinator {
    // This implementation creates and return a coordinator, having added the store for the application to it. (The directory for the store is created, if necessary.)
    if (_persistentStoreCoordinator) {
        return _persistentStoreCoordinator;
    }

    NSURL *url = self.storeURL;
    if (!url) {
        return nil;
    }

    NSPersistentStoreCoordinator *psc = [[NSPersistentStoreCoordinator alloc] initWithManagedObjectModel:self.managedObjectModel];

    NSDictionary *options = @{
        NSMigratePersistentStoresAutomaticallyOption: @(YES),
        NSInferMappingModelAutomaticallyOption: @(YES)
    };

    NSError *error;

    if (![psc addPersistentStoreWithType:NSSQLiteStoreType configuration:nil URL:url options:options error:&error]) {
        [NSApp presentError:error];

        return nil;
    }

    _persistentStoreCoordinator = psc;
 
    return _persistentStoreCoordinator;
}

- (NSURL *)applicationSupportDirectory {
    if (_applicationSupportDirectory) {
        return _applicationSupportDirectory;
    }

    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSArray *URLs = [fileManager URLsForDirectory:NSApplicationSupportDirectory inDomains:NSUserDomainMask];

    NSURL *URL = URLs[URLs.count - 1];
    URL = [URL URLByAppendingPathComponent:ApplicationDocumentsDirectoryName];
    NSError *error;

    NSDictionary *properties = [URL resourceValuesForKeys:@[NSURLIsDirectoryKey] error:&error];
    if (properties) {
        NSNumber *isDirectoryNumber = properties[NSURLIsDirectoryKey];

        if (isDirectoryNumber && !isDirectoryNumber.boolValue) {
            NSString *description = NSLocalizedString(@"Could not access the application data folder", @"Failed to initialize applicationSupportDirectory");
            NSString *reason = NSLocalizedString(@"Found a file in its place", @"Failed to initialize applicationSupportDirectory");
            NSDictionary *userInfo = @{NSLocalizedDescriptionKey : description, NSLocalizedFailureReasonErrorKey : reason};
            error = [NSError errorWithDomain:ErrorDomain code:101 userInfo:userInfo];

            [NSApp presentError:error];
            
            return nil;
        }
    }
    else {
        if (error.code == NSFileReadNoSuchFileError) {
            BOOL ok = [fileManager createDirectoryAtPath:URL.path withIntermediateDirectories:YES attributes:nil error:&error];

            if (!ok) {
                [NSApp presentError:error];
            
                return nil;
            }
        }
    }

    _applicationSupportDirectory = URL;
    
    return _applicationSupportDirectory;
}

- (NSURL *)storeURL {
    
    if (! _storeURL) {
        _storeURL = [self.applicationSupportDirectory URLByAppendingPathComponent:MainStoreFileName];
    }
    return _storeURL;
}

// The managed object context for the view controller (which is bound to the persistent store coordinator for the application).
- (NSManagedObjectContext *)mainQueueContext {
    if (_mainQueueContext) {
        return _mainQueueContext;
    }
    
    _mainQueueContext = [[NSManagedObjectContext alloc] initWithConcurrencyType:NSMainQueueConcurrencyType];
    _mainQueueContext.persistentStoreCoordinator = self.persistentStoreCoordinator;
    
    // Avoid using default merge policy in multi-threading environment:
    // when we delete (and save) a record in one context,
    // and try to save edits on the same record in the other context before merging the changes,
    // an exception will be thrown because Core Data by default uses NSErrorMergePolicy.
    // Setting a reasonable mergePolicy is a good practice to avoid that kind of exception.
    _mainQueueContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy;
    
    // In macOS, a context provides an undo manager by default
    // Disable it for performance benefit
    _mainQueueContext.undoManager = nil;
    
    return _mainQueueContext;
}

// Creates a new Core Data stack and returns a managed object context associated with a private queue.
- (NSManagedObjectContext *)newPrivateQueueContextWithNewPSC:(NSError * __autoreleasing *)error {
    
    // It uses the same store and model, but a new persistent store coordinator and context.
    NSPersistentStoreCoordinator *coordinator = [[NSPersistentStoreCoordinator alloc] initWithManagedObjectModel:self.managedObjectModel];
    
    if (![coordinator addPersistentStoreWithType:NSSQLiteStoreType configuration:nil
                                                  URL:self.storeURL
                                              options:nil
                                                error:error]) {
        return nil;
    }
    
    NSManagedObjectContext *context = [[NSManagedObjectContext alloc] initWithConcurrencyType:NSPrivateQueueConcurrencyType];
    [context performBlockAndWait:^{
        [context setPersistentStoreCoordinator:coordinator];
        
        // Avoid using default merge policy in multi-threading environment:
        // when we delete (and save) a record in one context,
        // and try to save edits on the same record in the other context before merging the changes,
        // an exception will be thrown because Core Data by default uses NSErrorMergePolicy.
        // Setting a reasonable mergePolicy is a good practice to avoid that kind of exception.
        context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy;
        
        // In macOS, a context provides an undo manager by default
        // Disable it for performance benefit
        context.undoManager = nil;
    }];
    return context;
}

@end
