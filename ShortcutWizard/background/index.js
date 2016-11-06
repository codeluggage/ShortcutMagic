'use strict';
const { ipcRenderer } = require('electron');
const readShortcuts = require('../shared/readShortcuts');

window.onload = function () {
	ipcRenderer.on('webview-parse-shortcuts', (event, appName) => {
		ipcRenderer.send('main-parse-shortcuts-callback', readShortcuts(appName));
	});
};
