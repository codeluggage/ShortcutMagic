//
//  SWApplescriptManager.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWApplescriptManager_h
#define SWApplescriptManager_h

#import "RCTBridgeModule.h"
#import <OSAKit/OSAKit.h>


@interface SWApplescriptManager : NSObject <RCTBridgeModule>

+ (NSAppleEventDescriptor  * __nullable)readShortcutsWithName:(NSString  * __nullable)name
	error:(NSDictionary<NSString *, id> * __nullable * __nullable)errorInfo;
+ (void)readMenuItems:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback;
+ (void)readWindowOfApp:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback;
+ (void)readWindowsOfApp:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback;
+ (NSString *)windowNameOfApp:(NSString * __nonnull)applicationName;


@property(nonatomic, strong) NSDictionary * __nullable scripts;

@end

#endif /* SWApplescriptManager_h */
