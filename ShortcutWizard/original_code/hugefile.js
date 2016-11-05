// Raw code for creating a mac menu bar app in electron:

var path = require('path')
var events = require('events')
var fs = require('fs')

var electron = require('electron')
var app = electron.app
var Tray = electron.Tray
var BrowserWindow = electron.BrowserWindow

var extend = require('extend')
var Positioner = require('electron-positioner')

function create (opts) {
  if (typeof opts === 'undefined') opts = {dir: app.getAppPath()}
  if (typeof opts === 'string') opts = {dir: opts}
  if (!opts.dir) opts.dir = app.getAppPath()
  if (!(path.isAbsolute(opts.dir))) opts.dir = path.resolve(opts.dir)
  if (!opts.index) opts.index = 'file://' + path.join(opts.dir, 'index.html')
  if (!opts.windowPosition) opts.windowPosition = (process.platform === 'win32') ? 'trayBottomCenter' : 'trayCenter'
  if (typeof opts.showDockIcon === 'undefined') opts.showDockIcon = false

  // set width/height on opts to be usable before the window is created
  opts.width = opts.width || 400
  opts.height = opts.height || 400
  opts.tooltip = opts.tooltip || ''

  app.on('ready', appReady)

  var menubar = new events.EventEmitter()
  menubar.app = app

  // Set / get options
  menubar.setOption = function (opt, val) {
    opts[opt] = val
  }

  menubar.getOption = function (opt) {
    return opts[opt]
  }

  return menubar

  function appReady () {
    if (app.dock && !opts.showDockIcon) app.dock.hide()

    var iconPath = opts.icon || path.join(opts.dir, 'IconTemplate.png')
    if (!fs.existsSync(iconPath)) iconPath = path.join(__dirname, 'example', 'IconTemplate.png') // default cat icon

    var cachedBounds // cachedBounds are needed for double-clicked event
    var defaultClickEvent = opts.showOnRightClick ? 'right-click' : 'click'

    menubar.tray = opts.tray || new Tray(iconPath)
    menubar.tray.on(defaultClickEvent, clicked)
    menubar.tray.on('double-click', clicked)
    menubar.tray.setToolTip(opts.tooltip)

    var supportsTrayHighlightState = false
    try {
      menubar.tray.setHighlightMode('never')
      supportsTrayHighlightState = true
    } catch (e) {}

    if (opts.preloadWindow) {
      createWindow()
    }

    menubar.showWindow = showWindow
    menubar.hideWindow = hideWindow
    menubar.emit('ready')

    function clicked (e, bounds) {
      if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return hideWindow()
      if (menubar.window && menubar.window.isVisible()) return hideWindow()
      cachedBounds = bounds || cachedBounds
      showWindow(cachedBounds)
    }

    function createWindow () {
      menubar.emit('create-window')
      var defaults = {
        show: false,
        frame: false
      }

      var winOpts = extend(defaults, opts)
      menubar.window = new BrowserWindow(winOpts)

      menubar.positioner = new Positioner(menubar.window)

      menubar.window.on('blur', function () {
        opts.alwaysOnTop ? emitBlur() : hideWindow()
      })

      if (opts.showOnAllWorkspaces !== false) {
        menubar.window.setVisibleOnAllWorkspaces(true)
      }

      menubar.window.on('close', windowClear)
      menubar.window.loadURL(opts.index)
      menubar.emit('after-create-window')
    }

    function showWindow (trayPos) {
      if (supportsTrayHighlightState) menubar.tray.setHighlightMode('always')
      if (!menubar.window) {
        createWindow()
      }

      menubar.emit('show')

      if (trayPos && trayPos.x !== 0) {
        // Cache the bounds
        cachedBounds = trayPos
      } else if (cachedBounds) {
        // Cached value will be used if showWindow is called without bounds data
        trayPos = cachedBounds
      } else if (menubar.tray.getBounds) {
        // Get the current tray bounds
        trayPos = menubar.tray.getBounds()
      }

      // Default the window to the right if `trayPos` bounds are undefined or null.
      var noBoundsPosition = null
      if ((trayPos === undefined || trayPos.x === 0) && opts.windowPosition.substr(0, 4) === 'tray') {
        noBoundsPosition = (process.platform === 'win32') ? 'bottomRight' : 'topRight'
      }

      var position = menubar.positioner.calculate(noBoundsPosition || opts.windowPosition, trayPos)

      var x = (opts.x !== undefined) ? opts.x : position.x
      var y = (opts.y !== undefined) ? opts.y : position.y

      menubar.window.setPosition(x, y)
      menubar.window.show()
      menubar.emit('after-show')
      return
    }

    function hideWindow () {
      if (supportsTrayHighlightState) menubar.tray.setHighlightMode('never')
      if (!menubar.window) return
      menubar.emit('hide')
      menubar.window.hide()
      menubar.emit('after-hide')
    }

    function windowClear () {
      delete menubar.window
      menubar.emit('after-close')
    }

    function emitBlur () {
      menubar.emit('focus-lost')
    }
  }
}




