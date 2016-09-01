#import "OverlayWindow.h"
#import "RCTViewManager.h"

@interface TransparentView : RCTViewManager
@end

@implementation TransparentView

RCT_EXPORT_MODULE()

- (UIView *)view
{
  return [[OverlayWindow alloc] init];
}

@end