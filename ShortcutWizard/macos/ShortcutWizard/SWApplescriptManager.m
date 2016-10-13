//
//  SWApplescriptManager.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 11/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWApplescriptManager.h"

@implementation SWApplescriptManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(loadShortcutsForApp:(NSString *)appName callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [SWApplescriptManager readMenuItems:appName withBlock:^(NSDictionary *shortcuts) {
      callback(@[[NSNull null], shortcuts]); // node.js convention for error as first param
    }];
  });
}

static SWApplescriptManager *singletonInstance = nil;

+ (SWApplescriptManager *)singleton
{
  if (singletonInstance == nil) {
    singletonInstance = [[SWApplescriptManager alloc] init];
    singletonInstance.scripts = @{};
  }
  
  return singletonInstance;
}




+ (NSAppleEventDescriptor * __nullable)readShortcutsWithName:(NSString  * __nullable)name
                                            error:(NSDictionary<NSString *, id> * __nullable * __nullable)errorInfo
{
  if (!name || [name isEqualToString:@""]) {
    // TODO: Set errorInfo
    NSLog(@"ERROR - no name given to readShortcutsWithName");
    return nil;
  }
  
  OSAScript *readShortcuts = [SWApplescriptManager scriptForKey:@"readMenuItems"];
  return [readShortcuts executeHandlerWithName:@"readShortcuts" arguments:@[name] error:errorInfo];
}





+ (OSAScript *)loadAndCompileApplescript:(NSString *)path
{
  NSString *source = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:path ofType:@"scpt"]
                                               encoding:NSUTF8StringEncoding error:nil];
  OSAScript *hold = [[OSAScript alloc] initWithSource:source];
  NSDictionary<NSString *,id> *errorInfo;
  BOOL compiled = [hold compileAndReturnError:&errorInfo];
  if (!compiled) {
    NSLog(@"Compile failed: %@", errorInfo);
    return nil;
  }
  
  return hold;
}

+ (OSAScript *)scriptForKey:(NSString *)key
{
  SWApplescriptManager *instance = [SWApplescriptManager singleton];
  OSAScript *script = [instance.scripts objectForKey:key];
  if (!script) {
      script = [SWApplescriptManager loadAndCompileApplescript:key];
  }
  
  return script;
}

+ (void)readMenuItems:(NSString * __nonnull)applicationName withBlock:(void (^ __nonnull) (NSDictionary * __nullable))callback
{
  NSLog(@"About to call readMenuItems with %@", applicationName);
  
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    NSDictionary<NSString *,id> *errorInfo;
    NSAppleEventDescriptor *desc = [SWApplescriptManager readShortcutsWithName:applicationName error:&errorInfo];
    
    if (errorInfo) {
      NSLog(@"error: %@", errorInfo);
    }
    
    NSMutableDictionary* info = [[NSMutableDictionary alloc] init] ;
    NSInteger numItems = [desc numberOfItems];
    NSLog(@"Found number of items: %ld", numItems);
    for (NSInteger i = 0; i < numItems; i++) {
      
      NSInteger numItems = [desc numberOfItems];
      
      if (numItems) {
        NSMutableArray *set = [[NSMutableArray alloc] init];
        
        for (NSUInteger j = 0; j <= numItems; j++) {
          NSAppleEventDescriptor *innerDesc = [desc descriptorAtIndex:j];
          if (!innerDesc) continue;
          
          //          NSLog(@"inner desc: %@", innerDesc);
          NSString *str = [innerDesc stringValue];
          if (str) {
            [set addObject:str];
            
            if ([set count] > 1) {
              NSDictionary *newMerged = [SWApplescriptManager explainOrKeep:set];
              if ([newMerged count] > 2 && ([newMerged objectForKey:@"char"] || [newMerged objectForKey:@"glyph"])) {
                [info setObject:newMerged forKey:newMerged[@"name"]];
                [set removeAllObjects];
              }
            }
            
            continue;
          }
          
          for (NSUInteger i = 0; i <= [innerDesc numberOfItems]; i++) {
            NSAppleEventDescriptor *innerDescriptor2 = [innerDesc descriptorAtIndex:i];
            if (!innerDescriptor2) {
              continue;
            }
            
            str = [innerDescriptor2 stringValue];
            
            if (str) {
              [set addObject:str];
            } else {
              for (NSUInteger x = 0; x <= [innerDescriptor2 numberOfItems]; x++) {
                NSAppleEventDescriptor *innerDescriptor3 = [innerDescriptor2 descriptorAtIndex:x];
                if (!innerDescriptor3) continue;
                
                str = [innerDescriptor3 stringValue];
                
                if (str) {
                  [set addObject:str];
                } else {
                  for (NSUInteger y = 0; y <= [innerDescriptor3 numberOfItems]; y++) {
                    NSAppleEventDescriptor *innerDescriptor4 = [innerDescriptor3 descriptorAtIndex:y];
                    if (!innerDescriptor4) continue;
                    
                    str = [innerDescriptor4 stringValue];
                    
                    if (str) {
                      [set addObject:str];
                    } else {
                      NSLog(@"must go deeper? leve 4 now %@", innerDescriptor4);
                    }
                  }
                }
              }
            }
            
            NSDictionary *newMerged = [SWApplescriptManager explainOrKeep:set];
            if ([newMerged count] > 2 && ([newMerged objectForKey:@"char"] || [newMerged objectForKey:@"glyph"])) {
              [info setObject:newMerged forKey:newMerged[@"name"]];
              [set removeAllObjects];
            } else {
              [set removeAllObjects];
            }
          }
        }
      }
    }
    
    callback([NSDictionary dictionaryWithDictionary:info]);
  }];
}

