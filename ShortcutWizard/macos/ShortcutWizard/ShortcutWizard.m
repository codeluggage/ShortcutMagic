#import "ShortcutWizard.h"
#import "RCTBridge.h"
#import "RCTJavaScriptLoader.h"
#import "SWApplescriptManager.h"
#import "SWAccessibility.h"

// TODO: Is this necessary as long all this is 1 file?
// @interface ShortcutWizard() <RCTBridgeDelegate>

// + (NSRect) screenResolution;
// - (void)triggerAppSwitch:(NSNotification *)notification;
// - (void)prepareProps;
// - (void)triggerAppSwitch;

// @end

@implementation ShortcutWizard

+ (NSRect) screenResolution {
  NSRect screenRect = NSZeroRect;
  NSArray *screenArray = [NSScreen screens];
  NSUInteger screenCount = [screenArray count];
  
  for (NSUInteger index  = 0; index < screenCount; index++)
  {
    NSScreen *screen = [screenArray objectAtIndex: index];
    screenRect = [screen visibleFrame];
  }

  
  return screenRect;
}

//- (void)savePropsToPreferences
//{
//  // Register the preference defaults early.
//
//  NSUserDefaults* defaults = [NSUserDefaults standardUserDefaults];
//  NSMutableDictionary *shortcuts = [[NSMutableDictionary alloc] init];
//  [self.shortcuts enumerateKeysAndObjectsUsingBlock:^(NSString * key, id  _Nonnull obj, BOOL * _Nonnull stop) {
//    NSLog(@"looping with %@", obj);
//    
//    // TODO: 
//    
//    
//    [shortcuts setObject:obj forKey:key];
////    [defaults setDictionary:@{
////                              [NSNumber numberWithInteger:
////                               } forKey:@"CacheDataAggressively"];
//  }];
//  
//
////  [defaults setObject:[NSDate dateWithTimeIntervalSinceNow:(3600 * 24 * 7)]
////               forKey:@"CacheExpirationDate"]; // Set a 1-week expiration
//  
//  [defaults synchronize];
//  
//  // The user wants to use lazy caching.
//  //[defaults setBool:NO forKey:@"CacheDataAggressively"];
//  //[defaults removeObjectForKey:@"CacheExpirationDate"];
//  
//  
//  
//  // Other initialization...
//}

- (void)prepareProps
{
  // Is this needed?
  __block ShortcutWizard *holdSelf = self;
    NSWorkspace *workspace = [NSWorkspace sharedWorkspace];
    NSRunningApplication* currentAppInfo = [workspace frontmostApplication];
    __block NSString *newAppName = [currentAppInfo localizedName];
    if ([newAppName isEqualToString:@"ShortcutWizard"]) {
        NSLog(@"Switching to ShortcutWizard - TODO: SHOW UI");
        return;
    }
    holdSelf.currentApplicationName = newAppName;
    [holdSelf updateApplicationIcon:currentAppInfo];
  
    __block NSString *newAppIconPath = holdSelf.currentIconPath;

  
  
  
//  // TEMP - REMOVE BAD DICTS:
//  NSMutableDictionary* hold = [[NSMutableDictionary alloc] initWithDictionary:holdSelf.shortcuts ];
//  [hold removeObjectForKey:@"Sublime Text"];
//  holdSelf.shortcuts = [[NSDictionary alloc] initWithDictionary:hold];
  
  
  
  
    // todo: combine this with similar calls below
    NSDictionary *currentShortcuts = [holdSelf.shortcuts objectForKey:newAppName];
    NSInteger currentShortcutsCount = [currentShortcuts count];
    if (currentShortcutsCount) {
        // Case 1 - our shortcuts already exist in memory
        NSLog(@"CASE 1 - for %@ found: %ld", newAppName, currentShortcutsCount);
      
        [holdSelf updateProps:@{
            @"applicationName": newAppName,
            @"applicationIconPath": newAppIconPath,
            @"shortcuts": currentShortcuts
        }];
    } else {
      NSDictionary *shortcuts = [[NSUserDefaults standardUserDefaults] dictionaryForKey:@"shortcuts"];
      if (shortcuts) {
        holdSelf.shortcuts = shortcuts;
        NSLog(@"CASE 2 - shortcuts from user defaults count: %ld, keys: %@", [holdSelf.shortcuts count], [holdSelf.shortcuts allKeys]);
        NSDictionary *appilcationShortcuts = [holdSelf.shortcuts objectForKey:newAppName];
        if (appilcationShortcuts) {
          [holdSelf updateProps:@{
                              @"applicationName": newAppName,
                              @"applicationIconPath": newAppIconPath,
                              @"shortcuts": appilcationShortcuts
                              }];
          return;
        }
      }
      
      
      // TODO: Merge with past shortcuts?
      
      //    if (!self.shortcuts) {
      //      self.shortcuts = [[NSDictionary alloc] initWithObjectsAndKeys:info, applicationName, nil];
      //      NSLog(@"read first time with new self.shortcuts: %@", self.shortcuts);
      //    } else {
      //      NSMutableDictionary *newDict = [[NSMutableDictionary alloc] initWithDictionary:self.shortcuts copyItems:YES];
      //      [newDict setObject:info forKey:applicationName];
      //      self.shortcuts = [[NSDictionary alloc] initWithDictionary:newDict];
      //      NSLog(@"Now self.shortcuts is: %@", self.shortcuts);
      //    }
      
      NSLog(@"Calling readMenuItems with name: %@, already have keys: %@", newAppName, [holdSelf.shortcuts allKeys]);
      [SWApplescriptManager readMenuItems:newAppName withBlock:^(NSDictionary *shortcuts) {
        NSLog(@"CASE 3 - returned block count: %ld", [shortcuts count]);
        
        [holdSelf mergeAndSaveShortcuts:shortcuts withName:newAppName];
        
        [holdSelf updateProps:@{
                            @"applicationName": newAppName,
                            @"applicationIconPath": newAppIconPath,
                            @"shortcuts": shortcuts
                            }];
      }];
    }
}

