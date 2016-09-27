/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>
#import <OSAKit/OSAKit.h>
#import "RCTBridge.h"
#import "RCTRootView.h"

@interface AppDelegate : NSObject <NSApplicationDelegate, NSWindowDelegate>

@property (strong, nonatomic) NSWindow *window;
@property (nonatomic, readonly) RCTBridge *bridge;
@property (strong, nonatomic) NSWorkspace *sharedWorkspace;
@property (strong, nonatomic) NSString *currentApplicationName;
@property (strong, nonatomic) NSString *currentIconPath;
@property (strong, nonatomic) NSDictionary *props;
@property (strong, nonatomic) NSDictionary *shortcuts;
@property (strong, nonatomic) RCTRootView *rootView;

@property (strong, nonatomic) OSAScript *appleScript;

@end
