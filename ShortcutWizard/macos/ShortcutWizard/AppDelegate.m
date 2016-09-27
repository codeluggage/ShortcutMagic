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
  NSRect screenRect;
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
    // TODO: 
    // check for: NSAppleScriptErrorMessage
    // - compileAndReturnError:
    // Compiles the receiver, if it is not already compiled.
    // - executeAndReturnError:
    // Executes the receiver, compiling it first if it is not already compiled.
    // - executeAppleEvent:error:
    // Executes an Apple event in the context of the receiver, as a means of allowing the application to invoke a handler in the script.

    NSString *source = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:path ofType:@"scpt"]
                        encoding:NSUTF8StringEncoding error:nil];
    OSAScript *hold = [[OSAScript alloc] initWithSource:source language:[OSALanguage languageForName:@"JavaScript"]];
  

//    NSURL *fileUrl = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:path ofType:@"scpt"]];
//    NSLog(@"Applescript url: %@", [fileUrl absoluteString]);
//
    NSDictionary<NSString *,id> *errorInfo;
//    NSAppleScript *hold = [[NSAppleScript alloc] initWithContentsOfURL:fileUrl error:&errorInfo];
//    NSLog(@"Applescript hold: %@", hold);
//    NSLog(@"Applescript error: %@", errorInfo);

    BOOL compiled = [hold compileAndReturnError:&errorInfo];
    if (compiled) {
        NSLog(@"Compiled successfully");
    } else {
        NSLog(@"Compile failed: %@", errorInfo);
    }

    return hold;
}

- (NSArray *)unwrapArrayValue:(NSAppleEventDescriptor *)desc
{
    NSMutableArray *mutable = [[NSMutableArray alloc] init];
    NSInteger numItems = [desc numberOfItems];
    for (NSUInteger j = 0; j < numItems; j++) {
        NSAppleEventDescriptor *secondDesc = [desc descriptorAtIndex:j];
        NSString *obj = [self unwrapValue:secondDesc];
        NSLog(@"inner loop 1 with descriptor: %@ obj: %@", secondDesc, obj);

        if (!obj) {
            NSAppleEventDescriptor *keywordDescriptor = [secondDesc descriptorForKeyword:'utxt'];
            obj = [keywordDescriptor stringValue];
            NSLog(@"inner loop 2 with descriptor: %@ obj: %@", keywordDescriptor, obj);
            if (!obj) {
                NSAppleEventDescriptor *lastDescriptor = [secondDesc descriptorForKeyword:'usrf'];
                obj = [lastDescriptor stringValue];
                NSLog(@"inner loop 3 with descriptor: %@ obj: %@", lastDescriptor, obj);
            }
        }

        if (obj) {
            [mutable addObject:obj];
        }
    }

    return [NSArray arrayWithArray:mutable];
}

- (NSString *)unwrapValue:(NSAppleEventDescriptor *)desc
{
    NSString *obj = [desc stringValue];
    if (!obj) {
        desc = [desc descriptorForKeyword:'utxt'];
        obj = [desc stringValue];
    }

    if (!obj) {
        desc = [desc descriptorForKeyword:'usrf'];
        NSInteger numItems = [desc numberOfItems];
        if (numItems > 1) {
            for (NSUInteger j = 0; j < numItems; j++) {
                NSAppleEventDescriptor *subsub = [desc descriptorAtIndex:j];
                NSString *obj = [subsub stringValue];
                NSLog(@"inner loop 1 with descriptor: %@ obj: %@", subsub, obj);
                if (!obj) {
                    NSAppleEventDescriptor *keywordDescriptor = [subsub descriptorForKeyword:'utxt'];
                    obj = [keywordDescriptor stringValue];
                    NSLog(@"inner loop 2 with descriptor: %@ obj: %@", keywordDescriptor, obj);
                    if (!obj) {
                        NSAppleEventDescriptor *lastDescriptor = [subsub descriptorForKeyword:'usrf'];
                        obj = [lastDescriptor stringValue];
                        NSLog(@"inner loop 3 with descriptor: %@ obj: %@", lastDescriptor, obj);
                    }
                }
            }
        } else {
            obj = [desc stringValue];
        }
    }

    return obj;
}

