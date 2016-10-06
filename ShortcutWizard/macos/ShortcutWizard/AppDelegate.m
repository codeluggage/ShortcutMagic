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
//  NSLog(@"explainOrKeep before: %@", set);
  
  if ([set count] < 2) return nil;
  
  __block NSMutableDictionary *newSet = [[NSMutableDictionary alloc] init];
  
  newSet[@"name"] = set[0];
  __block BOOL nextCmdChar = NO;
  __block BOOL nextCmdMod = NO;
  __block BOOL nextCmdGlyph = NO;
  __block BOOL nextPosition = NO;
  
  [set enumerateObjectsUsingBlock:^(NSString *obj, NSUInteger idx, BOOL * _Nonnull stop) {
    // Skip first index - that is always the name
    if (obj && idx != 0) {
      if (nextPosition) {
        nextPosition = NO;
        [newSet setObject:obj forKey:@"position"];
      } else if (nextCmdMod) {
        nextCmdMod = NO;
        
        NSString *mod = nil;
        NSInteger switchCase = [obj integerValue];
        
    switch (switchCase) {
      case 0:
        mod = @"⌘";
        break;
      case 1:
        mod = @"⇧⌘";
        break;
      case 2:
        mod = @"⌥⌘";
        break;
      case 3:
        mod = @"⌥⇧⌘";
        break;
      case 4:
        mod = @"⌃⌘";
        break;
      case 5:
        mod = @"⌃⇧⌘";
        break;
      case 6:
        mod = @"⌃⌥⌘";
        break;
      case 7:
        mod = @"⌃⌥⇧⌘";
        break;
        // TOOD: Determine what '8' is in this key table
//      case 8:
//        mod = @"-";
//        break;
      case 9:
        mod = @"⇧";
        break;
      case 10:
        mod = @"⌥";
        break;
      case 11:
        mod = @"⌥⇧";
        break;
      case 12:
        mod = @"⌃";
        break;
      case 13:
        mod = @"⌃⇧";
        break;
      case 14:
        mod = @"⌃⌥";
        break;
      case 15:
        mod = @"⌃⌥⇧";
        break;
      }

        if (mod) {
          [newSet setObject:mod forKey:@"mod"];
        }
    } else if (nextCmdGlyph) {
        nextCmdGlyph = NO;
        
        NSInteger switchCase = [obj integerValue];
        NSString *glyph = nil;
       
        // set menuglyphs to text items of "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"
        switch (switchCase) {
          case 2:
            glyph = @"⇥";
            break;
          case 3:
            glyph = @"⇤";
            break;
          case 4:
            glyph = @"⌤";
            break;
          case 9:
            glyph = @"Space";
            break;
          case 10:
            glyph = @"⌦";
            break;
          case 11:
            glyph = @"↩";
            break;
          case 16:
            glyph = @"↓";
            break;
          case 23:
            glyph = @"⌫";
            break;
          case 24:
            glyph = @"←";
            break;
          case 25:
            glyph = @"↑";
            break;
          case 26:
            glyph = @"→";
            break;
          case 27:
            glyph = @"⎋";
            break;
          case 28:
            glyph = @"⌧";
            break;
          case 98:
            glyph = @"⇞";
            break;
          case 99:
            glyph = @"⇪";
            break;
          case 100:
            glyph = @"←";
            break;
          case 101:
            glyph = @"→";
            break;
          case 102:
            glyph = @"↖";
            break;
          case 104:
            glyph = @"↑";
            break;
          case 105:
            glyph = @"↘";
            break;
          case 106:
            glyph = @"↓";
            break;
          case 107:
            glyph = @"⇟";
            break;
          case 111:
            glyph = @"F1";
            break;
          case 112:
            glyph = @"F2";
            break;
          case 113:
            glyph = @"F3";
            break;
          case 114:
            glyph = @"F4";
            break;
          case 115:
            glyph = @"F5";
            break;
          case 116:
            glyph = @"F6";
            break;
          case 117:
            glyph = @"F7";
            break;
          case 118:
            glyph = @"F8";
            break;
          case 119:
            glyph = @"F9";
            break;
          case 120:
            glyph = @"F10";
            break;
          case 121:
            glyph = @"F11";
            break;
          case 122:
            glyph = @"F12";
            break;
          case 135:
            glyph = @"F13";
            break;
          case 136:
            glyph = @"F14";
            break;
          case 137:
            glyph = @"F15";
            break;
          case 140:
            glyph = @"⏏";
            break;
          case 143:
            glyph = @"F16";
            break;
          case 144:
            glyph = @"F17";
            break;
          case 145:
            glyph = @"F18";
            break;
          case 146:
            glyph = @"F19";
            break;
        }

        if (glyph) {
          [newSet setObject:glyph forKey:@"glyph"];
        }

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

//  NSLog(@"explain after: %@", newSet);
  return newSet;
}

- (void)readMenuItems:(NSString*)applicationName withBlock:(void (^)(NSDictionary *))callback
{
  NSLog(@"About to call readMenuItems with %@", applicationName);
  
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
        NSMutableArray *set = [[NSMutableArray alloc] init];
        
        for (NSUInteger j = 0; j <= numItems; j++) {
          NSAppleEventDescriptor *innerDesc = [desc descriptorAtIndex:j];
          if (!innerDesc) continue;
          
//          NSLog(@"inner desc: %@", innerDesc);
          NSString *str = [innerDesc stringValue];
          if (str) {
            [set addObject:str];
            
            if ([set count] > 1) {
              NSDictionary *newMerged = [self explainOrKeep:set];
              if ([newMerged count] > 2 && ([newMerged objectForKey:@"char"] || [newMerged objectForKey:@"glyph"])) {
                [info setObject:newMerged forKey:newMerged[@"name"]];
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
            }
          }
          
          NSDictionary *newMerged = [self explainOrKeep:set];
            if ([newMerged count] > 2 && ([newMerged objectForKey:@"char"] || [newMerged objectForKey:@"glyph"])) {
            
            [info setObject:newMerged forKey:newMerged[@"name"]];
            [set removeAllObjects];
          } else {
            [set removeAllObjects];
          }
        }
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
    NSWorkspace *workspace = [NSWorkspace sharedWorkspace];
    NSRunningApplication* currentAppInfo = [workspace frontmostApplication];
    __block NSString *newAppName = [currentAppInfo localizedName];
    if ([newAppName isEqualToString:@"ShortcutWizard"]) {
        NSLog(@"Switching to ShortcutWizard - TODO: SHOW UI");
        return;
    }
    self.currentApplicationName = newAppName;
    [self updateApplicationIcon:currentAppInfo];
  
    __block NSString *newAppIconPath = self.currentIconPath;

    // todo: combine this with similar calls below
    NSDictionary *currentShortcuts = [self.shortcuts objectForKey:newAppName];
    NSInteger currentShortcutsCount = [currentShortcuts count];
    if (currentShortcutsCount) {
        // Case 1 - our shortcuts already exist in memory
        NSLog(@"CASE 1 - for %@ found: %ld", newAppName, currentShortcutsCount);
      
        [self updateProps:@{
            @"applicationName": newAppName,
            @"applicationIconPath": newAppIconPath,
            @"shortcuts": currentShortcuts
        }];
    } else {
//        [self updateProps:@{@"applicationName": newAppName,
//                            @"applicationIconPath": newAppIconPath}];
      
        // Case 2 - Read from user defaults:
        NSDictionary *shortcuts = [[NSUserDefaults standardUserDefaults] dictionaryForKey:@"shortcuts"];
        if (shortcuts) {
            self.shortcuts = shortcuts;
            NSLog(@"CASE 2 - shortcuts from user defaults count: %ld, keys: %@", [self.shortcuts count], [self.shortcuts allKeys]);
//            NSInteger shortcutCount = [shortcuts count];
          NSDictionary *appilcationShortcuts = [self.shortcuts objectForKey:newAppName];
          if (appilcationShortcuts) {
                [self updateProps:@{
                    @"applicationName": newAppName,
                    @"applicationIconPath": newAppIconPath,
                    @"shortcuts": appilcationShortcuts
                }];
                return;
          }
        }
      
      
        NSLog(@"Calling readMenuItems with name: %@, already have keys: %@", newAppName, [self.shortcuts allKeys]);
        [self readMenuItems:newAppName withBlock:^(NSDictionary *shortcuts) {
          
            NSLog(@"CASE 3 - returned block count: %ld", [shortcuts count]);
            if (self.shortcuts) {
              
              NSMutableDictionary *merge = [NSMutableDictionary dictionaryWithDictionary:self.shortcuts];
              [merge addEntriesFromDictionary:[[NSDictionary alloc] initWithObjectsAndKeys:shortcuts, newAppName, nil]];
              
              NSLog(@"inside case3 and self.shortcuts existed already, merged = %@", merge);
              self.shortcuts = [NSDictionary dictionaryWithDictionary:merge];
            } else {
              self.shortcuts = [[NSDictionary alloc] initWithObjectsAndKeys:shortcuts, newAppName, nil];
            }
          
            [self updateProps:@{
                @"applicationName": newAppName,
                @"applicationIconPath": newAppIconPath,
                @"shortcuts": shortcuts
            }];

            NSUserDefaults *standardUserDefaults = [NSUserDefaults standardUserDefaults];
            if (standardUserDefaults) {
                [standardUserDefaults setObject:self.shortcuts forKey:@"shortcuts"];
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
