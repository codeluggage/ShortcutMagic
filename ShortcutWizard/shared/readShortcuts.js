'use strict';
var unwrapShortcuts = require('./unwrapShortcuts');
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

function readShortcuts(appName) {
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
		var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', $.NSUTF8StringEncoding, 'error', null);
		var hold = $.OSAScript('alloc')('initWithSource', source);

		// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ?
		// NSDictionary<NSString *,id> *errorInfo;
		var errorInfo = $.alloc($.NSDictionary);
		var compiled = hold('compileAndReturnError', errorInfo.ref());

		if (!compiled) {
		    return null;
		}

		var arrayArgs = $.NSMutableArray('alloc')('init');
		arrayArgs('addObject', appName);
		var executed = hold('executeHandlerWithName', $("readShortcuts"), 'arguments', arrayArgs, 'error', errorInfo.ref());
		if (executed) {
			return executed;
		} else {
			return "executing returned nothing, " + shortcutNameString;
		}
}

module.exports = function() {
	return {
		readShortcuts: function(appName) {
			var shortcutNameString;
			if (appName && typeof appName == "string") {
				shortcutNameString = $(appName);
			}
			if (!shortcutNameString || shortcutNameString('length') == 0) {
				shortcutNameString = compileAndRunNameFetch();
				if (shortcutNameString) {
					shortcutNameString = shortcutNameString('stringValue');
				}
				appName = "" + shortcutNameString;
			}

			var shortcuts = readShortcuts(shortcutNameString);
			var unwrapped = unwrapShortcuts(shortcuts);

			return {
				name: appName,
				shortcuts: unwrapped
			};
		},
		readAppName: function() {
			// TODO: Combine with above to keep DRY
			var shortcutNameString = compileAndRunNameFetch();
			if (shortcutNameString) {
				shortcutNameString = shortcutNameString('stringValue');
			}
			return shortcutNameString;
		}
	}
};
