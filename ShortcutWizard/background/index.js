'use strict';
const { ipcRenderer } = require('electron');
const ReadShortcuts = require('./ReadShortcuts.js');

window.onload = function () {
	ipcRenderer.on('background-start-task', (startTime) => {
		ipcRenderer.send('background-response', {
			result: ReadShortcuts(),
			startTime: startTime
		});
	});
};
