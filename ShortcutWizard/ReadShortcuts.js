var NodObjc = require('NodObjC');
NodObjc.import('OSAKit');

module.exports = function readShortcuts(shortcutName) {
		// NSToolbarSidebarItem
		// NSToolbarItemGroup
		// NSInspectorBarItem
		// NSToolbarItemConfigWrapper
		// NSToolbarItem
		// NSToolbarItemViewer
		// NSToolbarToggleSidebarItemIdentifier


		// create an NSString of the applescript command that will be run
		// var command = NodObjc('tell application "System Preferences" activate set current pane to pane id "com.apple.preference.security" reveal anchor "Privacy_Accessibility" of current pane end tell');

		var pool = NodObjc.NSAutoreleasePool('alloc')('init')
		var dirName = NodObjc(__dirname + '/readMenuItems.scpt');
		// var bundle = NodObjc.NSBundle('mainBundle')('pathForResource', dirName, 'ofType', NodObjc("scpt"));
		NodObjc.NSLog(dirName);
		// NodObjc.NSLog(bundle);
		// console.log(bundle);
		var encoding = NodObjc.NSUTF8StringEncoding;
		var source = NodObjc.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
		var hold = NodObjc.OSAScript('alloc')('initWithSource', source);

		// TODO: How to make this a useable pointer? http://tootallnate.github.io/NodObjC/class.html -> createPointer ? 
		// NSDictionary<NSString *,id> *errorInfo;
		var errorInfo = NodObjc.alloc(NodObjc.NSDictionary);
		var compiled = hold('compileAndReturnError', errorInfo.ref());

		if (!compiled) {
		    NodObjc.NSLog("Compile failed: %@", errorInfo);
		    return null;
		}

		var arrayArgs = NodObjc.NSMutableArray('alloc')('init');
		arrayArgs('addObject', NodObjc(shortcutName));
		console.log('arrayArgs ', arrayArgs);
		var executed = hold('executeHandlerWithName', NodObjc("readShortcuts"), 'arguments', arrayArgs, 'error', errorInfo.ref());
		// NodObjc.NSLog(NodObjc('executed' ));
		console.log('executed', executed);

		return executed;
};