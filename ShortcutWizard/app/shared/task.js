'use strict';
var unwrapShortcuts = require('./unwrapShortcuts.js');
var $ = require('NodObjC');
$.import('OSAKit');


function compileAndRunNameFetch() {
	// console.log(bundle);
	var scriptName = "readAppName";
	var encoding = $.NSUTF8StringEncoding;
	var dirName = $(`${__dirname}/${scriptName}.scpt`);
	var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
	var hold = $.OSAScript('alloc')('initWithSource', source);

	// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ? 
	// NSDictionary<NSString *,id> *errorInfo;
	var errorInfo = $.alloc($.NSDictionary);
	var compiled = hold('compileAndReturnError', errorInfo.ref());

	if (!compiled) {
	    $.NSLog("Compile failed: %@", errorInfo);
	    return null;
	}

	var arrayArgs = $.NSMutableArray('alloc')('init');
	arrayArgs('addObject', $("true"));

	var executed = hold('executeHandlerWithName', $(scriptName), 'arguments', arrayArgs, 'error', errorInfo.ref());

	return executed;
}

module.exports = function task(appName) {
		// var appName = "PomoDoneApp";
		// NSToolbarSidebarItem
		// NSToolbarItemGroup
		// NSInspectorBarItem
		// NSToolbarItemConfigWrapper
		// NSToolbarItem
		// NSToolbarItemViewer
		// NSToolbarToggleSidebarItemIdentifier


		// create an NSString of the applescript command that will be run
		// var command = $('tell application "System Preferences" activate set current pane to pane id "com.apple.preference.security" reveal anchor "Privacy_Accessibility" of current pane end tell');

		var pool = $.NSAutoreleasePool('alloc')('init')
		var dirName = $(__dirname + '/readMenuItems.scpt');
		// var bundle = $.NSBundle('mainBundle')('pathForResource', dirName, 'ofType', $("scpt"));
		var encoding = $.NSUTF8StringEncoding;
		var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
		var hold = $.OSAScript('alloc')('initWithSource', source);

		// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ? 
		// NSDictionary<NSString *,id> *errorInfo;
		var errorInfo = $.alloc($.NSDictionary);
		var compiled = hold('compileAndReturnError', errorInfo.ref());

		if (!compiled) {
		    return null;
		}

		var shortcutNameString;
		// if (appName) {
		// 	shortcutNameString = $(appName);
		// } else {
			// console.log('========== about to call compileAndReturnError');
			shortcutNameString = compileAndRunNameFetch();
			// console.log('========== got value ', shortcutNameString);
		// }

		var arrayArgs = $.NSMutableArray('alloc')('init');
		arrayArgs('addObject', shortcutNameString);
		return hold('executeHandlerWithName', $("readShortcuts"), 'arguments', arrayArgs, 'error', errorInfo.ref());
}

// module.exports = function(appName) {
// 	var shortcuts = readShortcuts(appName);
// 	var unwrapped = unwrapShortcuts(shortcuts);
// 	return unwrapped;
// };
