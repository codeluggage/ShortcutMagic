//
//  SWMenuExecutor.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWMenuExecutor.h"

@implementation SWMenuExecutor

RCT_EXPORT_MODULE();

//- (dispatch_queue_t)methodQueue
//{
//  return dispatch_queue_create("com.ShortcutWizard.serialqueue", DISPATCH_QUEUE_SERIAL);
//}

RCT_EXPORT_METHOD(loadShortcutsForApp:(NSString *)appName callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{ 
    [self.delegate readMenuItems:appName withBlock:^(NSDictionary *shortcuts) {
//      NSLog(@"========== RETURNED FROM readMenuItems called from react - about to save");
      [self.delegate mergeAndSaveShortcuts:shortcuts withName:appName];
//      NSLog(@"======== after mergedSaved, self.shortcuts: %@", self.shortcuts);
      callback(@[[NSString stringWithFormat:@"results returned to callback: %@", shortcuts]]);
    }];
  });
}

RCT_EXPORT_METHOD(clickMenu:(NSString *)appName withDictionary:(NSDictionary *)shortcut)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSLog(@"----- hit clickMenu with: %@ and %@", appName, shortcut);
    if ([[self.delegate currentApplicationName] isEqualToString:appName]) {
      // Simply execute the menu
      NSLog(@"clickMenu with app already open - NOT IMPLEMENTED");
    } else {
      // Switch app, then execute menu?
      NSLog(@"clickMenu with app not open - NOT IMPLEMENTED");
    }
  });
}

//RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
//{
//  
//}

- (instancetype)initWithDelegate:(id)delegate
{
  self = [super init];
	if (self && delegate) {
		self.delegate = delegate;
	}

	return self;
}

@end
