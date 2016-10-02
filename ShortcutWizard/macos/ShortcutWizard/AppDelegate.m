#import "AppDelegate.h"

#import "RCTBridge.h"
#import "RCTJavaScriptLoader.h"



// TODO: Is this necessary as long all this is 1 file?
// @interface AppDelegate() <RCTBridgeDelegate>

// + (NSRect) screenResolution;
// - (void)triggerAppSwitch:(NSNotification *)notification;
// - (void)prepareProps;
// - (void)triggerAppSwitch;

// @end

@implementation AppDelegate

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

- (OSAScript *)loadAndCompileApplescript:(NSString *)path
{
    NSString *source = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:path ofType:@"scpt"]
                        encoding:NSUTF8StringEncoding error:nil];
    OSAScript *hold = [[OSAScript alloc] initWithSource:source];
    NSDictionary<NSString *,id> *errorInfo;
    BOOL compiled = [hold compileAndReturnError:&errorInfo];
    if (!compiled) {
        NSLog(@"Compile failed: %@", errorInfo);
        return nil;
    }

    return hold;
}

- (NSDictionary *)explainOrKeep:(NSMutableArray *)set
{
  NSLog(@"explainOrKeep: %@", set);
  
  if ([set count] < 2) return nil;
  
  __block NSMutableDictionary *newSet = [[NSMutableDictionary alloc] init];
  
  newSet[@"name"] = set[0];
  __block BOOL nextCmdChar = NO;
  __block BOOL nextCmdMod = NO;
  __block BOOL nextCmdGlyph = NO;
  __block BOOL nextPosition = NO;
  
  [set enumerateObjectsUsingBlock:^(NSString *obj, NSUInteger idx, BOOL * _Nonnull stop) {
    NSLog(@"explainorkeep-->0: %@", obj);

    // First is name
    if (obj && idx != 0) {
      if (nextPosition) {
        nextPosition = NO;
        [newSet setObject:obj forKey:@"position"];
      } else if (nextCmdMod) {
        nextCmdMod = NO;
        [newSet setObject:obj forKey:@"mod"];
        // set cmdmods to text items of "⌘ ⇧⌘ ⌥⌘ ⌥⇧⌘ ⌃⌘ ⌃⇧⌘ ⌃⌥⌘ ⌃⌥⇧⌘ - ⇧ ⌥ ⌥⇧ ⌃ ⌃⇧ ⌃⌥ ⌃⌥⇧"
        //    for () {
        //
        //    }
        //    -- repeat with i from 1 to (count menuglyphs)
        //    -- if item i of holdCmdGlyph is glyph then
        //						-- return modifier & item (i + 1) of menuglyphs
        //						-- end
        //						-- end repeat
        //

      } else if (nextCmdGlyph) {
        nextCmdGlyph = NO;
        [newSet setObject:obj forKey:@"glyph"];
        // set menuglyphs to text items of "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"
        

      } else if (nextCmdChar) {
        nextCmdChar = NO;
        [newSet setObject:obj forKey:@"char"];
      } else if ([obj isEqualToString:@"position"]) {
        nextPosition = YES;
      } else if ([obj isEqualToString:@"AXMenuItemCmdModifiers"]) {
        nextCmdMod = YES;
      } else if ([obj isEqualToString:@"AXMenuItemCmdGlyph"]) {
        nextCmdGlyph = YES;
      } else if ([obj isEqualToString:@"AXMenuItemCmdChar"]) {
        nextCmdChar = YES;
      }
    }

    
  }];

  return newSet;
}

- (NSDictionary *)unwrapUsrf:(NSAppleEventDescriptor *)desc
{
  NSInteger numItems = [desc numberOfItems];
  if (numItems) {
    NSString *name = nil;
    BOOL findPosition = NO;
    NSString *position = nil;
    NSMutableArray *keys = [[NSMutableArray alloc] init];
    for (NSUInteger j = 0; j < numItems; j++) {
      NSAppleEventDescriptor *innerDesc = [desc descriptorAtIndex:j];
      if (!innerDesc) continue;
      NSLog(@"inner desc: %@", innerDesc);
      NSString *obj = [innerDesc stringValue];
      if ([obj length]) {
        if (name == nil) {
          name = obj;
        }
      }
      NSLog(@"descriptor: %@", innerDesc);
      for (NSUInteger i = 0; i < [innerDesc numberOfItems]; i++) {
        NSAppleEventDescriptor *innerDescriptor2 = [innerDesc descriptorAtIndex:i];
        obj = [innerDescriptor2 stringValue];
        if (obj) {
          if (findPosition) {
            position = obj;
            findPosition = NO;
          } else {
            [keys addObject:obj];
            if (!findPosition && [obj isEqualToString:@"position"]) {
              findPosition = YES;
            }
          }
        }
        
        
        NSLog(@"keys: %@", keys);
        
        return @{
                 @"name": name,
                 @"keys": [NSArray arrayWithArray:keys],
                 @"position": position ? position : @"No position"
                 };
      }
    }
  }
    
  return nil;
}

