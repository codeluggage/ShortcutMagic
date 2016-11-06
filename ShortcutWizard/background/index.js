'use strict';
const { ipcRenderer } = require('electron');
const readShortcuts = require('../shared/readShortcuts');
const appSwitchListener = require('../shared/appSwitchListener');

window.onload = function () {
	ipcRenderer.on('webview-parse-shortcuts', (event, appName) => {
		ipcRenderer.send('main-parse-shortcuts-callback', readShortcuts(appName));
	});

	appSwitchListener(function(notification) {
		ipcRenderer.send('main-app-switched-notification', notification);
	});
};
