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

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

function createBackgroundWindow() {
	const win = new BrowserWindow({
		show: false,
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

ipcMain.on('main-parse-shortcuts-callback', function(event, payload) {
	console.log('#4 - root index.js, ipc on main-parse-shortcuts-callback');
	mainWindow.webContents.send('main-parse-shortcuts-callback', payload)
});

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	if (!appName || typeof appName != "string") {
		appName = "PomoDoneApp";
	}
	console.log('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	backgroundWindow.webContents.send('webview-parse-shortcuts', appName)
});

