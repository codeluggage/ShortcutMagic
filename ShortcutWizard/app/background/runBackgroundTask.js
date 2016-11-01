'use strict';
const { ipcRenderer } = require('electron');
var ReadShortcuts = require('../ReadShortcuts.js');

console.log('inside runBackgroundTask.js');
console.log('with ReadShortcuts: ', ReadShortcuts);

console.log('+++++++++++ before runBackgroundTask.js window.onload');
window.onload = function() {

	console.log('+++++++++++ in window.onload');
	
	ipcRenderer.on('parseShortcuts', (appName) => {
		console.log('+++++++++++++++++++ in ipcRenderer.on parseShortcuts');
		ipcRenderer.send('finishedParsingShortcuts', {
			result: ReadShortcuts(appName)
		});
	});
};
