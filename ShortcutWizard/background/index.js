'use strict';
const { ipcRenderer } = require('electron');
const readShortcuts = require('../shared/readShortcuts');
const executeMenuItem = require('../shared/executeMenuItem')

window.onload = function () {
	ipcRenderer.on('webview-parse-shortcuts', (event, appName) => {
		ipcRenderer.send('main-parse-shortcuts-callback', readShortcuts(appName));
	});
	ipcRenderer.on('webview-execute-menu-item', (event, appName, listItem, menu) => {
		executeMenuItem(appName, listItem, menu);
	});
};