- (NSMutableArray *)unwrapUsrf:(NSAppleEventDescriptor *)desc ignoreWords:(NSArray *)words
{
    NSMutableArray *mutable = [[NSMutableArray alloc] init];
    NSInteger numItems = [desc numberOfItems];

    for (NSUInteger j = 0; j <= numItems; j++) {
        NSAppleEventDescriptor *secondDesc = [desc descriptorAtIndex:j];
        AEKeyword keywordForIndex = [desc keywordForDescriptorAtIndex:j];
      
        NSString *obj = [secondDesc stringValue];

        if (!obj) {
            NSAppleEventDescriptor *keywordDescriptor = [secondDesc descriptorForKeyword:'utxt'];
            obj = [keywordDescriptor stringValue];
            NSLog(@"inner loop 2 with descriptor: %@ obj: %@", keywordDescriptor, obj);
            if (!obj) {
                NSAppleEventDescriptor *lastDescriptor = [secondDesc descriptorForKeyword:'usrf'];
              
              NSAppleEventDescriptor *holdParam = [secondDesc paramDescriptorForKeyword:keywordForIndex];
              obj = [holdParam stringValue];
              if (obj && ![words containsObject:obj]) {
                [mutable addObject:obj];
              }
              NSAppleEventDescriptor *holdAttribute = [secondDesc attributeDescriptorForKeyword:keywordForIndex];
              obj = [holdAttribute stringValue];
              if (obj && ![words containsObject:obj]) {
                [mutable addObject:obj];
              }
              
              obj = [lastDescriptor stringValue];
              if (obj && ![words containsObject:obj]) {
                [mutable addObject:obj];
              }
            }
        } else {
          NSLog(@"inner loop 1 with obj: %@", obj);
          if (obj && ![words containsObject:obj]) {
              [mutable addObject:obj];
          }
        }
    }

    return mutable;
}

- (NSString *)unwrapUtxt:(NSAppleEventDescriptor *)desc
{
    NSString *obj = [desc stringValue];
    if (!obj) {
        desc = [desc descriptorForKeyword:'utxt'];
        obj = [desc stringValue];
    }

    return obj;
}

- (NSString*)fourCharNSStringForFourCharCode:(FourCharCode)aCode
{
  char fourChar[5] = {(aCode >> 24) & 0xFF, (aCode >> 16) & 0xFF, (aCode >> 8) & 0xFF, aCode & 0xFF, 0};
  
  NSString *fourCharString = [NSString stringWithCString:fourChar encoding:NSUTF8StringEncoding];
  
  return fourCharString;
}

