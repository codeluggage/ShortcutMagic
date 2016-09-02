#import "OverlayWindow.h"
#import "RCTTransparentViewManager.h"

@implementation RCTTransparentViewManager

RCT_EXPORT_MODULE()

- (NSWindow *)view
{
  return [[OverlayWindow alloc] init];
}

@end