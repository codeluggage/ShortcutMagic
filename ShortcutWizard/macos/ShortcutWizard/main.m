/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

 #import <Cocoa/Cocoa.h>
 #import "ShortcutWizard.h"

@interface SWApplication : NSApplication
@end

@implementation SWApplication

//- (void)sendEvent:(NSEvent *)anEvent
//{
//  BOOL done = NO;
//  if (![self isActive]) {
//    NSLog(@",,,,,,,,,,,,,,,, hit SWApplication sendEvent: %@", anEvent);
//  //  [super sendEvent:anEvent];
//    
//    // catch first right mouse click, activate app
//    // and hand the event on to the window for further processing
//    NSPoint locationInWindow;
//    NSView *theView = nil;
//    
//    //NSLog(@"a: event type: %i", [anEvent type]);
//    // we do NOT get an NSRightMouseDown event
////    if ([anEvent type] == NSAppKitDefined) {
//      // there seems to be no window assigned with this event at the moment;
//      // but just in case ...
//      NSWindow *theWindow = [anEvent window];
//      if (theWindow) {
//        theView = [[theWindow contentView] hitTest:[anEvent
//                                                    locationInWindow]];
//        locationInWindow = [anEvent locationInWindow];
//      } else {
//        // find window
//        NSEnumerator *enumerator = [[self windows] objectEnumerator];
//        while (theWindow = [enumerator nextObject]) {
//          locationInWindow = [theWindow mouseLocationOutsideOfEventStream];
//          NSView *contentView = [theWindow contentView];
//          theView = [contentView hitTest:locationInWindow];
//          if (theView) {
//            // we found our view
//            //NSLog(@"hit view of class: %@", NSStringFromClass([theView class]));
//            break;
//          }
//        }
//      }
//      if (theView) {
//        // create new event with useful window, location and event values
//        unsigned int flags = [anEvent modifierFlags];
//        NSTimeInterval timestamp = [anEvent timestamp];
//        int windowNumber = [theWindow windowNumber];
//        NSGraphicsContext *context = [anEvent context];
//        
//        // original event is not a mouse down event so the following values are missing
//        int eventNumber = 0; // [anEvent eventNumber]
//        int clickCount = 0; // [anEvent clickCount]
//        float pressure = 1.0; // [anEvent pressure]
//        NSEvent *newEvent = [NSEvent mouseEventWithType:NSRightMouseDown
//                                               location:locationInWindow modifierFlags:flags timestamp:timestamp
//                                           windowNumber:windowNumber context:context eventNumber:eventNumber
//                                             clickCount:clickCount pressure:pressure];
////        if ([theView acceptsFirstMouse:newEvent]) {
//          // activate app and send event to the window
//          [self activateIgnoringOtherApps:YES];
//          [theWindow sendEvent:newEvent];
//          done = YES;
////        }
//      }
////    }
//  }
//  if (!done) {
//    // we did not catch this one
//    [super sendEvent:anEvent];
//  }
//}

@end

 int main(int argc, char * argv[]) {
     @autoreleasepool {
         NSApplication * application = [NSApplication sharedApplication];
         NSMenu *mainMenu = [[NSMenu alloc] initWithTitle:@"ShortcutWizard"];
         [NSApp setMainMenu:mainMenu];
         ShortcutWizard *appDelegate = [[ShortcutWizard alloc] init];
         [application setDelegate:appDelegate];
         [application run];
         return EXIT_SUCCESS;
     }
 }