- (void)mergeAndSaveShortcuts:(NSDictionary *)shortcuts withName:(NSString *)name
{
  if (self.shortcuts) {
    NSMutableDictionary *merge = [NSMutableDictionary dictionaryWithDictionary:self.shortcuts];
    [merge addEntriesFromDictionary:[[NSDictionary alloc] initWithObjectsAndKeys:shortcuts, name, nil]];
    
    // NSLog(@"inside case3 and self.shortcuts existed already, merged = %@", merge);
    self.shortcuts = [NSDictionary dictionaryWithDictionary:merge];
  } else {
    self.shortcuts = [[NSDictionary alloc] initWithObjectsAndKeys:shortcuts, name, nil];
  }
  
  [self saveShortcuts:self.shortcuts];
}

- (void)saveShortcuts:(NSDictionary *)shortcuts
{
  NSUserDefaults *standardUserDefaults = [NSUserDefaults standardUserDefaults];
  if (standardUserDefaults) {
    [standardUserDefaults setObject:shortcuts forKey:@"shortcuts"];
    [standardUserDefaults synchronize];
  }
}

- (void)triggerAppSwitch
{
    [self prepareProps];
    // self.rootView.appProperties = self.props; // moved to after the block finishes
}

-(void)updateProps:(NSDictionary *)newProps
{
    NSLog(@"Sending new props with shortcut: %@ count: %ld", [newProps objectForKey:@"applicationName"], [[newProps objectForKey:@"shortcuts"] count]);

  // TODO: merge this
//  if (!self.props) {
//    [self updateProps:@{
//                        @"applicationName": self.currentApplicationName,
//                        @"applicationIconPath": self.currentIconPath,
//                        @"shortcuts": shortcuts
//                        }];
//  } else {
//    NSMutableDictionary *newDict = [NSMutableDictionary dictionaryWithDictionary:self.props];
//    newDict[@"applicationName"] = self.currentApplicationName;
//    newDict[@"applicationIconPath"] = self.currentIconPath;
//    newDict[@"shortcuts"] = shortcuts;
//    [self updateProps:[NSDictionary dictionaryWithDictionary:newDict]];
//  }
  
    self.props = newProps;
    self.rootView.appProperties = self.props;
}

