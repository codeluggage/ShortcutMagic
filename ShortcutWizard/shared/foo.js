'use strict';
const { app, BrowserWindow } = require('electron');


// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	console.log('foo.js onClosed');
	mainWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		show: false
	});

	win.loadURL(`file://${__dirname}/renderer/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('ready', () => {
	console.log('foo.js app ready');
	mainWindow = createMainWindow();
});
