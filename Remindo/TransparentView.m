#import "OverlayWindow.h"
#import "RCTViewManager.h"

@interface RCTTransparentViewManager : RCTViewManager
@end

@implementation RCTTransparentViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  return [[OverlayWindow alloc] init];
}

@end