-(void)updateApplicationIcon:(NSRunningApplication *)currentAppInfo
{
    NSString *iconPath = [NSString stringWithFormat:@"%@.png" , [currentAppInfo localizedName]];
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);         
    NSString* originalFile = [paths[0] stringByAppendingPathComponent:iconPath];
    self.currentIconPath = [[paths objectAtIndex:0] stringByAppendingPathComponent:iconPath];

    if ([[NSFileManager defaultManager] fileExistsAtPath:originalFile]) {
        // File already exists
        return;
    }

    NSImage* icon = [currentAppInfo icon];
    NSData *imageData = [icon TIFFRepresentation];
    NSBitmapImageRep *imageRep = [NSBitmapImageRep imageRepWithData:imageData];
    NSDictionary *imageProps = [NSDictionary dictionaryWithObject:[NSNumber numberWithFloat:1.0] forKey:NSImageCompressionFactor];
    imageData = [imageRep representationUsingType:NSJPEGFileType properties:imageProps];
    [imageData writeToFile:self.currentIconPath atomically:NO];

    // NSURL* url = [[NSBundle mainBundle] URLForResource:@"MyImage" withExtension:@"png"];
    // NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);         
    // NSString *filePath = [[paths objectAtIndex:0] stringByAppendingPathComponent:@"banner.png"];

    // NSError *writeError = nil;
    // [imageData writeToFile:filePath options:NSDataWritingAtomic error:&writeError];

    // if (writeError) {
    //     NSLog(@"Error writing file: %@", writeError);
    // }
}

-(id)init
{
    if(self = [super init]) {
        [SWAccessibility requestAccess];
      
        NSRect screenRect = [ShortcutWizard screenResolution];
        NSLog(@"Got the screen rect: >>>>>>>>>");
        NSLog(@"%.1fx%.1f",screenRect.size.width, screenRect.size.height);

        // TODO: Can this be sent from javascript so everything is configured in javascript?
        NSRect contentSize = NSMakeRect(screenRect.size.width - 400, screenRect.size.height - 200, 200, 450); // initial size of main NSWindow

        self.window = [[NSWindow alloc] initWithContentRect:contentSize
//            styleMask:NSBorderlessWindowMask
            styleMask:NSTitledWindowMask
            backing:NSBackingStoreBuffered
//            defer:NO];
            defer:YES];

//      NSLog(@"window size:%i-%i : %i - %i", self.window.frame.size.width, self.window.frame.size.height, self.window.frame.positon.x, self.window.frame.position.y);
        NSLog(@"window size:%f-%f", self.window.frame.size.width, self.window.frame.size.height);
        NSLog(@"window pos:%f-%f", self.window.frame.origin.x, self.window.frame.origin.y);

        NSWindowController *windowController = [[NSWindowController alloc] initWithWindow:self.window];

        [[self window] setTitleVisibility:NSWindowTitleHidden];
        [[self window] setTitlebarAppearsTransparent:YES];
        // [[self window] setAppearance:[NSAppearance appearanceNamed:NSAppearanceNameAqua]];
        [[self window] setOpaque:NO];
        [[self window] setAlphaValue:0.7];
        [[self window] setHasShadow:YES];
        [[self window] setLevel:NSFloatingWindowLevel];

        [windowController setShouldCascadeWindows:NO];
        [windowController setWindowFrameAutosaveName:@"ShortcutWizard"];

        [windowController showWindow:self.window];

        [self setUpApplicationMenu];
    }

    return self;
}

// - (void)printLoop
// {
//   NSWorkspace* workspace            = [NSWorkspace sharedWorkspace];
//   NSRunningApplication* currentAppInfo      = [workspace frontmostApplication];

//   [[workspace notificationCenter] addObserver:self
//                                      selector:@selector(applicationLaunched:)
//                                          name:NSWorkspaceDidLaunchApplicationNotification
//                                        object:workspace];


// //   NSImage* icon = [currentAppInfo icon];
//   NSLog([currentAppInfo localizedName]);
// }

- (void)listeningApplicationActivated:(NSNotification *)notification
{
    NSLog(@"Inside listeningApplicationActivated! ");
    [self triggerAppSwitch];
}

