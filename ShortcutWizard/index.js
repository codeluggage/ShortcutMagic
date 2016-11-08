'use strict';
const electronVibrancy = require('electron-vibrancy');
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
var Datastore = require('nedb');
var db = new Datastore({
	filename: `${__dirname}/db/shortcuts.db`,
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
app.dock.hide();

let mainWindow;
const iconPath = path.join(__dirname, 'wizard.png');
console.log('icon path loaded: ', iconPath);
let appIcon = null;
let backgroundTaskRunnerWindow;
let backgroundListenerWindow;
let currentAppName;
let positions = {};


const toggleWindow = () => {
	console.log('togglewindow with isvisible: ', mainWindow.isVisible());
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

const getWindowPosition = () => {
	const windowBounds = mainWindow.getBounds();
	const windowSize = mainWindow.getSize();
	return {
		bounds: windowBounds,
		size: windowSize
	};
}

function savePosition(appName) {
	if (!appName) return;

	positions[appName] = getWindowPosition();
}

function loadPosition(appName) {
	if (!appName) return;

	var hold = positions[appName];
	if (!hold) return;

	mainWindow.setBounds(hold.bounds)
	mainWindow.setSize(hold.size)
}

const showWindow = () => {
	if (currentAppName) {
		var currentPosition = positions[currentAppName];
		if (currentPosition) {
			mainWindow.setBounds(currentPosition.bounds.x, currentPosition.bounds.y);
			mainWindow.setSize(currentPosition.size.x, currentPosition.size.y);
		}
	}

	mainWindow.show()
	mainWindow.focus()
}

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
	appIcon = new Tray(iconPath);
	console.log('created appicon: ', appIcon);
	appIcon.setToolTip('ShortcutWizard!');
	appIcon.on('right-click', toggleWindow);
	appIcon.on('double-click', toggleWindow);
	appIcon.on('click', function (event) {
	  toggleWindow();

	  // TODO: Limit this to only dev mode
	  if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
	    mainWindow.openDevTools({mode: 'detach'})
	  }
	});


	var win = new BrowserWindow({
		width: 350,
		height: 800,
		title: "ShortcutWizard",
		alwaysOnTop: true,
		acceptFirstClick: true,
		transparent: true,
		frame: false,
		// backgroundColor: '#262626'
	});


// 0 - NSVisualEffectMaterialAppearanceBased 10.10+
// 1 - NSVisualEffectMaterialLight 10.10+
// 2 - NSVisualEffectMaterialDark 10.10+
// 3 - NSVisualEffectMaterialTitlebar 10.10+
// 4 - NSVisualEffectMaterialSelection 10.11+
// 5 - NSVisualEffectMaterialMenu 10.11+
// 6 - NSVisualEffectMaterialPopover 10.11+
// 7 - NSVisualEffectMaterialSidebar 10.11+
// 8 - NSVisualEffectMaterialMediumLight 10.11+
// 9 - NSVisualEffectMaterialUltraDark 10.11+

	// Whole window vibrancy with Material 0 and auto resize
	win.on('ready-to-show',function() {
		console.log('loaded window, vibrancy: ', electronVibrancy);
	    // electronVibrancy.SetVibrancy(true, browserWindowInstance.getNativeWindowHandle());
		electronVibrancy.SetVibrancy(win, 0);
	})	;




	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	win.setPosition(1100, 100);

	win.setHasShadow(false);
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
			// console.log('sending shortcuts to be rendered: ', shortcuts);
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
	savePosition(currentAppName);
	loadOrReloadShortcuts(appName);
	loadPosition(appName);
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

ipcMain.on('show-window', () => {
  showWindow()
});
