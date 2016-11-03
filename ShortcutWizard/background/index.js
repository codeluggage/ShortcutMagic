'use strict';
const { ipcRenderer } = require('electron');
const readShortcuts = require('./readShortcuts.js');
const unwrapShortcuts = require('./unwrapShortcuts.js');
console.log('import readShortcuts: ', readShortcuts);

window.onload = function () {
	ipcRenderer.on('background-start-task', (appName) => {
		let shortcuts = readShortcuts(appName);
		let unwrapped = unwrapShortcuts(shortcuts);

		ipcRenderer.send('background-response', {
			result: unwrapped,
			appName: appName
		});
	});
};