- (void)readMenuItems:(NSString*)applicationName withBlock:(void (^)(NSDictionary *))callback
{
  NSLog(@"About to call readMenuItems with %@", applicationName);
  
  NSDictionary *applicationShortcuts = [self.shortcuts objectForKey:applicationName];
  if (applicationShortcuts) {
    callback(applicationShortcuts);
    return;
  }
  
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    NSDictionary<NSString *,id> *errorInfo;
    NSAppleEventDescriptor *desc = [self.appleScript executeHandlerWithName:@"readShortcuts"
                                                                  arguments:@[applicationName] error:&errorInfo];
    
    if (errorInfo) {
      NSLog(@"error: %@", errorInfo);
    }
    
    NSMutableDictionary* info = [[NSMutableDictionary alloc] init] ;
    NSInteger numItems = [desc numberOfItems];
    NSLog(@"Found number of items: %ld", numItems);
    for (NSInteger i = 0; i < numItems; i++) {
      
      NSInteger numItems = [desc numberOfItems];
      
      if (numItems) {
        NSMutableDictionary *merged = [[NSMutableDictionary alloc] init];
        NSMutableArray *set = [[NSMutableArray alloc] init];
        
        for (NSUInteger j = 0; j <= numItems; j++) {
          NSAppleEventDescriptor *innerDesc = [desc descriptorAtIndex:j];
          if (!innerDesc) continue;
          
          NSLog(@"inner desc: %@", innerDesc);
          NSString *str = [innerDesc stringValue];
          if (str) {
            [set addObject:str];
            
            if ([set count] > 1) {
              NSDictionary *newMerged = [self explainOrKeep:set];
              if ([newMerged count] > 1) {
                [merged setObject:newMerged forKey:newMerged[@"name"]];
                [set removeAllObjects];
              }
            }
            
            continue;
          }
          
          for (NSUInteger i = 0; i <= [innerDesc numberOfItems]; i++) {
            NSAppleEventDescriptor *innerDescriptor2 = [innerDesc descriptorAtIndex:i];
            if (!innerDescriptor2) continue;
            
            str = [innerDescriptor2 stringValue];
            
            if (str) {
              [set addObject:str];
            } else {
              for (NSUInteger x = 0; x <= [innerDescriptor2 numberOfItems]; x++) {
                NSAppleEventDescriptor *innerDescriptor3 = [innerDescriptor2 descriptorAtIndex:x];
                if (!innerDescriptor3) continue;
                
                str = [innerDescriptor3 stringValue];
                
                if (str) {
                  [set addObject:str];
                } else {
                  for (NSUInteger y = 0; y <= [innerDescriptor3 numberOfItems]; y++) {
                    NSAppleEventDescriptor *innerDescriptor4 = [innerDescriptor3 descriptorAtIndex:y];
                    if (!innerDescriptor4) continue;
                    
                    str = [innerDescriptor4 stringValue];
                    
                    if (str) {
                      [set addObject:str];
                    } else {
                      NSLog(@"must go deeper? leve 4 now %@", innerDescriptor4);
                    }
                }
              }
              
              
//              NSDictionary *unwrapped = [self unwrapUsrf:innerDescriptor2];
//              if (unwrapped) {
//                [set addObject:unwrapped];
//              }
            }
          }
          
          NSDictionary *newMerged = [self explainOrKeep:set];
          if ([newMerged count] > 1) {
            [merged setObject:newMerged forKey:newMerged[@"name"]];
            [set removeAllObjects];
          }
        }
        
        NSLog(@"set: %@ merged: %@", set, merged);
        [info setObject:merged forKey:applicationName];
      }
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
    
    callback([NSDictionary dictionaryWithDictionary:info]);
  }];
}

