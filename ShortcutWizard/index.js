'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
var Datastore = require('nedb');
var db = new Datastore({
	filename: `${__dirname}/db/shortcuts.db`,
	autoload: true
});
db.ensureIndex({
	fieldName: 'name',
	unique: true
}, function (err) {
	if (err) {
		console.log('ERROR: db.ensureIndex failed to set unique constraint', err);
	}
});

app.setName("ShortcutWizard");

// prevent window being garbage collected
let mainWindow;
let backgroundTaskRunnerWindow;
let backgroundListenerWindow;

function createWindows() {
	mainWindow = createMainWindow();
	backgroundTaskRunnerWindow = createBackgroundTaskRunnerWindow();
	backgroundListenerWindow = createBackgroundListenerWindow();
}

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
	backgroundTaskRunnerWindow = null;
	backgroundListenerWindow = null;
}

function createMainWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		title: "ShortcutWizard",
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

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
	// console.log('----------------------------------------->');
	// console.log('stringified: ', stringified);
	stringified = stringified.replace(/\./g, 'u002e');
	// stringified = stringified.replace(/\u2022/g, '');
	// stringified = stringified.replace(/…/g, '');
	// console.log('-----------------------------------------');
	// console.log('after replace: ', stringified);
	// console.log('<-----------------------------------------');
	payload.shortcuts = JSON.parse(stringified);
	console.log('about to insert in db: ', payload.shortcuts);

	db.update({
		name: payload.name
	},
	payload, {
		upsert: true
	}, function(err, res) {
		if (err) {
			console.log('ERROR: inserting in db got error: ', err);
		} else {
			console.log('finished inserting shortcuts in db: ');
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
			// console.log('=========================================>');
			// console.log('stringified: ', stringified);
			stringified = stringified.replace(/u002e/g, '.');
			// stringified = stringified.replace(/\u2022/g, '');
			// stringified = stringified.replace(/…/g, '');
			// console.log('=========================================');
			// console.log('after replace: ', stringified);
			// console.log('<=========================================');
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
	console.log('#3 - root index.js, ipc on main-parse-shortcuts-callback, inserting shortcuts in db: ');
	updateRenderedShortcuts(payload);
	saveWithoutPeriods(payload);
});

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	console.log('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	loadOrReloadShortcuts(appName);
});
