const { ipcRenderer } = require('electron');
const readShortcuts = require('./readShortcuts');
const unwrapShortcuts = require('./unwrapShortcuts');

window.onload = function () {
	console.log('entered background windowonload, with readShortcuts variable: ', readShortcuts);

	ipcRenderer.on('background-start', (appName) => {
	console.log('entered background ipcrenderer.on');


		let shortcuts = readShortcuts(appName);
		console.log(shortcuts);
		let unwrapped = unwrapShortcuts(shortcuts);
		console.log(unwrapped);

		ipcRenderer.send('background-response', {
			result: unwrapped,
			appName: appName
		});
	});
};
