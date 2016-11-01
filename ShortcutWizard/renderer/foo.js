'use strict';
const { app, BrowserWindow } = require('electron');

console.log('inside foo2.js');


// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	console.log('foo2.js onClosed');
	mainWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		show: false,
		frame: false,
		// focusable: false // maybe useful?
		skipTaskbar: true
	});

	win.loadURL(`file://${__dirname}/renderer/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('ready', () => {
	console.log('foo2.js app ready');
	mainWindow = createMainWindow();
});
