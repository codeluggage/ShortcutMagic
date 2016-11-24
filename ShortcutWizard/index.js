'use strict';
// Imports
const electronVibrancy = require('electron-vibrancy');
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
var Datastore = require('nedb');

// TODO: Save to settings db
var allFalseWindowMode = {
	minimized: false,
	stealth: false,
	full: false
};

var defaultWindowMode = {

	minimized: false,
	stealth: false,
	full: false

};

var windowMode = {
	minimized: false,
	stealth: false,
	full: true
};

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
let loadedShortcuts = [];


// Functions

// Toggle to next mode if newWindowMode is not defined
const applyWindowMode = (newWindowMode) => {
	console.log('|||||||||||||||||||||||| applyWindowMode');
	var minimizeWindow = () => {
		mainWindow.hide();
	};

	var stealthWindow = () => {
		// TODO: Fix weird bug where window won't resize
		mainWindow.show();
		mainWindow.webContents.send('stealth-mode');

		if (!loadedShortcuts[currentAppName]) {
			db.find({
				name: currentAppName
			}, function(err, res) {
				console.log('loaded shortcuts: ');
				if (err) {
					console.log('errored during db find: ', err);
					return;
				}

				mainWindow.setBounds(res.bounds);
			});
		} else {
			mainWindow.setBounds(loadedShortcuts[currentAppName].stealthBounds);
		}
	};

	var fullWindow = () => {
		// TODO: load from full settings or use default
		mainWindow.show();
		mainWindow.webContents.send('full-mode');

		if (!loadedShortcuts[currentAppName]) {
			db.find({
				name: currentAppName
			}, function(err, res) {
				console.log('loaded shortcuts: ');
				if (err) {
					console.log('errored during db find: ', err);
					return;
				}

				mainWindow.setBounds(res.bounds);
			});
		} else {
			mainWindow.setBounds(loadedShortcuts[currentAppName].fullBounds);
		}

		mainWindow.setBounds(electron.remote.settings('full-bounds'));
	};

	if (newWindowMode) {
		if (newWindowMode.minimized) {
			minimizeWindow();
		} else if (newWindowMode.stealth) {
			stealthWindow();
		} else if (newWindowMode.full) {
			fullWindow();
		}
	} else {
		// Toggle through modes, smaller and smaller
		if (windowMode.minimized) {
			windowMode.minimized = false;
			windowMode.full = true;
			fullWindow();
		} else if (windowMode.stealth) {
			windowMode.stealth = false;
			windowMode.minimized = true;
			minimizeWindow();
		} else if (windowMode.full) {
			windowMode.full = false;
			windowMode.stealth = true;
			stealthWindow();
		}
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
	applyWindowMode(windowMode);
}

function onClosed() {
	// TODO: Clean up each ipcRenderer individually before nulling object
	trayObject.destroy();
	ipcMain.removeAllListeners();
	trayObject = null;
	mainWindow = null;
	backgroundTaskRunnerWindow = null;
	backgroundListenerWindow = null;
}

function createTray() {
	var newTray = new Tray(iconPath);
	console.log('created newTray: ', newTray);
	newTray.setToolTip('ShortcutWizard!');
	newTray.on('right-click', applyWindowMode);
	newTray.on('double-click', applyWindowMode);
	newTray.on('click', function (event) {
	  applyWindowMode();

	  // TODO: Limit this to only dev mode
	  if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
	    mainWindow.openDevTools({mode: 'detach'})
	  }
	});

	return newTray;
}

function createMainWindow(useSettings) {
	if (!useSettings) useSettings = electron.remote.settings('mainWindowSettings');

	var win = new BrowserWindow(useSettings);
	// win.setBounds(defaultSettings[GLOBAL_SETTINGS].initialBounds); // should not be needed 


	// TODO: make experimental settings:
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
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
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

function loadForApp(appName) {
	// if (!appName || !mainWindow) return;

	// db.find({
	// 	name: appName
	// }, function(err, doc) {
	// 	if (err) {
	// 		console.log('error finding in loadPosition: ', err);
	// 	}

	// 	if (doc && doc != [] && doc.length > 0) {
	// 		var bounds = doc[0].bounds;
	// 		console.log('found app bounds when loading: ', bounds);
	// 		if (!bounds) return;

	// 		console.log('setting bounds');
	// 		mainWindow.setBounds(bounds);
	// 	}
	// });

	console.log('loadForApp with appName', appName);

	if (!appName) {
		console.log('sending webview-parse-shortcuts with appName');
		backgroundTaskRunnerWindow.webContents.send('webview-parse-shortcuts'); // Send without name to reload current
		return;
	} else {
		var holdShortcuts = loadedShortcuts[appName];
		if (holdShortcuts) {
			mainWindow.setBounds(holdShortcuts.bounds);
			mainWindow.webContents.send('update-shortcuts', holdShortcuts);
			return;
		}
	}

	loadWithPeriods(appName);
}

function updateRenderedShortcuts(shortcuts) {
	mainWindow.webContents.send('update-shortcuts', shortcuts);
}

function saveWithoutPeriods(payload) {
	loadedShortcuts[payload.name] = payload;

	var stringified = JSON.stringify(payload.shortcuts);
	stringified = stringified.replace(/\./g, 'u002e');
	payload.shortcuts = JSON.parse(stringified);
	console.log('about to upsert in db: ', payload.shortcuts);

	db.update({
		name: payload.name
	}, {
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
	console.log('entering loadWithPeriods for appname ', appName, loadedShortcuts);
	var holdShortcuts = loadedShortcuts[appName];
	if (holdShortcuts) {
		console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> found and loaded in-memory shortcuts');
		mainWindow.webContents.send('update-shortcut', holdShortcuts);
		return;
	}

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
			var newShortcuts = res[0];
			var stringified = JSON.stringify(newShortcuts.shortcuts);
			stringified = stringified.replace(/u002e/g, '.');
			newShortcuts.shortcuts = JSON.parse(stringified);
			console.log('setting loadedShortuts', newShortcuts);
			loadedShortcuts[newShortcuts.appName] = newShortcuts;
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> inserted from loadWithPeriods to loadedShortcuts');
			// console.log('sending shortcuts to be rendered: ', shortcuts);
			mainWindow.webContents.send('update-shortcuts', newShortcuts);
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
	loadForApp();
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
	// TODO: load in background render thread
	loadForApp(appName);
	currentAppName = appName;
});

ipcMain.on('main-parse-shortcuts-callback', function(event, payload) {
	console.log('#3 - root index.js, ipc on main-parse-shortcuts-callback, upserting shortcuts in db: ');
	updateRenderedShortcuts(payload);
	saveWithoutPeriods(payload);
});

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	console.log('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	loadForApp(appName);
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

ipcMain.on('change-window-mode', function(event, newMode) {
	if (newMode) {
		// This type of input is easy to send and annoying to unwind on the receiving end -
		// would it be better to simply have a string state instead?
		var newModeKey = Object.keys(newMode)[0];
		var newModeVal = Object.values(newMode)[0];
		if  (windowMode[newModeKey] != newModeVal) {
			windowMode = allFalseWindowMode;
			windowMode[newModeKey] = newModeVal;
			applyWindowMode(windowMode);
		}
	} else {
		// Toggle over to next mode
		applyWindowMode();
	}
});
