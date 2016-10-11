#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>
#import <OSAKit/OSAKit.h>
#import "RCTBridge.h"
#import "RCTRootView.h"
#import "SWMenuExecutor.h"

@interface ShortcutWizard : NSObject <NSApplicationDelegate, NSWindowDelegate, RCTBridgeDelegate, SWMenuExecutorDelegate>

@property (strong, nonatomic) NSWindow *window;
@property (nonatomic, readonly) RCTBridge *bridge;
@property (strong, nonatomic) NSWorkspace *sharedWorkspace;
@property (strong, nonatomic) NSString *currentApplicationName;
@property (strong, nonatomic) NSString *currentIconPath;
@property (strong, nonatomic) NSDictionary *props;
@property (strong, nonatomic) NSDictionary *shortcuts;
@property (strong, nonatomic) RCTRootView *rootView;

@property (strong, nonatomic) OSAScript *appleScript;
@property (strong, nonatomic) SWMenuExecutor *menuExecutor;

@end
