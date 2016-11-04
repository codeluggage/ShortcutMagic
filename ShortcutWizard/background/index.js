'use strict';
const { ipcRenderer } = require('electron');
const readShortcuts = require('../shared/readShortcuts');

console.log('background/index.js - outside window.onload');
window.onload = function () {
	console.log('background/index.js - inside window.onload');
	ipcRenderer.on('background-start-task', (appName) => {
		console.log('#3 - background/index.js - ipcRenderer.send("background-response" with task');
		ipcRenderer.send('background-response', {
			result: readShortcuts(appName),
			appName: appName
		});
	});
};
