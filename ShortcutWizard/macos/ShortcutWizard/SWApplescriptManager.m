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

@end
