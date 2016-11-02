'use strict';
const { ipcRenderer } = require('electron');
const readShortcuts = require('./readShortcuts.js');
console.log('import readShortcuts: ', readShortcuts);

window.onload = function () {
	ipcRenderer.on('background-start-task', (appName) => {
		ipcRenderer.send('background-response', {
			result: readShortcuts(),
			appName: appName
		});
	});
};
