#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>
#import "RCTBridge.h"
#import "SWRootView.h"
#import "SWWindow.h"

@interface ShortcutWizard : NSObject <NSApplicationDelegate, NSWindowDelegate, RCTBridgeDelegate>

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
@property (strong, nonatomic) SWRootView *rootView;

@end