////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////



// ----------
var $ = require('NodObjC')
$.framework('Foundation')
var pool = $.NSAutoreleasePool('alloc')('init')
var string = $.NSLog('%@',BrowserWindow)
pool('drain')
// ----------


// SWMenuExecutor file:

$.framework("RCTBridgeModule.h")  // TODO: how to import regular files?
$.framework("OSAKit")

@interface SWMenuExecutor : NSObject <RCTBridgeModule>

@property(nonatomic, strong) NSDictionary *scripts;

@end

#endif /* SWMenuExecutor_h */


$.framework(Foundation)
$.framework("SWMenuExecutor.h")

@implementation SWMenuExecutor

let singletonInstance = $.SWMenuExecutor('alloc')('init');
singletonInstance.scripts = {};

function clickMenu(let appName = $.NSString, let shortcut = $.NSDictionary) {

    // TODO: how to multithread with nodobjc?
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        $.NSLog("----- hit clickMenu with: %@ and %@", appName, shortcut);
        let executeMenu = $.SWMenuExecutor('scriptForKey', "executeMenu");
        let errorInfo = $.NSDictionary('alloc')('init');
        menuName = $.shortcut('objectForKey', "menuName");
        itemName = $.shortcut('objectForKey' "name");
        $.NSLog(@"Calling executeMenu with: %@ %@ %@", appName, itemName, menuName);

        desc = $.executeMenu('executeHandlerWithName', "executeMenu", 'arguments', [appName, itemName, menuName], 'error', &errorInfo); // TODO: How to handle references?
        NSLog(@"event desc: %@", desc);
        NSLog(@"event error: %@", errorInfo);
    });
}

function loadAndCompileApplescript(let path = $.NSString)
{
  let source = $.NSString('stringWithContentsOfFile', $.NSBundle('mainBundle')('pathForResource', 'path', 'ofType', "scpt"),
                                               'encoding', 'NSUTF8StringEncoding', 'error', 'nil');
  let hold = $.OSAScript('alloc')('initWithSource', 'source');
  let errorInfo = $.NSDictionary('alloc')('init');
  let compiled = $.hold('compileAndReturnError', &errorInfo);
  if (!compiled) {
    $.NSLog(@"Compile failed: %@", errorInfo);
    return nil;
  }
  
  return hold;
}

function scriptForKey(let key = $.NSString)
{
  let instance = $.SWMenuExecutor(singleton);
  let script = $.instance.scripts('objectForKey', key);
  if (!script) {
    script = $.SWMenuExecutor('loadAndCompileApplescript', key);
  }
  
  return script;
}

@end

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// got this far
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////




$.framework('Cocoa');
$.framework('Foundation');
let SWWindow = require("SWWindow.h");

class ShortcutWizard : NSObject <NSApplicationDelegate, NSWindowDelegate, RCTBridgeDelegate>

