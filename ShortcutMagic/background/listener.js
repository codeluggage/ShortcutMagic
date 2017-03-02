'use strict';
const { ipcRenderer } = require('electron');
const appSwitchListener = require('../shared/appSwitchListener');

window.onload = function () {
	appSwitchListener(function(appName) {
		ipcRenderer.send('main-app-switched-notification', appName);
	});
};