- (void)readMenuItems:(NSString*)applicationName withBlock:(void (^)(NSArray *))block
{
    NSLog(@"About to call readMenuItems with %@", applicationName);

    // NSAppleEventDescriptor *desc = [self.appleScript executeHandlerWithName:@"readMenuItems"
    //     arguments:@[applicationName] error:&errorInfo];
  
  NSArray *applicationShortcuts = [self.shortcuts objectForKey:applicationName];
  if (applicationShortcuts) {
    block([NSArray arrayWithArray:applicationShortcuts]);
    return;
  }

    [[NSOperationQueue mainQueue] addOperationWithBlock: ^{
        NSDictionary<NSString *,id> *errorInfo;
        NSAppleEventDescriptor *desc = [self.appleScript executeHandlerWithName:@"readShortcutMenuItems"
            arguments:@[applicationName] error:&errorInfo];
        desc = [desc coerceToDescriptorType:typeAEList];
        if (errorInfo) {
            NSLog(@"error: %@", errorInfo);
        }

        NSLog(@"=========================================");

        NSMutableArray* info = [[NSMutableArray alloc] init] ;
        NSInteger numItems = [desc numberOfItems];
        NSLog(@"Found number of items: %ld", numItems);
      
        for (NSInteger i = 0; i < numItems; i++) {
            NSAppleEventDescriptor *usrfDesc = [[desc descriptorAtIndex:i] descriptorForKeyword:'usrf'];
          NSInteger usrfNumItems = [usrfDesc numberOfItems];
          if (usrfNumItems) {
            NSMutableArray *unwrappedUsrf = [self unwrapUsrf:usrfDesc ignoreWords:@[
                // Remove these
                @"title",
                @"AXMenuItemCmdModifiers",
                @"AXMenuItemCmdVirtualKey",
                @"AXMenuItemCmdGlyph",
            ]];

            // Replace this one
            NSInteger usrfCmdCharIndex = [unwrappedUsrf indexOfObject:@"AXMenuItemCmdChar"];
            if (usrfCmdCharIndex != NSNotFound) {
              if ([unwrappedUsrf count] == 3) {
                [unwrappedUsrf replaceObjectAtIndex:usrfCmdCharIndex withObject:@"cmd"];
              } else {
                [unwrappedUsrf removeObjectAtIndex:usrfCmdCharIndex];
              }
            }

            NSLog(@"With usrf: %@, found %ld, unwarpped: %@", usrfDesc, usrfNumItems, unwrappedUsrf);
            if (unwrappedUsrf) {
                [info addObject:unwrappedUsrf];
            }
          }

            NSLog(@"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< end %ld", i);
        }


        // NSAppleEventDescriptor *listDescriptor = [descriptor coerceToDescriptorType:typeAEList];
        // NSLog(@"%@", listDescriptor);
        // NSMutableArray *result = [[NSMutableArray alloc] init];
        // for (NSInteger i = 0; i < [listDescriptor numberOfItems]; ++i) {
        //     AEKeyword keyword = [listDescriptor keywordForDescriptorAtIndex:i];
        //     NSString *finalString = [[listDescriptor descriptorForKeyword:keyword] stringValue];
          
        //     if (finalString) {
        //         NSLog(@"inserting %@", finalString);
        //         [result addObject:finalString];
        //     }
        // }
        // NSLog(@"%@", result);
        NSLog(@"return value from applescript: %@", info);
        NSLog(@"-----------------------------------------------");
      
      if (!self.shortcuts) {
        self.shortcuts = [[NSDictionary alloc] initWithObjectsAndKeys:info, applicationName, nil];
      } else {
        // We checked for existence of applicationName above
        NSMutableDictionary *newDict = [[NSMutableDictionary alloc] initWithDictionary:self.shortcuts copyItems:YES];
        [newDict setObject:info forKey:applicationName];
      }
        block([NSArray arrayWithArray:info]);
    }];
}

- (void)prepareProps
{
    // NSLog([[notification userInfo] description]);
    // NSString *newAppName = [[[NSWorkspace sharedWorkspace] frontmostApplication] localizedName];
    // [currentAppInfo localizedName]


    NSString *previousIconPath = self.currentIconPath;
    NSString *previousApplicationName = self.currentApplicationName;

    NSWorkspace *workspace = [NSWorkspace sharedWorkspace];
    NSRunningApplication* currentAppInfo = [workspace frontmostApplication];
    NSString *newAppName = [currentAppInfo localizedName];
    if ([newAppName isEqualToString:@"ShortcutWizard"]) {
        NSLog(@"Switching to ShortcutWizard - NO UPDATES HAPPENING");
        return;
    }
    self.currentApplicationName = newAppName;

    [self readMenuItems:self.currentApplicationName withBlock:^(NSArray *shortcuts){
        [self updateApplicationIcon:currentAppInfo];
        if (!self.props) {
            self.props = @{
                @"applicationName": self.currentApplicationName,
                @"applicationIconPath": self.currentIconPath,
                @"shortcuts": shortcuts
            };
        } else {
            NSMutableDictionary *newDict = [NSMutableDictionary dictionaryWithDictionary:self.props];
            newDict[@"applicationName"] = self.currentApplicationName;
            newDict[@"applicationIconPath"] = self.currentIconPath;
            newDict[@"shortcuts"] = shortcuts;
            self.props = [NSDictionary dictionaryWithDictionary:newDict];
        }
    }];
}

- (void)triggerAppSwitch
{
    [self prepareProps];
    // self.rootView.appProperties = self.props; // moved to after the block finishes
}

-(void)readShortcuts:(NSArray *)info 
{
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
        NSLog(@"########################################################## ICON EXISTS");
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
      
          NSLog(@"Applescript: %@", self.appleScript);

        NSRect screenRect = [AppDelegate screenResolution];
        NSLog(@"Got the screen rect: >>>>>>>>>");
        NSLog([NSString stringWithFormat:@"%.1fx%.1f",screenRect.size.width, screenRect.size.height]);

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


    NSRunningApplication* currentAppInfo = [self.sharedWorkspace frontmostApplication];

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
