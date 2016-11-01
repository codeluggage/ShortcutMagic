// var spawn = require('electron-spawn')

// module.exports = function task() {
// 	console.log('inside task.js function ');
// 	var electron = spawn('foo.js', 'bar', 'baz', {
// 		detached: true
// 	});

// 	console.log('inside task.js function - spawned done');

// 	electron.stderr.on('data', function (data) {
// 		console.log('inside task.js stderr ');
// 		console.error(data.toString())
// 	})

// 	electron.stdout.on('data', function (data) {
// 		console.log('inside task.js stdout ');
// 		console.log(data.toString())
// 	})
// }









var $ = require('NodObjC');
$.import('OSAKit');

function compileAndRunNameFetch() {
	console.log('========== entered compileAndRunNameFetch');
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
	console.log('executed getting name! ', executed);

	return executed;
}

module.exports = function task(shortcutName) {
		// var shortcutName = "PomoDoneApp";
		// NSToolbarSidebarItem
		// NSToolbarItemGroup
		// NSInspectorBarItem
		// NSToolbarItemConfigWrapper
		// NSToolbarItem
		// NSToolbarItemViewer
		// NSToolbarToggleSidebarItemIdentifier


		// create an NSString of the applescript command that will be run
		// var command = $('tell application "System Preferences" activate set current pane to pane id "com.apple.preference.security" reveal anchor "Privacy_Accessibility" of current pane end tell');
		console.log('========== entered readShortcuts');

		var pool = $.NSAutoreleasePool('alloc')('init')
		var dirName = $(__dirname + '/readMenuItems.scpt');
		// var bundle = $.NSBundle('mainBundle')('pathForResource', dirName, 'ofType', $("scpt"));
		// $.NSLog(dirName);
		// $.NSLog(bundle);
		// console.log(bundle);
		var encoding = $.NSUTF8StringEncoding;
		var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
		var hold = $.OSAScript('alloc')('initWithSource', source);

		// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ? 
		// NSDictionary<NSString *,id> *errorInfo;
		var errorInfo = $.alloc($.NSDictionary);
		var compiled = hold('compileAndReturnError', errorInfo.ref());

		if (!compiled) {
		    // $.NSLog("Compile failed: %@", errorInfo);
		    return null;
		}

		var arrayArgs = $.NSMutableArray('alloc')('init');
		var shortcutNameString;
		if (shortcutName) {
			shortcutNameString = $(shortcutName);
		} else {
			// console.log('========== about to call compileAndReturnError');
			shortcutNameString = compileAndRunNameFetch();
			// console.log('========== got value ', shortcutNameString);
		}

		arrayArgs('addObject', shortcutNameString);
		// console.log('arrayArgs ', arrayArgs);
		var executed = hold('executeHandlerWithName', $("readShortcuts"), 'arguments', arrayArgs, 'error', errorInfo.ref());
		// $.NSLog($('executed' ));
		// console.log('executed', executed);
		if (executed) {
			return "" + executed;
		} else {
			return "no executed available"
		}
};