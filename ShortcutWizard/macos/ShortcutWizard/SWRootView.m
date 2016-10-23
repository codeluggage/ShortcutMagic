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
//  NSLog(@"@@@@@@@@@@@@@@@@ hit acceptsFirstMouse with event: %@, super: %d", event, [super acceptsFirstMouse:event]);
  return YES;
}

- (BOOL)acceptsFirstResponder
{
//  NSLog(@"@@@@@@@@@@@@@@@@ hit acceptsFirstResponder, super: %d", [super acceptsFirstResponder]);
  return YES;
}

- (void)mouseDown:(NSEvent *)event
{
//  [super mouseDown:event];
  
  NSLog(@"@@@@@@@@@@@@@@@@ hit mouseDown, event: %@", event);
}

- (void)otherMouseDown:(NSEvent *)event
{
//  [super otherMouseDown:event];
  
  NSLog(@"@@@@@@@@@@@@@@@@ hit othermouseDown, event: %@", event);
}

- (void)rightMouseDown:(NSEvent *)event
{
//  [super rightMouseDown:event];
  
  NSLog(@"@@@@@@@@@@@@@@@@ hit rightmouseDown, event: %@", event);
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