//@property (strong, nonatomic) SWWindow *window;
@property (strong, nonatomic) NSWindow *window;
@property (nonatomic, readonly) RCTBridge *bridge;
@property (strong, nonatomic) NSWorkspace *sharedWorkspace;
@property (strong, nonatomic) NSWindowController *windowController;

@property (strong, nonatomic) NSString *currentApplicationName;
@property (strong, nonatomic) NSString *currentApplicationWindowName;
@property (strong, nonatomic) NSString *currentIconPath;
@property (strong, nonatomic) NSMutableDictionary *props;
@property (strong, nonatomic) NSDictionary *shortcuts;
@property (strong, nonatomic) NSMutableDictionary *windowPositions;
@property (strong, nonatomic) RCTRootView *rootView;

@end


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


//
//  SWApplescriptManager.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWApplescriptManager_h
#define SWApplescriptManager_h

#import "RCTBridgeModule.h"
#import <OSAKit/OSAKit.h>


@interface SWApplescriptManager : NSObject <RCTBridgeModule>

+ (NSAppleEventDescriptor  * __nullable)readShortcutsWithName:(NSString  * __nullable)name
    error:(NSDictionary<NSString *, id> * __nullable * __nullable)errorInfo;
+ (void)readMenuItems:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback;
+ (void)readWindowOfApp:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback;
+ (void)readWindowsOfApp:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback;
+ (NSString * __nonnull)windowNameOfApp:(NSString * __nonnull)applicationName;


@property(nonatomic, strong) NSDictionary * __nullable scripts;

@end

#endif /* SWApplescriptManager_h */


//
//  SWApplescriptManager.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWApplescriptManager.h"

@implementation SWApplescriptManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(loadShortcutsForApp:(NSString *)appName callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [SWApplescriptManager readMenuItems:appName withBlock:^(NSDictionary *shortcuts) {
      callback(@[[NSNull null], shortcuts]); // node.js convention for error as first param
    }];
  });
}

static SWApplescriptManager *singletonInstance = nil;

+ (SWApplescriptManager *)singleton
{
  if (singletonInstance == nil) {
    singletonInstance = [[SWApplescriptManager alloc] init];
    singletonInstance.scripts = @{};
  }
  
  return singletonInstance;
}




+ (NSAppleEventDescriptor * __nullable)readShortcutsWithName:(NSString  * __nullable)name
                                            error:(NSDictionary<NSString *, id> * __nullable * __nullable)errorInfo
{
  if (!name || [name isEqualToString:@""]) {
    // TODO: Set errorInfo
    NSLog(@"ERROR - no name given to readShortcutsWithName");
    return nil;
  }
  
  OSAScript *readShortcuts = [SWApplescriptManager scriptForKey:@"readMenuItems"];
  return [readShortcuts executeHandlerWithName:@"readShortcuts" arguments:@[name] error:errorInfo];
}





+ (OSAScript *)loadAndCompileApplescript:(NSString *)path
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

+ (OSAScript *)scriptForKey:(NSString *)key
{
  SWApplescriptManager *instance = [SWApplescriptManager singleton];
  OSAScript *script = [instance.scripts objectForKey:key];
  if (!script) {
      script = [SWApplescriptManager loadAndCompileApplescript:key];
  }
  
  return script;
}

+ (void)readMenuItems:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback
{
  NSLog(@"About to call readMenuItems with %@", applicationName);
  
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    NSDictionary<NSString *,id> *errorInfo;
    NSAppleEventDescriptor *desc = [SWApplescriptManager readShortcutsWithName:applicationName error:&errorInfo];
    
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
              NSDictionary *newMerged = [SWApplescriptManager explainOrKeep:set];
              if ([newMerged count] > 2 && ([newMerged objectForKey:@"char"] || [newMerged objectForKey:@"glyph"])) {
                [info setObject:newMerged forKey:newMerged[@"name"]];
                [set removeAllObjects];
              }
            }
            
            continue;
          }
          
          for (NSUInteger i = 0; i <= [innerDesc numberOfItems]; i++) {
            NSAppleEventDescriptor *innerDescriptor2 = [innerDesc descriptorAtIndex:i];
            if (!innerDescriptor2) {
              continue;
            }
            
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
            
            NSDictionary *newMerged = [SWApplescriptManager explainOrKeep:set];
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
    
    callback([NSDictionary dictionaryWithDictionary:info]);
  }];
}

