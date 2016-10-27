var $ = require('NodObjC')
$.framework('Foundation');

module.exports = function() {
  var SWAccessibility = $.NSObject.extend('SWAccessibility');

  SWAccessibility.addMethod('requestAccess', 'void', function(self, _cmd) {
    // TODO: Add applescript call to open system settings and highlight accessibility lock

    // API with bridging:
    var options = $.NSMutableDictionary('alloc')('init');
    // TODO: is it the string kAXTrustedCheckOptionPrompt or some sort of (__bridge id) conversion?
    options('setObject', $.NSNumber('numberWithBool', true), 'forKey', $('kAXTrustedCheckOptionPrompt'));

    // TODO: AXIsProcessTrustedWithOptions is not available here
    var accessibilityEnabled = $.AXIsProcessTrustedWithOptions(options);
    $.NSLog($("------------- requestAccess returned %d"), accessibilityEnabled);

    // general API:
  //  Boolean AXIsProcessTrustedWithOptions(CFDictionaryRef options);
    
    // another bridging example:
  //  NSDictionary *options = @{(id)kAXTrustedCheckOptionPrompt: @YES};
  //  if(!AXIsProcessTrustedWithOptions((CFDictionaryRef)options)) {
  //    
  //  } else {
  //    
  //  }
    
    // manually force accessibility for debug:
    // sudo sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db "INSERT or REPLACE INTO access values ('kTCCServiceAccessibility', 'com.company.app', 0, 1, 0, NULL);"
  });

  SWAccessibility.register();
};