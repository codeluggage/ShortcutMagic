'use strict';
const { ipcRenderer } = require('electron');
var RenderShortcuts = require('../RenderShortcuts.js');

console.log('+++++++++++ before runBackgroundTask.js window.onload');
window.onload = function() {
	console.log('+++++++++++ in window.onload');
	ipcRenderer.on('parseShortcuts', (appName) => {
		console.log('+++++++++++++++++++ in ipcRenderer.on parseShortcuts');
		ipcRenderer.send('finishedParsingShortcuts', {
			result: RenderShortcuts(appName)
		});
	});
};
