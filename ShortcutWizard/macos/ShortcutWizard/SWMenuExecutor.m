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

static SWMenuExecutor *singletonInstance = nil;

+ (SWMenuExecutor *)singleton
{
  if (singletonInstance == nil) {
    singletonInstance = [[SWMenuExecutor alloc] init];
    singletonInstance.scripts = @{};
  }
  
  return singletonInstance;
}

//- (dispatch_queue_t)methodQueue
//{
//  return dispatch_queue_create("com.ShortcutWizard.serialqueue", DISPATCH_QUEUE_SERIAL);
//}

RCT_EXPORT_METHOD(clickMenu:(NSString *)appName withDictionary:(NSDictionary *)shortcut)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      NSLog(@"----- hit clickMenu with: %@ and %@", appName, shortcut);
      OSAScript *executeMenu = [SWMenuExecutor scriptForKey:@"executeMenu"];
      NSDictionary<NSString *,id> *errorInfo;
      NSString *menuName = [shortcut objectForKey:@"menuName"];
      NSString *itemName = [shortcut objectForKey:@"name"];
    NSLog(@"Calling executeMenu with: %@ %@ %@", appName, itemName, menuName);
    
//    NSLog(@"sleeping...");
//    [NSThread sleepForTimeInterval:2.0f];
//    NSLog(@"done sleeping!");
    
      NSAppleEventDescriptor *desc = [executeMenu executeHandlerWithName:@"executeMenu" arguments:@[appName, itemName, menuName] error:&errorInfo];
    NSLog(@"event desc: %@", desc);
    NSLog(@"event error: %@", errorInfo);
  });
}

//RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
//{
//  
//}


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
  SWMenuExecutor *instance = [SWMenuExecutor singleton];
  OSAScript *script = [instance.scripts objectForKey:key];
  if (!script) {
    script = [SWMenuExecutor loadAndCompileApplescript:key];
  }
  
  return script;
}

@end