- (void)listeningApplicationLaunched:(NSNotification *)notification
{
    NSLog(@"Inside listeningApplicationLaunched! ");
    [self triggerAppSwitch];

    // NSLog([[notification userInfo] description]);

//    NSWorkspace *workspace = [NSWorkspace sharedWorkspace];
//    NSRunningApplication* currentAppInfo      = [workspace frontmostApplication];
//    NSImage* icon = [currentAppInfo icon];
//    NSData *imageData = [icon TIFFRepresentation];
//    NSBitmapImageRep *imageRep = [NSBitmapImageRep imageRepWithData:imageData];
//    NSDictionary *imageProps = [NSDictionary dictionaryWithObject:[NSNumber numberWithFloat:1.0] forKey:NSImageCompressionFactor];
//    imageData = [imageRep representationUsingType:NSJPEGFileType properties:imageProps];
//
//    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);         
//    NSString *fileName = [[paths objectAtIndex:0] 
//        stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.png" , 
//            [currentAppInfo localizedName]
//        ]
//    ];
//
//    [imageData writeToFile:fileName atomically:NO];
}

- (void)applicationDidFinishLaunching:(__unused NSNotification *)aNotification
{

  // NSTimer *myTimer =[NSTimer scheduledTimerWithTimeInterval:0.03
  //                                                   target:self
  //                                                 selector:@selector(printLoop)
  //                                                 userInfo:nil
  //                                                  repeats:YES];

// APPKIT_EXTERN NSString * NSWorkspaceWillLaunchApplicationNotification;  //  see above
// APPKIT_EXTERN NSString * NSWorkspaceDidLaunchApplicationNotification;   //  see above
// APPKIT_EXTERN NSString * NSWorkspaceDidTerminateApplicationNotification;    //  see above
// APPKIT_EXTERN NSString * const NSWorkspaceDidHideApplicationNotification NS_AVAILABLE_MAC(10_6);
// APPKIT_EXTERN NSString * const NSWorkspaceDidUnhideApplicationNotification NS_AVAILABLE_MAC(10_6);
// APPKIT_EXTERN NSString * const NSWorkspaceDidActivateApplicationNotification NS_AVAILABLE_MAC(10_6);
// APPKIT_EXTERN NSString * const NSWorkspaceDidDeactivateApplicationNotification NS_AVAILABLE_MAC(10_6);

   // [[[NSWorkspace sharedWorkspace] notificationCenter] addObserver:self selector:@selector(activateApp:) name:NSWorkspaceDidActivateApplicationNotification object:nil];

    self.sharedWorkspace = [NSWorkspace sharedWorkspace];

    [[self.sharedWorkspace notificationCenter] addObserver:self 
     selector:@selector(listeningApplicationLaunched:) 
     name:NSWorkspaceDidLaunchApplicationNotification 
     object:self.sharedWorkspace];

    [[self.sharedWorkspace notificationCenter] addObserver:self 
     selector:@selector(listeningApplicationActivated:) 
     name:NSWorkspaceDidActivateApplicationNotification 
     object:self.sharedWorkspace];

    _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];


//    NSRunningApplication* currentAppInfo = [self.sharedWorkspace frontmostApplication];

    [self prepareProps];

    self.rootView = [[RCTRootView alloc] initWithBridge:_bridge moduleName:@"ShortcutWizard" initialProperties:self.props];

    [self.window setContentView:self.rootView];
}

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge
{
    NSURL *sourceURL;

#if DEBUG
    sourceURL = [NSURL URLWithString:@"http://localhost:8081/index.macos.bundle?platform=macos&dev=true"];
#else
    sourceURL = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif

    return sourceURL;
}

- (void)loadSourceForBridge:(RCTBridge *)bridge withBlock:(RCTSourceLoadBlock)loadCallback
{
    [RCTJavaScriptLoader loadBundleAtURL:[self sourceURLForBridge:bridge]
      onComplete:loadCallback];
}

- (void)setUpApplicationMenu
{
    NSMenuItem *containerItem = [[NSMenuItem alloc] init];
    NSMenu *rootMenu = [[NSMenu alloc] initWithTitle:@"" ];
    [containerItem setSubmenu:rootMenu];
    [rootMenu addItemWithTitle:@"Quit ShortcutWizard" action:@selector(terminate:) keyEquivalent:@"q"];
    [[NSApp mainMenu] addItem:containerItem];
}

- (id)firstResponder
{
    return [self.window firstResponder];
}

@end
