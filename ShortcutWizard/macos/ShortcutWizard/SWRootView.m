//  SWRootView.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 23/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import "SWRootView.h"

@implementation SWRootView

- (BOOL)acceptsFirstMouse:(nullable NSEvent *)event
{
  return YES;
}


//
//
//- (void)loadView {
//  NSLog(@"loadView");
//  
//  
//  self.view = [[NSView alloc] initWithFrame:
//               [[app.window contentView] frame]];
//  [self.view setAutoresizingMask:NSViewWidthSizable | NSViewHeightSizable];
//  
//  int opts = (NSTrackingMouseEnteredAndExited | NSTrackingActiveAlways);
//  trackingArea0 = [[NSTrackingArea alloc] initWithRect:self.view.bounds
//                                               options:opts
//                                                 owner:self
//                                              userInfo:nil];
//  [self.view addTrackingArea:trackingArea0];
//  
//  
//}
//- (void)mouseEntered:(NSEvent *)theEvent {
//  NSLog(@"entered");
//  
//  
//  if ([[NSApplication sharedApplication] respondsToSelector:@selector(activateIgnoringOtherApps:)]) {
//    [[NSApplication sharedApplication] activateIgnoringOtherApps:YES];
//  }
//  
//}

@end
