var $ = require('NodObjC')
$.framework('Foundation');
$.framework('OSAKit');

var SWMenuExecutor = $.NSObject.extend('SWMenuExecutor');

// TODO: fix property syntax
SWMenuExecutor.ivar = $.ivar('nonatomic', 'strong', 'NSDictionary', 'scripts');// @property(nonatomic, strong) NSDictionary *scripts;

SWMenuExecutor.addMethod('clickMenu:withDictionary:', 'void', function(self, _cmd, appName, shortcut) {
    $.NSLog($("----- hit clickMenu with: %@ and %@", appName, shortcut));
    let executeMenu = SWMenuExecutor('scriptForKey', $("executeMenu"));
    let errorInfo;
    let menuName = shortcut('objectForKey', $("menuName"));
    let itemName = shortcut('objectForKey', $("name"));
    $.NSLog($("Calling executeMenu with: %@ %@ %@", appName, itemName, menuName));
    let desc = executeMenu('executeHandlerWithName', $("executeMenu"), 'arguments', [appName, itemName, menuName], 'error', errorInfo);
    $.NSLog(@"event desc: %@", desc);
    $.NSLog(@"event error: %@", errorInfo);
});

SWMenuExecutor.addMethod('loadAndCompileApplescript:', 'OSAScript', function(self, _cmd, path) {
    let source = $.NSString('stringWithContentsOfFile', $.NSBundle('mainBundle')('pathForResource', path, 'ofType', $("scpt"),
                                                 'encoding', $.NSUTF8StringEncoding, 'error', null); // TODO: nsnull or just "null" or "nil"?
    let hold = $.OSAScript('alloc')('initWithSource', source);
    let errorInfo;
    let compiled = hold('compileAndReturnError', errorInfo);
    if (!compiled) {
      $.NSLog($("Compile failed: %@", errorInfo));
      return null;
    }
    
    return hold;
});

SWMenuExecutor.addMethod('scriptForKey:', 'OSAScript', function(self, _cmd, key) {
    let instance = SWMenuExecutor('singleton');
    let script = instance.scripts('objectForKey', key);
    if (!script) {
      script = SWMenuExecutor('loadAndCompileApplescript', key);
    }
    
    return script;
});

SWMenuExecutor.register();