+ (NSDictionary *)explainOrKeepWindow:(NSMutableArray *)set
{
    NSLog(@"explainOrKeepWindow before: %@", set);
  
  if ([set count] < 5) return nil;
  
  __block NSMutableDictionary *newSet = [[NSMutableDictionary alloc] init];
  
  newSet[@"name"] = set[0];
  __block NSRect rect = NSMakeRect([set[1] floatValue], [set[2] floatValue], [set[3] floatValue], [set[4] floatValue]);
  [newSet setObject:NSStringFromRect(rect) forKey:@"position"];
  return newSet;
}

+ (NSDictionary *)explainOrKeep:(NSMutableArray *)set
{
  //  NSLog(@"explainOrKeep before: %@", set);
  
  if ([set count] < 2) return nil;
  
  __block NSMutableDictionary *newSet = [[NSMutableDictionary alloc] init];
  
  newSet[@"name"] = set[0];
  __block BOOL nextCmdChar = NO;
  __block BOOL nextCmdMod = NO;
  __block BOOL nextCmdGlyph = NO;
  __block BOOL nextPosition = NO;
  __block BOOL nextMenuName = NO;
  
  [set enumerateObjectsUsingBlock:^(NSString *obj, NSUInteger idx, BOOL * _Nonnull stop) {
    // Skip first index - that is always the name
    if (obj && idx != 0) {
      if (nextPosition) {
        nextPosition = NO;
        [newSet setObject:obj forKey:@"position"];
      } else if (nextMenuName) {
        nextMenuName = NO;
        [newSet setObject:obj forKey:@"menuName"];
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
      } else if ([obj isEqualToString:@"menuName"]) {
        nextMenuName = YES;
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

+ (void)readWindowsOfApp:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback
{
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    OSAScript *readWindowsOfApp = [SWApplescriptManager scriptForKey:@"readWindowsOfApp"];
    NSDictionary<NSString *,id> *errorInfo;
    
    NSAppleEventDescriptor *desc = [readWindowsOfApp executeHandlerWithName:@"readWindowsOfApp" arguments:@[applicationName] error:&errorInfo];
    
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
              NSDictionary *newMerged = [SWApplescriptManager explainOrKeep:set];
              if ([newMerged count] > 2 && ([newMerged objectForKey:@"char"] || [newMerged objectForKey:@"glyph"])) {
                [info setObject:newMerged forKey:newMerged[@"name"]];
                [set removeAllObjects];
              }
            }
            
            continue;
          }
          
          for (NSUInteger i = 0; i <= [innerDesc numberOfItems]; i++) {
            NSAppleEventDescriptor *innerDescriptor2 = [innerDesc descriptorAtIndex:i];
            if (!innerDescriptor2) {
              continue;
            }
            
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
            
            NSDictionary *newMerged = [SWApplescriptManager explainOrKeep:set];
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
    
    callback([NSDictionary dictionaryWithDictionary:info]);
  }];
}

+ (void)readWindowOfApp:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback
{
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    OSAScript *readWindowsOfApp = [SWApplescriptManager scriptForKey:@"readWindowOfApp"];
    NSDictionary<NSString *,id> *errorInfo;
    
    NSAppleEventDescriptor *desc = [readWindowsOfApp executeHandlerWithName:@"readWindowOfApp" arguments:@[applicationName] error:&errorInfo];
    
    if (errorInfo) {
      NSLog(@"+++++++++readWindowOfApp error: %@", errorInfo);
    }
    
    
    NSMutableDictionary* info = [[NSMutableDictionary alloc] init] ;
    NSInteger numItems = [desc numberOfItems];
    NSLog(@"++++++++++++++readWindowOfApp Found number of items: %ld", numItems);
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
            continue;
          }
          
          for (NSUInteger i = 0; i <= [innerDesc numberOfItems]; i++) {
            NSAppleEventDescriptor *innerDescriptor2 = [innerDesc descriptorAtIndex:i];
            if (!innerDescriptor2) {
              continue;
            }
            
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
            
            NSDictionary *newMerged = [SWApplescriptManager explainOrKeepWindow:set];
            if (newMerged) {
              [info addEntriesFromDictionary:newMerged];
              // TODO: break out? make this loop simpler
            }
          }
        }
      }
    }
    
    callback([NSDictionary dictionaryWithDictionary:info]);
  }];
}

