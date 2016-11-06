'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
var Datastore = require('nedb');
var db = new Datastore({
	filename: `${__dirname}/shortcuts.db`,
	autoload: true
});

// Setting unique value constraint on name
db.ensureIndex({
	fieldName: 'name',
	unique: true
}, function (err) {
	if (err) {
		console.log('ERROR: db.ensureIndex failed to set unique constraint', err);
	}
});

app.setName("ShortcutWizard");

let mainWindow;
let backgroundTaskRunnerWindow;
let backgroundListenerWindow;

function createWindows() {
	mainWindow = createMainWindow();
	backgroundTaskRunnerWindow = createBackgroundTaskRunnerWindow();
	backgroundListenerWindow = createBackgroundListenerWindow();
}

function onClosed() {
	mainWindow = null;
	backgroundTaskRunnerWindow = null;
	backgroundListenerWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		width: 350,
		height: 800,
		title: "ShortcutWizard",
		alwaysOnTop: true,
		acceptFirstClick: true,
		transparent: true,
		frame: false,
		// backgroundColor: '#2c3e5022'
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	win.setPosition(1100, 100);

	return win;
}

function createBackgroundTaskRunnerWindow() {
	const win = new BrowserWindow({
		show: false,
	});

	console.log('#1 load window:');
	win.loadURL(`file://${__dirname}/background/index.html`);
	return win;
}

function createBackgroundListenerWindow() {
	const win = new BrowserWindow({
		show: false,
	});

	console.log('loaded listener window');
	win.loadURL(`file://${__dirname}/background/listener.html`);
	return win;
}

function loadOrReloadShortcuts(appName) {
	console.log('loadOrReloadShortcuts with appName', appName);

	if (!appName) {
		console.log('sending webview-parse-shortcuts with appName');
		backgroundTaskRunnerWindow.webContents.send('webview-parse-shortcuts'); // Send without name to reload current
	} else {
		loadWithPeriods(appName);
	}
}

function updateRenderedShortcuts(shortcuts) {
	mainWindow.webContents.send('update-shortcuts', shortcuts);
}

function saveWithoutPeriods(payload) {
	var stringified = JSON.stringify(payload.shortcuts);
	stringified = stringified.replace(/\./g, 'u002e');
	payload.shortcuts = JSON.parse(stringified);
	console.log('about to upsert in db: ', payload.shortcuts);

	db.update({
		name: payload.name
	},
	payload, {
		upsert: true
	}, function(err, res) {
		if (err) {
			console.log('ERROR: upserting in db got error: ', err);
		} else {
			console.log('finished upserting shortcuts in db: ');
		}
	});
}

function loadWithPeriods(appName) {
	// TODO: This is not going to work until appName is known before this point
	db.find({
		name: appName
	}, function(err, res) {
		console.log('loaded shortcuts: ');
		if (err) {
			console.log('errored during db find: ', err);
			return;
		}

		if (res != [] && res.length > 0) {
			var shortcuts = res[0];
			var stringified = JSON.stringify(shortcuts.shortcuts);
			stringified = stringified.replace(/u002e/g, '.');
			shortcuts.shortcuts = JSON.parse(stringified);
			console.log('sending shortcuts to be rendered: ', shortcuts);
			mainWindow.webContents.send('update-shortcuts', shortcuts);
		} else {
			console.log('sending webview-parse-shortcuts with appName', appName);
			backgroundTaskRunnerWindow.webContents.send('webview-parse-shortcuts', appName);
		}
	});
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', () => {
	if (!mainWindow || !backgroundListenerWindow || !backgroundTaskRunnerWindow) {
		createWindows();
	}
});

app.on('ready', () => {
	createWindows();
	loadOrReloadShortcuts();
});

ipcMain.on('main-app-switched-notification', function(event, appName) {
	console.log('app switched to', appName);
	// TODO: add css spinner when this is running
	loadOrReloadShortcuts(appName);
});

ipcMain.on('main-parse-shortcuts-callback', function(event, payload) {
	console.log('#3 - root index.js, ipc on main-parse-shortcuts-callback, upserting shortcuts in db: ');
	updateRenderedShortcuts(payload);
	saveWithoutPeriods(payload);
});

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	console.log('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	loadOrReloadShortcuts(appName);
});

ipcMain.on('rendering-ready', function(event) {
	// TODO: replace with shortcutwizard
	updateRenderedShortcuts(loadWithPeriods("Electron"));
});
