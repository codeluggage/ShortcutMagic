//
//  SWFavorites.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 20/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWFavorites.h"

@implementation SWFavorites

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(updateFavorite:(NSDictionary *)updatedFavorite)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    SWFavorites *singleton = [SWFavorites singleton];
    if (!singleton.callback) {
      return;
    }
    
    singleton.callback(updatedFavorite);
  });
}

static SWFavorites *singletonInstance = nil;

+ (SWFavorites *)singleton
{
  if (singletonInstance == nil) {
    singletonInstance = [[SWFavorites alloc] init];
    singletonInstance.callback = nil;
  }
  
  return singletonInstance;
}


+ (void)registerFavoriteSaveBlock:(void (^)(NSDictionary * _Nonnull))callback
{
  [SWFavorites singleton].callback = callback;
}

@end
