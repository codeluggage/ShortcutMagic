'use strict';
const { ipcRenderer } = require('electron');
const appSwitchListener = require('../shared/appSwitchListener');

window.onload = function () {
	appSwitchListener(function(notification) {
		ipcRenderer.send('main-app-switched-notification', notification);
	});
};
