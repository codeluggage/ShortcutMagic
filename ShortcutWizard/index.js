'use strict';
// Imports
const electronVibrancy = require('electron-vibrancy');
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
var Datastore = require('nedb');


// Defaults
var defaultSettings = {
	alpha: 0.5,
	acceptFirstClick: true,
	frame: false,
	hidePerApp: true,
	boundsPerApp: true,
	initialBounds: {x: 1100, y: 100, width: 350, height: 800}
};

var settings = new Datastore({
	filename: `${__dirname}/db/settings.db`,
	autoload: true
});

settings.find({
	name: "defaults"
}, function(err, doc) {
	if (err) {
		console.log('Tried to find default settings, got error: ', err);
		return;
	}

	if (!doc || (doc == [] || doc.length == 0)) {
		settings.insert(defaultSettings);
	} else {
		defaultSettings = doc[0];
	}
});

var db = new Datastore({
	filename: `${__dirname}/db/shortcuts.db`,
	autoload: true
});

db.ensureIndex({
	fieldName: 'name',
	unique: true // Setting unique value constraint on name
}, function (err) {
	if (err) {
		console.log('ERROR: db.ensureIndex failed to set unique constraint', err);
	}
});

const iconPath = path.join(__dirname, 'wizard.png');

app.setName("ShortcutWizard");
app.dock.hide();

// Global (for now) objects: 
let trayObject;
let mainWindow;
let backgroundTaskRunnerWindow;
let backgroundListenerWindow;
let settingsWindow;
let currentAppName;


// Functions
const toggleSettings = () => {
	// pseudocode: move window to left or right side depending on main window position
	// if (mainWindow.bounds().x < app.getScreenSize() / 2) {
	// 	// window is towards the left, put settings to the right:
	// 	settingsWindow.setBounds(mainWindowBounds.x - mainWindowBounds.width,
	// 		mainWindowBounds.y, 400, mainWindowBounds.height);
	// } else {
	// 	// window is towards the right, put settings to the left:
	// 	settingsWindow.setBounds(mainWindowBounds.x,
	// 		mainWindowBounds.y, 400, mainWindowBounds.height);
	// }

	if (!settingsWindow) {
		settingsWindow = createSettingsWindow();
	}

	if (settingsWindow.isVisible()) {
		settingsWindow.hide();
	} else {
		settingsWindow.show();
		settingsWindow.focus();
	}
};

const toggleWindow = () => {
	console.log('togglewindow with isvisible: ', mainWindow.isVisible());
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

function savePosition(appName) {
	if (!appName || !mainWindow) return;

	db.find({
		name: appName
	}, function(err, doc) {
		if (err) {
			console.log('error finding in savePosition: ', err);
			return;
		}

		var newBounds = mainWindow.getBounds();
		if (doc && doc != [] && doc.length > 0 && doc[0].bounds != newBounds) {
			db.update({
				name: appName
			}, {
				$set: {
					bounds: newBounds
				}
			}, function(err, res) {
				console.log('finished inserting bounds with err res', err, res);
			});
		}
	});
}

function loadPosition(appName) {
	console.log('loading pos');
	if (!appName || !mainWindow) return;

	db.find({
		name: appName
	}, function(err, doc) {
		if (err) {
			console.log('error finding in loadPosition: ', err);
		}

		if (doc && doc != [] && doc.length > 0) {
			var bounds = doc[0].bounds;
			console.log('found app bounds when loading: ', bounds);
			if (!bounds) return;

			console.log('setting bounds');
			mainWindow.setBounds(bounds);
		}
	});
}

const showWindow = () => {
	// if (currentAppName) {
	// 	db.find({
	// 		name: currentAppName
	// 	}, function(err, doc) {
	// 		if (err) {
	// 			console.log('error finding in loadPosition: ', err);
	// 		}

	// 		if (doc != [] && doc.length > 0) {
	// 			mainWindow.setBounds(doc[0].bounds);
	// 		}
	// 	});
	// }

	mainWindow.show()
	mainWindow.focus()
}

function createWindows() {
	trayObject = createTray();
	mainWindow = createMainWindow();
	backgroundTaskRunnerWindow = createBackgroundTaskRunnerWindow();
	backgroundListenerWindow = createBackgroundListenerWindow();
	settingsWindow = createSettingsWindow();
}

function onClosed() {
	// TODO: Clean up each ipcRenderer individually before nulling object
	trayObject.destroy();
	ipcMain.removeAllListeners();
	trayObject = null;
	mainWindow = null;
	backgroundTaskRunnerWindow = null;
	backgroundListenerWindow = null;
	settingsWindow = null;
}

function createTray() {
	var newTray = new Tray(iconPath);
	console.log('created newTray: ', newTray);
	newTray.setToolTip('ShortcutWizard!');
	newTray.on('right-click', toggleWindow);
	newTray.on('double-click', toggleWindow);
	newTray.on('click', function (event) {
	  toggleWindow();

	  // TODO: Limit this to only dev mode
	  if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
	    mainWindow.openDevTools({mode: 'detach'})
	  }
	});

	return newTray;
}

