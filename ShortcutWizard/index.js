'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
var Datastore = require('nedb');
var db = new Datastore({
	filename: `${__dirname}/db/shortcuts.db`,
	autoload: true
});


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

function loadOrReloadShortcuts(appName) {
	console.log('loadOrReloadShortcuts with appName', appName);

	if (!appName) {
		backgroundWindow.webContents.send('webview-parse-shortcuts', appName);
	} else {
		// TODO: This is not going to work until appName is known before this point
		db.find({
			name: appName
		}, function(err, res) {
			console.log('loaded shortcuts: ', res);
			if (err) {
				console.log('errored during db find: ', err);
				return;
			}

			if (res != [] && res.length > 0) {
				mainWindow.webContents.send('update-shortcuts', res);
			} else {
				backgroundWindow.webContents.send('webview-parse-shortcuts', appName);
			}
		});
	}
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
	loadOrReloadShortcuts(); // TODO: Why isn't this updating correctly?
});

ipcMain.on('main-parse-shortcuts-callback', function(event, payload) {
	console.log('#3 - root index.js, ipc on main-parse-shortcuts-callback, storing shortcuts ');
	db.insert(payload, function(err, res) {
		console.log('finished inserting shortcuts in db: ', res);
	});

	mainWindow.webContents.send('update-shortcuts', payload)
});

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	console.log('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	loadOrReloadShortcuts(appName);
});
