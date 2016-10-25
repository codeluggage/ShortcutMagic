#import "ShortcutWizard.h"
#import "RCTBridge.h"
#import "RCTJavaScriptLoader.h"
#import "SWApplescriptManager.h"
#import "SWAccessibility.h"
#import "SWFavorites.h"


@implementation ShortcutWizard

const static NSString *s_defaultWindow = @"default";
const static NSString *s_windowPositions = @"windowPositions";

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
    holdSelf.currentApplicationWindowName = [SWApplescriptManager windowNameOfApp:newAppName];
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
      // TODO: Load more (windowPositions) than just shortcuts
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
  
  [self save];
}

// TODO: Pull out saving from "prepareProps" to here
// TODO: Make it idempotent and not overwriting existing values
- (void)load
{
    NSLog(@"WARNING: OVERWRITING SHORTCUTS AND WINDOWPOSITIONS");
    self.shortcuts = [[NSUserDefaults standardUserDefaults] dictionaryForKey:@"shortcuts"];
    self.windowPositions = [NSMutableDictionary dictionaryWithDictionary:[[NSUserDefaults standardUserDefaults] dictionaryForKey:s_windowPositions]];
}

// TODO: Deconstruct saving for performance/speed
- (void)save
{
  NSUserDefaults *standardUserDefaults = [NSUserDefaults standardUserDefaults];
  if (standardUserDefaults) {
    if (self.shortcuts) {
      [standardUserDefaults setObject:self.shortcuts forKey:@"shortcuts"];
    }
    if (self.currentApplicationName) {
       [standardUserDefaults setObject:self.currentApplicationName forKey:@"currentApplicationName"];
    }
    if (self.currentApplicationWindowName) {
       [standardUserDefaults setObject:self.currentApplicationWindowName forKey:@"currentApplicationWindowName"];
    }
    if (self.windowPositions) {
       [standardUserDefaults setObject:self.windowPositions forKey:s_windowPositions];
    }
    
    [standardUserDefaults synchronize];
  }
}

- (void)triggerAppSwitch
{
//    if (self.windowPositions) {
//      
//    } else {
//      // TODO: Load more (windowPositions) than just shortcuts
//      NSDictionary *windowPositions = [[NSUserDefaults standardUserDefaults] dictionaryForKey:s_windowPositions];
//      if ([windowPositions count]) {
//        self.windowPositions = [NSMutableDictionary dictionaryWithDictionary:windowPositions];
//      }
//    }
  
  
    [self prepareProps];
  
    self.currentApplicationWindowName = [SWApplescriptManager windowNameOfApp:self.currentApplicationName];
  
    if (!self.windowPositions) {
//      self.windowPositions = [[NSMutableDictionary alloc] init];
      return;
    }
  
    NSMutableDictionary *currentWindows = [self.windowPositions objectForKey:self.currentApplicationName];
  if (!currentWindows) {
    return;
  }
  
    NSDictionary *windowPositions = currentWindows[self.currentApplicationWindowName];
    if (!windowPositions) {
      windowPositions = [currentWindows objectForKey:s_defaultWindow];
    }
  
    NSRect savedPos = NSRectFromString([windowPositions objectForKey:@"windowPosition"]);
    if (NSIsEmptyRect(savedPos)) {
      return;
    }
  
    [self.window setFrame:savedPos display:YES animate:YES];
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

-(void)updateProps:(NSDictionary *)newProps
{
    NSLog(@"Sending new props with shortcut: %@ count: %ld", [newProps objectForKey:@"applicationName"], [[newProps objectForKey:@"shortcuts"] count]);
    if (!newProps) {
      return;
    }

    if (self.props) {
      [newProps enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        self.props[key] = obj;
      }];
    } else {
      self.props = [NSMutableDictionary dictionaryWithDictionary:newProps];
    }

    // Update react side:
    self.rootView.appProperties = self.props;
}

- (void)updateShortcutWithAppName:(NSString *)appName withShortcut:(NSDictionary *)shortcut
{
  if ([shortcut count] == 0) {
    NSLog(@"PROBLEM: updatedFavorite is not expected length");
    return;
  }
  
  if ([self.shortcuts count] == 0) {
    NSLog(@"PROBLEM: self.shortcuts are not expected length");
    return;
  }
  
    NSMutableDictionary *applicationDicts = [NSMutableDictionary dictionaryWithDictionary:self.shortcuts];
    NSMutableDictionary *shortcuts = [NSMutableDictionary dictionaryWithDictionary:[applicationDicts objectForKey:appName]];
    [shortcuts setObject:shortcut forKey:shortcut[@"name"]];
    [applicationDicts setObject:shortcuts forKey:appName];
    self.shortcuts = [NSDictionary dictionaryWithDictionary:applicationDicts];
    [self save];
}

