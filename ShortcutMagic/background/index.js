'use strict';

const { ipcRenderer } = require('electron');
const executeMenuItem = require('../shared/executeMenuItem');
const executeShortcut = require('../shared/executeShortcut');


window.onload = function () {
	ipcRenderer.on('webview-execute-menu-item', (event, appName, listItem, menu) => {
		if (!appName) {
			executeMenuItem(appName, listItem, menu);
		}
	});

	// This handler works sync not async
	ipcRenderer.on('read-last-app-name', (event) => {
		event.returnValue = readShortcuts.readAppName();
	});

	ipcRenderer.on('webview-execute-shortcut', (event, appName, listItem) => {
		console.log("webview-execute-shortcut called with ", appName, listItem);
		executeShortcut(appName, listItem);
	});
};