+ (NSDictionary *)explainOrKeep:(NSMutableArray *)set
{
  //  NSLog(@"explainOrKeep before: %@", set);
  
  if ([set count] < 2) return nil;
  
  __block NSMutableDictionary *newSet = [[NSMutableDictionary alloc] init];
  
  newSet[@"name"] = set[0];
  __block BOOL nextCmdChar = NO;
  __block BOOL nextCmdMod = NO;
  __block BOOL nextCmdGlyph = NO;
  __block BOOL nextPosition = NO;
  __block BOOL nextMenuName = NO;
  
  [set enumerateObjectsUsingBlock:^(NSString *obj, NSUInteger idx, BOOL * _Nonnull stop) {
    // Skip first index - that is always the name
    if (obj && idx != 0) {
      if (nextPosition) {
        nextPosition = NO;
        [newSet setObject:obj forKey:@"position"];
      } else if (nextMenuName) {
        nextMenuName = NO;
        [newSet setObject:obj forKey:@"menuName"];
      } else if (nextCmdMod) {
        nextCmdMod = NO;
        
        NSString *mod = nil;
        NSInteger switchCase = [obj integerValue];
        
        switch (switchCase) {
          case 0:
            mod = @"⌘";
            break;
          case 1:
            mod = @"⇧⌘";
            break;
          case 2:
            mod = @"⌥⌘";
            break;
          case 3:
            mod = @"⌥⇧⌘";
            break;
          case 4:
            mod = @"⌃⌘";
            break;
          case 5:
            mod = @"⌃⇧⌘";
            break;
          case 6:
            mod = @"⌃⌥⌘";
            break;
          case 7:
            mod = @"⌃⌥⇧⌘";
            break;
            // TOOD: Determine what '8' is in this key table
            //      case 8:
            //        mod = @"-";
            //        break;
          case 9:
            mod = @"⇧";
            break;
          case 10:
            mod = @"⌥";
            break;
          case 11:
            mod = @"⌥⇧";
            break;
          case 12:
            mod = @"⌃";
            break;
          case 13:
            mod = @"⌃⇧";
            break;
          case 14:
            mod = @"⌃⌥";
            break;
          case 15:
            mod = @"⌃⌥⇧";
            break;
        }
        
        if (mod) {
          [newSet setObject:mod forKey:@"mod"];
        }
      } else if (nextCmdGlyph) {
        nextCmdGlyph = NO;
        
        NSInteger switchCase = [obj integerValue];
        NSString *glyph = nil;
        
        // set menuglyphs to text items of "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"
        switch (switchCase) {
          case 2:
            glyph = @"⇥";
            break;
          case 3:
            glyph = @"⇤";
            break;
          case 4:
            glyph = @"⌤";
            break;
          case 9:
            glyph = @"Space";
            break;
          case 10:
            glyph = @"⌦";
            break;
          case 11:
            glyph = @"↩";
            break;
          case 16:
            glyph = @"↓";
            break;
          case 23:
            glyph = @"⌫";
            break;
          case 24:
            glyph = @"←";
            break;
          case 25:
            glyph = @"↑";
            break;
          case 26:
            glyph = @"→";
            break;
          case 27:
            glyph = @"⎋";
            break;
          case 28:
            glyph = @"⌧";
            break;
          case 98:
            glyph = @"⇞";
            break;
          case 99:
            glyph = @"⇪";
            break;
          case 100:
            glyph = @"←";
            break;
          case 101:
            glyph = @"→";
            break;
          case 102:
            glyph = @"↖";
            break;
          case 104:
            glyph = @"↑";
            break;
          case 105:
            glyph = @"↘";
            break;
          case 106:
            glyph = @"↓";
            break;
          case 107:
            glyph = @"⇟";
            break;
          case 111:
            glyph = @"F1";
            break;
          case 112:
            glyph = @"F2";
            break;
          case 113:
            glyph = @"F3";
            break;
          case 114:
            glyph = @"F4";
            break;
          case 115:
            glyph = @"F5";
            break;
          case 116:
            glyph = @"F6";
            break;
          case 117:
            glyph = @"F7";
            break;
          case 118:
            glyph = @"F8";
            break;
          case 119:
            glyph = @"F9";
            break;
          case 120:
            glyph = @"F10";
            break;
          case 121:
            glyph = @"F11";
            break;
          case 122:
            glyph = @"F12";
            break;
          case 135:
            glyph = @"F13";
            break;
          case 136:
            glyph = @"F14";
            break;
          case 137:
            glyph = @"F15";
            break;
          case 140:
            glyph = @"⏏";
            break;
          case 143:
            glyph = @"F16";
            break;
          case 144:
            glyph = @"F17";
            break;
          case 145:
            glyph = @"F18";
            break;
          case 146:
            glyph = @"F19";
            break;
        }
        
        if (glyph) {
          [newSet setObject:glyph forKey:@"glyph"];
        }
        
      } else if (nextCmdChar) {
        nextCmdChar = NO;
        [newSet setObject:obj forKey:@"char"];
      } else if ([obj isEqualToString:@"menuName"]) {
        nextMenuName = YES;
      } else if ([obj isEqualToString:@"position"]) {
        nextPosition = YES;
      } else if ([obj isEqualToString:@"AXMenuItemCmdModifiers"]) {
        nextCmdMod = YES;
      } else if ([obj isEqualToString:@"AXMenuItemCmdGlyph"]) {
        nextCmdGlyph = YES;
      } else if ([obj isEqualToString:@"AXMenuItemCmdChar"]) {
        nextCmdChar = YES;
      }
    }
  }];
  
  //  NSLog(@"explain after: %@", newSet);
  return newSet;
}



@end