-(id)init
{
    if(self = [super init]) {
      // TODO: Quit if the user says no? Explain about potential alternative app version in the app store that has no accessibility needed because of limited functionality?
        [SWAccessibility requestAccess];
      
        [self load];
      
        __block ShortcutWizard *holdSelf = self;
        [SWFavorites registerFavoriteSaveBlock:^(NSDictionary * _Nonnull updatedFavorite) {
          [holdSelf updateShortcutWithAppName:self.currentApplicationName withShortcut:updatedFavorite];
        }];
      
        NSRect screenRect = [ShortcutWizard screenResolution];
        NSLog(@"Got the screen rect: >>>>>>>>>");
        NSLog(@"%.1fx%.1f",screenRect.size.width, screenRect.size.height);

        // TODO: Can this be sent from javascript so everything is configured in javascript?
        NSRect contentSize = NSMakeRect(screenRect.size.width - 400, screenRect.size.height - 200, 200, 450); // initial size of main NSWindow

//        SWWindow *window = [[SWWindow alloc] initWithContentRect:contentSize
        NSWindow *window = [[NSWindow alloc] initWithContentRect:contentSize
//            styleMask:NSBorderlessWindowMask
            styleMask:NSTitledWindowMask
            backing:NSBackingStoreBuffered
//            defer:NO];
            defer:YES];

//      NSLog(@"window size:%i-%i : %i - %i", self.window.frame.size.width, self.window.frame.size.height, self.window.frame.positon.x, self.window.frame.position.y);
        NSLog(@"window size:%f-%f", self.window.frame.size.width, self.window.frame.size.height);
        NSLog(@"window pos:%f-%f", self.window.frame.origin.x, self.window.frame.origin.y);

        NSWindowController *windowController = [[NSWindowController alloc] initWithWindow:window];

        [window setTitleVisibility:NSWindowTitleHidden];
        [window setTitlebarAppearsTransparent:YES];
        // [window setAppearance:[NSAppearance appearanceNamed:NSAppearanceNameAqua]];
        [window setOpaque:NO];
        [window setAlphaValue:0.7];
        [window setHasShadow:YES];
        [window setLevel:NSFloatingWindowLevel];
//        [window setWorksWhenModal:YES];
//      window.worksWhenModal = YES;

        [windowController setShouldCascadeWindows:NO];
        [windowController setWindowFrameAutosaveName:@"ShortcutWizard"];


        [windowController showWindow:window];

        self.windowController = windowController;
        [window setDelegate:self];
        self.window = window;
        [self setUpApplicationMenu];
    }

    return self;
}

- (void)listeningApplicationActivated:(NSNotification *)notification
{
    NSLog(@"Inside listeningApplicationActivated");
    [self triggerAppSwitch];
}

- (void)listeningApplicationLaunched:(NSNotification *)notification
{
    NSLog(@"Inside listeningApplicationLaunched! ");
    [self triggerAppSwitch];
}

- (void)applicationDidFinishLaunching:(__unused NSNotification *)aNotification
{
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

- (void)windowDidMove:(NSNotification *)notification
{
  NSLog(@"************** window did move ****** ");
  [self updateWindowPositions];
}


- (void)windowDidResize:(NSNotification *)notification
{
  NSLog(@"************** window did resize ******");
  [self updateWindowPositions];
}

- (void)updateWindowPositions
{
  if (![self currentApplicationName]) {
    return;
  }

  self.currentApplicationWindowName = [SWApplescriptManager windowNameOfApp:self.currentApplicationName];
  
  if (![self windowPositions]) {
    self.windowPositions = [[NSMutableDictionary alloc] init];
  }
  
  NSMutableDictionary *currentWindows = [NSMutableDictionary dictionaryWithDictionary:[self.windowPositions objectForKey:self.currentApplicationName]];
    if (!currentWindows) {
      currentWindows = [[NSMutableDictionary alloc] init];
    }
  
  // TODO: Save position of focused application too:
//    NSString *position = applicationWindows[@"position"];
//    if (!position) {
//      position = NSStringFromRect(NSZeroRect);
//    }
  
  NSDictionary *newWindow = @{
//                              @"position": position,
                              @"windowPosition":NSStringFromRect([self.window frame])
                              };
  
  currentWindows[s_defaultWindow] = newWindow; // Always set default so the fallback is the most recent updated window
  if (self.currentApplicationWindowName) {
    currentWindows[self.currentApplicationWindowName] = newWindow;
  }
  
  self.windowPositions[self.currentApplicationName] = [NSDictionary dictionaryWithDictionary:currentWindows];
  [self save];
}

@end