- (void)savePropsToPreferences
{
  // Register the preference defaults early.

  NSUserDefaults* defaults = [NSUserDefaults standardUserDefaults];
  NSMutableDictionary *shortcuts = [[NSMutableDictionary alloc] init];
  [self.shortcuts enumerateKeysAndObjectsUsingBlock:^(NSString * key, id  _Nonnull obj, BOOL * _Nonnull stop) {
    NSLog(@"looping with %@", obj);
    
    // TODO: 
    
    
    [shortcuts setObject:obj forKey:key];
//    [defaults setDictionary:@{
//                              [NSNumber numberWithInteger:
//                               } forKey:@"CacheDataAggressively"];
  }];
  

//  [defaults setObject:[NSDate dateWithTimeIntervalSinceNow:(3600 * 24 * 7)]
//               forKey:@"CacheExpirationDate"]; // Set a 1-week expiration
  
  [defaults synchronize];
  
  // The user wants to use lazy caching.
  //[defaults setBool:NO forKey:@"CacheDataAggressively"];
  //[defaults removeObjectForKey:@"CacheExpirationDate"];
  
  
  
  // Other initialization...
}

- (void)prepareProps
{
    NSWorkspace *workspace = [NSWorkspace sharedWorkspace];
    NSRunningApplication* currentAppInfo = [workspace frontmostApplication];
    NSString *newAppName = [currentAppInfo localizedName];
    if ([newAppName isEqualToString:@"ShortcutWizard"]) {
        NSLog(@"Switching to ShortcutWizard - TODO: SHOW UI");
        return;
    }
    self.currentApplicationName = newAppName;
    [self updateApplicationIcon:currentAppInfo];

    // todo: combine this with similar calls below
    NSArray *currentShortcuts = [self.shortcuts objectForKey:self.currentApplicationName];
    NSInteger currentShortcutsCount = [currentShortcuts count];
    if (currentShortcutsCount) {
        // Case 1 - our shortcuts already exist in memory
        NSLog(@"CASE 1 - for %@ found: %ld", self.currentApplicationName, currentShortcutsCount);
      
        [self updateProps:@{
            @"applicationName": self.currentApplicationName,
            @"applicationIconPath": self.currentIconPath,
            @"shortcuts": currentShortcuts
        }];
    } else {
        [self updateProps:@{@"applicationName": self.currentApplicationName,
                            @"applicationIconPath": self.currentIconPath}];
      
        // Case 2 - Read from user defaults:
//        NSUserDefaults *standardUserDefaults = [NSUserDefaults standardUserDefaults];
        NSDictionary *shortcuts = nil;
//        NSLog(@"std usr def %@", standardUserDefaults);
//        if (standardUserDefaults) {
//            shortcuts = [standardUserDefaults dictionaryForKey:self.currentApplicationName];
//            NSLog(@"shortcuts from user defaults: %@", [shortcuts allValues]);
//            NSInteger shortcutCount = [shortcuts count];
//            if (shortcutCount) {
//                [self updateProps:@{
//                    @"applicationName": self.currentApplicationName,
//                    @"applicationIconPath": self.currentIconPath,
//                    @"shortcuts": shortcuts
//                }];
//            }
//        }
      
        //NSLog(@"About to run check shortcuts in dict: %@", [shortcuts allKeys]);

            [self readMenuItems:self.currentApplicationName withBlock:^(NSDictionary *shortcuts) {
              
                NSLog(@"CASE 3 - returned block count: %ld", [shortcuts count]);

                if (!self.props) {
                    [self updateProps:@{
                        @"applicationName": self.currentApplicationName,
                        @"applicationIconPath": self.currentIconPath,
                        @"shortcuts": shortcuts
                    }];
                } else {
                    NSMutableDictionary *newDict = [NSMutableDictionary dictionaryWithDictionary:self.props];
                    newDict[@"applicationName"] = self.currentApplicationName;
                    newDict[@"applicationIconPath"] = self.currentIconPath;
                    newDict[@"shortcuts"] = shortcuts;
                    [self updateProps:[NSDictionary dictionaryWithDictionary:newDict]];
                }

                NSUserDefaults *standardUserDefaults = [NSUserDefaults standardUserDefaults];
                if (standardUserDefaults) {
                    // TODO: Will this work correctly with just 1 set of shortcuts?
                    [standardUserDefaults setObject:shortcuts forKey:self.currentApplicationName];
                    [standardUserDefaults synchronize];
                    NSLog(@"CASE 3 - also synchronizing");
                }
            }];
      
    }
}

- (void)triggerAppSwitch
{
    [self prepareProps];
    // self.rootView.appProperties = self.props; // moved to after the block finishes
}

-(void)updateProps:(NSDictionary *)newProps
{
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
        self.appleScript = [self loadAndCompileApplescript:@"readMenuItems"]; 
      
          //NSLog(@"Applescript: %@", self.appleScript);

        NSRect screenRect = [AppDelegate screenResolution];
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
