//
//  SWApplescriptManager.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWApplescriptManager_h
#define SWApplescriptManager_h

#import <OSAKit/OSAKit.h>

@interface SWApplescriptManager : NSObject

+ (NSAppleEventDescriptor  * __nullable)readShortcutsWithName:(NSString  * __nullable)name
	error:(NSDictionary<NSString *, id> * __nullable * __nullable)errorInfo;

@property(nonatomic, strong) NSDictionary * __nullable scripts;

@end

#endif /* SWApplescriptManager_h */
