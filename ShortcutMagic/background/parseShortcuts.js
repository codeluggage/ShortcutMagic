'use strict';

const readShortcutsObj = require('../shared/readShortcuts');
const readShortcuts = readShortcutsObj();


module.exports = function(appName, cb) {
	if (appName) {
		cb(readShortcuts.readShortcuts(appName));
	}
};
