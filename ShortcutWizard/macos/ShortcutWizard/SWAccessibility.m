//
//  SWAccessibility.m
//  ShortcutWizard
//
//  Created by Matias Forbord on 12/10/16.
//  Copyright © 2016 ShortcutWizard. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "SWAccessibility.h"

@implementation SWAccessibility

+(void)requestAccess
{
  // general API:
//  Boolean AXIsProcessTrustedWithOptions(CFDictionaryRef options);
  
  // API with bridging:
//  NSDictionary *options = @{(__bridge id) kAXTrustedCheckOptionPrompt : @YES};
//  BOOL accessibilityEnabled = AXIsProcessTrustedWithOptions((__bridge CFDictionaryRef) options);

  // another bridging example:
//  NSDictionary *options = @{(id)kAXTrustedCheckOptionPrompt: @YES};
//  if(!AXIsProcessTrustedWithOptions((CFDictionaryRef)options)) {
//    
//  } else {
//    
//  }
  
  // manually force accessibility for debug:
  // sudo sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db "INSERT or REPLACE INTO access values ('kTCCServiceAccessibility', 'com.company.app', 0, 1, 0, NULL);"
  
  
  
}

@end

