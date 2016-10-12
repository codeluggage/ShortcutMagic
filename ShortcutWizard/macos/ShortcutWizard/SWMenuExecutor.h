//
//  SWMenuExecutor.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWMenuExecutor_h
#define SWMenuExecutor_h

#import "RCTBridgeModule.h"
#import <OSAKit/OSAKit.h>

@interface SWMenuExecutor : NSObject <RCTBridgeModule>

@property(nonatomic, strong) NSDictionary *scripts;

@end

#endif /* SWMenuExecutor_h */
