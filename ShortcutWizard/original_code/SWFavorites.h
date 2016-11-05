//
//  SWFavorites.h
//  ShortcutWizard
//
//  Created by Matias Forbord on 20/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#ifndef SWFavorites_h
#define SWFavorites_h

#import "RCTBridgeModule.h"

typedef void(^FavoriteBlock)(NSDictionary* __nullable);

@interface SWFavorites : NSObject <RCTBridgeModule>

+ (void)registerFavoriteSaveBlock:(void (^ __nonnull) (NSDictionary * __nonnull))callback;

@property(nonatomic, copy) FavoriteBlock __nullable callback;

@end

#endif /* SWFavorites_h */
