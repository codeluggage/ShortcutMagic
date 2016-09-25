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

- (NSDictionary *)readMenuItems:(NSString*)applicationName
{
    NSDictionary<NSString *,id> *errorInfo;

    NSLog(@"About to call readMenuItems with %@", applicationName);
    NSAppleEventDescriptor *descriptor = [self.appleScript executeHandlerWithName:@"readMenuItems"
        arguments:@[applicationName] error:&errorInfo];
    NSLog(@"error: %@", errorInfo);
    NSLog(@"-----------------------------------------------");


    NSMutableArray* info = [NSMutableArray array] ;
    NSLog(@"Found number of items: %ld", [descriptor numberOfItems]);
  
    for (NSInteger i = 0; i < [descriptor numberOfItems]; i++) {
      
    // This loop should only execute once; [descriptor numberOfItems] = 1
        NSAppleEventDescriptor* subdescriptor = [descriptor descriptorAtIndex:i] ;
        NSInteger nItems = [subdescriptor numberOfItems];
      NSLog(@"outer loop with descriptor: %@ and obj: %@", subdescriptor, [subdescriptor stringValue]);
    // nItems should be 2 x number of values in the record
          
            for (NSUInteger j = 0; j < [subdescriptor numberOfItems]; j++) {
                NSAppleEventDescriptor *subsub = [subdescriptor descriptorAtIndex:j];
                NSString *obj = [subsub stringValue];
                NSLog(@"absolute inner most loop with descriptor: %@ obj: %@", subsub, obj);
                if (obj) {
                    [info addObject:obj];
                }
            }
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

    return @{};
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

    [self updateApplicationIcon:currentAppInfo];


    NSDictionary* shortcuts;

    if ([self.currentApplicationName isEqualToString:@"Evernote"]) {
        NSLog(@"shortcuts for >>>>>>>>>>>>>>> Evernote <<<<<<<<<<<<<<<<<< ");
        shortcuts = @{
            @"Bold text": @[@"cmd", @"b"],
            @"Italicise text": @[@"cmd", @"i"],
            @"Underline text": @[@"cmd", @"u"],
            @"Strikethrough text": @[@"ctrl", @"cmd", @"k"],
            @"New notebook": @[@"cmd", @"shift", @"n"],
            @"New note": @[@"cmd", @"n"],
            @"Edit tag on current note": @[@"alt", @"'"]
        };
    } else if ([self.currentApplicationName isEqualToString:@"Google Chrome"]) {
        NSLog(@"shortcuts for >>>>> Google Chrome<<<<< ");
        shortcuts = @{
            @"Open last closed tab": @[@"ctrl", @"shift", @"t"],
            @"New tab": @[@"cmd", @"t"],
            @"New window": @[@"cmd", @"n"],
        };
    } else if ([self.currentApplicationName isEqualToString:@"Xcode"]) {
        NSLog(@"shortcuts for >>>>> Xcode<<<<< ");
        shortcuts = @{
            @"Open quickly": @[@"cmd", @"shift", @"o"],
            @"Run project": @[@"cmd", @"r"],
            @"Clean project": @[@"cmd", @"shift", @"k"],
        };
    } else if ([self.currentApplicationName isEqualToString:@"iTerm2"]) {
        NSLog(@"shortcuts for >>>>> iTerm2<<<<< ");
        shortcuts = @{
            @"New tab": @[@"cmd", @"t"],
            @"New window": @[@"cmd", @"n"],
            @"Delete word backwards": @[@"ctrl", @"w"],
            @"Go to beginning of line": @[@"ctrl", @"a"],
            @"Go to end of line": @[@"ctrl", @"e"],
            @"Cancel/reset line": @[@"ctrl", @"c"],
        };
    } else if ([self.currentApplicationName isEqualToString:@"Terminal"]) {
        NSLog(@"shortcuts for >>>>> Terminal<<<<< ");
        shortcuts = @{
            @"New tab": @[@"cmd", @"t"],
            @"New window": @[@"cmd", @"n"],
            @"Delete word backwards": @[@"ctrl", @"w"],
            @"Go to beginning of line": @[@"ctrl", @"a"],
            @"Go to end of line": @[@"ctrl", @"e"],
            @"Cancel/reset line": @[@"ctrl", @"c"],
        };
    } else if ([self.currentApplicationName isEqualToString:@"Sublime Text"]) {
        NSLog(@"shortcuts for >>>>> Sublime Text<<<<< ");
        shortcuts = @{
            @"New tab": @[@"cmd", @"t"],
            @"New window": @[@"cmd", @"n"],
            @"Open file": @[@"cmd", @"o"],
            @"Suggest text completion": @[@"ctrl", @"space"],
            @"Open anything": @[@"cmd", @"p"],
            @"Add next occurrence to selection": @[@"cmd", @"d"],
        };
    } else if ([self.currentApplicationName isEqualToString:@"PomoDoneApp"]) {
        NSLog(@"shortcuts for >>>>> PomoDoneApp<<<<< ");
        shortcuts = @{
            @"New task": @[@"cmd", @"n"],
            @"Toggle mini mode": @[@"m"]
        };
    } else if ([self.currentApplicationName isEqualToString:@"ShortcutWizard"]) {
        NSLog(@"shortcuts for >>>>> ShortcutWizard<<<<< ");
        shortcuts = @{
            @"No shortcuts for ShortcutWizard yet!!": @[@"alt"]
        };
    } else if ([self.currentApplicationName isEqualToString:@"Finder"]) {
        NSLog(@"shortcuts for >>>>> Finder<<<<< ");
        shortcuts = @{
            @"New tab": @[@"cmd", @"t"],
            @"New window": @[@"cmd", @"n"],
        };
    } else if ([self.currentApplicationName isEqualToString:@"Skype"]) {
        NSLog(@"shortcuts for >>>>> Skype<<<<< ");
        shortcuts = @{
            @"Move to below chat": @[@"cmd", @"shift", @"right arrow"],
            @"Move to above chat": @[@"cmd", @"shift", @"left arrow"],
        };
    }

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
}

- (void)triggerAppSwitch
{
    [self prepareProps];
    self.rootView.appProperties = self.props;
    [self readMenuItems:self.props[@"applicationName"]];
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
        // testing applescript:
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
