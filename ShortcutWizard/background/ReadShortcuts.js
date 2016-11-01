var $ = require('NodObjC');
$.import('OSAKit');

function compileAndRunNameFetch() {
	// console.log('========== entered compileAndRunNameFetch');
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
	// console.log('executed getting name! ', executed);

	return executed('stringValue');
}

module.exports = function readShortcuts(shortcutName) {
	// create an NSString of the applescript command that will be run
	// var command = $('tell application "System Preferences" activate set current pane to pane id "com.apple.preference.security" reveal anchor "Privacy_Accessibility" of current pane end tell');
	// var bundle = $.NSBundle('mainBundle')('pathForResource', dirName, 'ofType', $("scpt"));

	var pool = $.NSAutoreleasePool('alloc')('init')
	var dirName = $(__dirname + '/readMenuItems.scpt');
	var encoding = $.NSUTF8StringEncoding;
	var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
	var hold = $.OSAScript('alloc')('initWithSource', source);

	var errorInfo = $.alloc($.NSDictionary);
	var compiled = hold('compileAndReturnError', errorInfo.ref());

	if (!compiled) {
	    return null;
	}

	var arrayArgs = $.NSMutableArray('alloc')('init');
	var shortcutNameString;
	if (shortcutName) {
		shortcutNameString = $(shortcutName);
	} else {
		shortcutNameString = compileAndRunNameFetch();
	}

	arrayArgs('addObject', shortcutNameString);
	var executed = hold('executeHandlerWithName', $("readShortcuts"), 'arguments', arrayArgs, 'error', errorInfo.ref());

	if (executed) {
		// TODO: Handle this raw data better
		return "" + executed;
	} else {
		return "no executed available"
	}
};