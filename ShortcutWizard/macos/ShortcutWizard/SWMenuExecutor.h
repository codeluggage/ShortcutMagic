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

@protocol SWMenuExecutorDelegate

- (NSString *)currentApplicationName;
- (void)readMenuItems:(NSString*)applicationName withBlock:(void (^)(NSDictionary *))callback;
- (void)mergeAndSaveShortcuts:(NSDictionary *)shortcuts withName:(NSString *)name;

@end


@interface SWMenuExecutor : NSObject <RCTBridgeModule>

- (instancetype)initWithDelegate:(id)delegate;

@property(nonatomic, weak) id delegate;

@end

#endif /* SWMenuExecutor_h */