function createMainWindow() {
	var win = new BrowserWindow({
		title: "ShortcutWizard",
		alwaysOnTop: defaultSettings.alwaysOnTop,
		acceptFirstClick: defaultSettings.acceptFirstClick,
		transparent: (defaultSettings.alpha != 0),
		frame: defaultSettings.frame,
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
	win.setBounds(defaultSettings.initialBounds);
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

function createSettingsWindow() {
	settingsWindow = new BrowserWindow({
		show: false,
		title: "ShortcutWizard Settings",
		alwaysOnTop: true,
		acceptFirstClick: true,
		frame: false,
	});

	settingsWindow.loadURL(`file://${__dirname}/settings/index.html`);
	settingsWindow.on('closed', () => { settingsWindow = null; });
	return settingsWindow;
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
	{
		$set: {
			name: payload.name,
			shortcuts: payload.shortcuts,
			bounds: mainWindow.getBounds()
		}
	}, {
		upsert: true
	}, function(err, res) {
		if (err) {
			console.log('ERROR: upserting in db got error: ', err);
		} else {
			console.log('finished upserting shortcuts in db');
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


// Events
app.on('window-all-closed', function() {
	onClosed();
	app.quit();
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
	console.log('app switch. app name was', currentAppName, "appname will change to: ", appName);
	if (appName == "Electron") {
		console.log('cannot switch to ourselves');
		return;
	}

	if (currentAppName) {
		savePosition(currentAppName);
	}

	// TODO: add css spinner when this is running
	loadOrReloadShortcuts(appName);
	loadPosition(appName);
	currentAppName = appName;
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
  showWindow();
});

ipcMain.on('update-shortcut-order', function(event, appName, shortcuts) {
	console.log('entered update-shortcut-order', appName, shortcuts);
	db.update({
		name: appName
	}, {
		$set: {
			shortcuts: shortcuts
		}
	}, function(err, doc) {
		if (err) {
			console.log('failed to upsert shortcuts in "update-shortcut-order"', err);
		} else {
			console.log('succeeded in updating order of shortcuts');
		}
	});
});

ipcMain.on('open-settings', function(event) {
	console.log('entered open-settings');
	toggleSettings();
});

ipcMain.on('get-settings', function(event, callback) {
	settingsWindow.webContents.send('default-preferences', {
		alpha: 0.5,
		alwaysOnTop: mainWindow.isAlwaysOnTop(),
		acceptFirstClick: defaultSettings.acceptFirstClick,
		frame: defaultSettings.frame,
		hidePerApp: defaultSettings.hidePerApp,
		boundsPerApp: defaultSettings.boundsPerApp,
	});
});

