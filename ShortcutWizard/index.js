'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');


// prevent window being garbage collected
let mainWindow;
let backgroundWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
	backgroundWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600
	});

	win.loadURL(`file://${__dirname}/renderer/index.html`);
	win.on('closed', onClosed);

	return win;
}

function createBackgroundWindow() {
	const win = new BrowserWindow({
		show: false,
		webPreferences: {
			webSecurity: false
		}
	});

	console.log('#1 load window:');
	win.loadURL(`file://${__dirname}/background/index.html`);
	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
	backgroundWindow = createBackgroundWindow();
});

ipcMain.on('background-response', function(event, payload) {
	console.log('#4 - root index.js, ipc on background-response');
	mainWindow.webContents.send('background-response', payload)
});

ipcMain.on('background-start', function(event, payload) {
	console.log('#2 - root index.js, triggered background-start, with webcontents: ', backgroundWindow.webContents);
	backgroundWindow.webContents.send('background-start-task', payload)
});