+ (NSString * __nonnull)windowNameOfApp:(NSString * __nonnull)applicationName
{
    OSAScript *readWindowsOfApp = [SWApplescriptManager scriptForKey:@"windowNameOfApp"];
    NSDictionary<NSString *,id> *errorInfo;
    NSAppleEventDescriptor *desc = [readWindowsOfApp executeHandlerWithName:@"windowNameOfApp" arguments:@[applicationName] error:&errorInfo];
    
    if (errorInfo) {
      NSLog(@"--------windowNameOfApp error: %@", errorInfo);
      return @"";
    }
    
    return [desc stringValue];
}

@end


//
//  SWAccessibility.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 12/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWAccessibility_h
#define SWAccessibility_h

@interface SWAccessibility : NSObject

+(void)requestAccess;

@end


#endif /* SWAccessibility_h */


//
//  SWAccessibility.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 12/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWAccessibility.h"

@implementation SWAccessibility

+(void)requestAccess
{
  NSLog(@"------------- requestAccess called");
  // general API:
//  Boolean AXIsProcessTrustedWithOptions(CFDictionaryRef options);
  
  // API with bridging:
  NSDictionary *options = @{
                            (__bridge id)kAXTrustedCheckOptionPrompt : @YES
                            };
  BOOL accessibilityEnabled = AXIsProcessTrustedWithOptions((__bridge CFDictionaryRef) options);
  NSLog(@"------------- requestAccess returned %d", accessibilityEnabled);

  // another bridging example:
//  NSDictionary *options = @{(id)kAXTrustedCheckOptionPrompt: @YES};
//  if(!AXIsProcessTrustedWithOptions((CFDictionaryRef)options)) {
//    
//  } else {
//    
//  }
  
  // manually force accessibility for debug:
  // sudo sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db "INSERT or REPLACE INTO access values ('kTCCServiceAccessibility', 'com.company.app', 0, 1, 0, NULL);"
  
  
  
}

@end



//
//  SWFavorites.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 20/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWFavorites_h
#define SWFavorites_h

#import "RCTBridgeModule.h"

typedef void(^FavoriteBlock)(NSDictionary* __nullable);

@interface SWFavorites : NSObject <RCTBridgeModule>

+ (void)registerFavoriteSaveBlock:(void (^ __nonnull) (NSDictionary * __nonnull))callback;

@property(nonatomic, copy) FavoriteBlock __nullable callback;

@end

#endif /* SWFavorites_h */


//
//  SWFavorites.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 20/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWFavorites.h"

@implementation SWFavorites

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(updateFavorite:(NSDictionary *)updatedFavorite)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    SWFavorites *singleton = [SWFavorites singleton];
    if (!singleton.callback) {
      return;
    }
    
    singleton.callback(updatedFavorite);
  });
}

static SWFavorites *singletonInstance = nil;

+ (SWFavorites *)singleton
{
  if (singletonInstance == nil) {
    singletonInstance = [[SWFavorites alloc] init];
    singletonInstance.callback = nil;
  }
  
  return singletonInstance;
}


+ (void)registerFavoriteSaveBlock:(void (^)(NSDictionary * _Nonnull))callback
{
  [SWFavorites singleton].callback = callback;
}

@end