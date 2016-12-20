'use strict';
const { ipcRenderer } = require('electron');
const readShortcutsObj = require('../shared/readShortcuts');
const readShortcuts = readShortcutsObj();
const executeMenuItem = require('../shared/executeMenuItem')

window.onload = function () {
	ipcRenderer.on('webview-parse-shortcuts', (event, appName) => {
		ipcRenderer.send('main-parse-shortcuts-callback', readShortcuts.readShortcuts(appName));
	});

	ipcRenderer.on('webview-execute-menu-item', (event, appName, listItem, menu) => {
		executeMenuItem(appName, listItem, menu);
	});

	// This handler works sync not async
	ipcRenderer.on('read-last-app-name', (event) => {
		event.returnValue = readShortcuts.readAppName();
	});
};
