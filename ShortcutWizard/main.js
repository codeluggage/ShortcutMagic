var $ = require('nodobjc');
$.import('OSAKit');

var pool = $.NSAutoreleasePool('alloc')('init')

// NSToolbarSidebarItem
// NSToolbarItemGroup
// NSInspectorBarItem
// NSToolbarItemConfigWrapper
// NSToolbarItem
// NSToolbarItemViewer
// NSToolbarToggleSidebarItemIdentifier


// create an NSString of the applescript command that will be run
// var command = $('tell application "System Preferences" activate set current pane to pane id "com.apple.preference.security" reveal anchor "Privacy_Accessibility" of current pane end tell');

var dirName = $(__dirname + '/readMenuItems.scpt');
// var bundle = $.NSBundle('mainBundle')('pathForResource', dirName, 'ofType', $("scpt"));
$.NSLog(dirName);
// $.NSLog(bundle);
// console.log(bundle);
var encoding = $.NSUTF8StringEncoding;
var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
var hold = $.OSAScript('alloc')('initWithSource', source);

// TODO: How to make this a useable pointer? http://tootallnate.github.io/NodObjC/class.html -> createPointer ? 
// NSDictionary<NSString *,id> *errorInfo;
var errorInfo = $.alloc($.NSDictionary);
var compiled = hold('compileAndReturnError', errorInfo.ref());

if (!compiled) {
    $.NSLog("Compile failed: %@", errorInfo);
    return null;
}

var arguments = $.NSMutableArray('alloc')('init');
arguments('addObject', $("Google Chrome"));
console.log('arguments ', arguments);
var executed = hold('executeHandlerWithName', $("readShortcuts"), 'arguments', arguments, 'error', errorInfo.ref());
// $.NSLog($('executed' ));
console.log('executed', executed);
