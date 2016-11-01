'use strict';
const { ipcRenderer } = require('electron');
const task = require('./readShortcuts.js');

window.onload = function () {
	ipcRenderer.on('background-start-task', (startTime) => {
		ipcRenderer.send('background-response', {
			result: task(),
			startTime: startTime
		});
	});
};
