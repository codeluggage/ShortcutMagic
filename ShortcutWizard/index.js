'use strict';
// Imports
const electronVibrancy = require('electron-vibrancy');
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
var Datastore = require('nedb');
var GLOBAL_SETTINGS = "__GLOBALSETTINGS__";

// Cached values held in memory: 
var localSettings = {};
var globalSettings = {
	global: {
		acceptFirstClick: true,
		frame: false,
		hidePerApp: true,
		boundsPerApp: true,
		initialBounds: {x: 1100, y: 100, width: 350, height: 800},
		background: '#adadad'
	}
};

// Defaults
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
		settings.insert({
			"defaults": globalSettings
		}, function(err, doc) {
			if (err) {
				console.log('ERROR: inserting default settings into settings db failed with err', err);
			}
		});
	} else {
		globalSettings = doc[0];
	}

	globalSettings = globalSettings.global;
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
let loadedShortcuts = [];


// Functions
const destroySettings = () => {
	if (settingsWindow) {
		undoSettings();
		settingsWindow = null;
	}
};

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

	if (settingsWindow) {
		destroySettings();
	}

	settingsWindow = createSettingsWindow();
};

const undoSettings = () => {
	settings.find({
		name: currentAppName
	}, function(err, doc) {
		var setDefaultSettings = globalSettings;
		setDefaultSettings["name"] = currentAppName;

		if (err) {
			// TODO: streamline default settings
			settingsWindow.webContents.send('default-preferences', setDefaultSettings);
		} else if (doc && doc != [] && doc.length > 0) {
			settingsWindow.webContents.send('default-preferences', doc[0]);
		} else {
			// TODO: streamline default settings
			settingsWindow.webContents.send('default-preferences', {
				global: setDefaultSettings,
				local: setDefaultSettings
			});
		}
	});
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
}

function onClosed() {
	// TODO: Clean up each ipcRenderer individually before nulling object
	trayObject.destroy();
	ipcMain.removeAllListeners();
	trayObject = null;
	mainWindow = null;
	backgroundTaskRunnerWindow = null;
	backgroundListenerWindow = null;
	destroySettings();
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

function createMainWindow(useSettings) {
	if (!useSettings) useSettings = globalSettings;

	var win = new BrowserWindow({
		title: "ShortcutWizard",
		alwaysOnTop: useSettings.alwaysOnTop,
		acceptFirstClick: useSettings.acceptFirstClick,
		frame: useSettings.frame,
		backgroundColor: useSettings.background
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
	win.setBounds(globalSettings.initialBounds);
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
		show: true,
		title: "ShortcutWizard Settings",
		alwaysOnTop: true,
		acceptFirstClick: true,
		frame: false,
	});

	settingsWindow.loadURL(`file://${__dirname}/settings/index.html`);
	settingsWindow.on('closed', destroySettings);
	return settingsWindow;
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

ipcMain.on('open-settings', function(event) {
	console.log('entered open-settings');
	toggleSettings();
});

ipcMain.on('get-settings', function(event) {
	// TODO: use GLOBAL_SETTINGS to get global settings too
	console.log('entered get-settings');
	settings.find({
		name: currentAppName
	}, function(err, doc) {
		if (err) {
			console.log('Error loading settings', err);
			// TODO: streamline default settings
			settingsWindow.webContents.send('default-preferences', {
				name: currentAppName,
				alwaysOnTop: mainWindow.isAlwaysOnTop(),
				acceptFirstClick: globalSettings.acceptFirstClick,
				frame: globalSettings.frame,
				hidePerApp: globalSettings.hidePerApp,
				boundsPerApp: globalSettings.boundsPerApp,
				background: globalSettings.background
			});
		} else if (doc && doc != [] && doc.length > 0) {
			console.log('succeeded in loading settings');
			settingsWindow.webContents.send('default-preferences', doc[0]);
		} else {
			console.log('couldnt find settings for app, falling back to default');
			// TODO: streamline default settings
			var sendDefault = {
				name: currentAppName,
				alwaysOnTop: mainWindow.isAlwaysOnTop(),
				acceptFirstClick: globalSettings.acceptFirstClick,
				frame: globalSettings.frame,
				hidePerApp: globalSettings.hidePerApp,
				boundsPerApp: globalSettings.boundsPerApp,
				background: globalSettings.background
			};

			settingsWindow.webContents.send('default-preferences', {
				global: sendDefault,
				local: sendDefault
			});
		}
	});
});


ipcMain.on('update-global-setting', function(event, settingName, newSetting) {
	console.log('update-global-setting NOT IMPLEMENTED');
});


ipcMain.on('temporarily-update-app-setting', function(event, newSetting) {
	// TODO: don't save settings here, just pass them on to the shortcut window
});

// Updates and saves the settings
ipcMain.on('save-settings', function(event, newSettings) {
	console.log('inside save-settings with newSettings', newSettings);

	settings.update({
		name: currentAppName
	}, {
		$set: newSetting.local
	}, {
		upsert: true
	}, function(err, doc) {
		if (err) {
			console.log('failed to upsert settings in "update-app-setting"', err);
			return;
		}

		var settingName = Object.keys(newSetting)[0];
		if (settingName == "background") {
			mainWindow.webContents.send('set-background', newSetting[settingName]);
		} else {
			// TODO: handle destruction better, or find a way to update settings on the running window
			mainWindow = createMainWindow(doc[0]);
		}
	});

	settings.update({
		name: GLOBAL_SETTINGS
	}, {
		$set: newSetting.global
	}, {
		upsert: true
	}, function(err, doc) {
		if (err) {
			console.log('failed to upsert settings in "update-app-setting" for global settings', err);
			return;
		}
	});

	// Update in memory cache of settings
	// TODO: Review all settings.update calls to ensure none are missing this cache
	globalSettings = newSettings.global;
	localSettings[newSettings.local.name] = newSettings;
});

// revert to settings before settings window was opened
ipcMain.on('undo-settings', function(event) {
	undoSettings();
});