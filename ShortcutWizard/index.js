'use strict';
// Imports
const electronVibrancy = require('electron-vibrancy');
const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
var Datastore = require('nedb');


// Defaults
var defaultSettings = {
	name: "defaults",
	acceptFirstClick: true,
	alwaysOnTop: true,
	frame: false,
	hidePerApp: true,
	boundsPerApp: true,
	initialBounds: {x: 1100, y: 100, width: 350, height: 800},
	background: '#adadad'
};

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
		settings.insert(defaultSettings, function(err, doc) {
			if (err) {
				console.log('ERROR: inserting default settings into settings db failed with err', err);
			}
		});
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
let loadedShortcuts = [];


// Functions

// Toggle to next mode if newWindowMode is not defined
const applyWindowMode = (newWindowMode) => {
	console.log('|||||||||||||||||||||||| applyWindowMode');
	var minimizeWindow = () => {
		mainWindow.hide();
	};

	var stealthWindow = () => {
		// TODO: load from stealth settings or use default


		// TODO: Fix weird bug where window won't resize
		mainWindow.show();
		var newBounds = mainWindow.getBounds();
		console.log('}}}}}}}}}}}}}}} entered stealthWindow with bounds', newBounds);
		newBounds.heigth = 64;
		console.log('bounds after change', newBounds);
		mainWindow.setBounds(newBounds);
		console.log('{{{{{{{{{{{{ bounds of window after change', mainWindow.getBounds());
		mainWindow.webContents.send('stealth-mode');
	};

	var fullWindow = () => {
		// TODO: load from full settings or use default
		mainWindow.show();
		mainWindow.webContents.send('full-mode');
		mainWindow.setBounds(defaultSettings.initialBounds);
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
	settingsWindow = null;
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
	if (!useSettings) useSettings = defaultSettings;

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
	});

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

ipcMain.on('open-settings', function(event) {
	console.log('entered open-settings');
	toggleSettings();
});

ipcMain.on('get-settings', function(event) {
	settings.find({
		name: currentAppName
	}, function(err, doc) {
		if (err) {
			console.log('Error loading settings', err);
			settingsWindow.webContents.send('default-preferences', {
				alpha: defaultSettings.alpha,
				alwaysOnTop: mainWindow.isAlwaysOnTop(),
				acceptFirstClick: defaultSettings.acceptFirstClick,
				frame: defaultSettings.frame,
				hidePerApp: defaultSettings.hidePerApp,
				boundsPerApp: defaultSettings.boundsPerApp,
				background: defaultSettings.background
			});
		} else if (doc && doc != [] && doc.length > 0) {
			settingsWindow.webContents.send('default-preferences', doc[0]);
		}
	});
});


ipcMain.on('update-global-setting', function(event, settingName, newSetting) {
	console.log('update-global-setting NOT IMPLEMENTED');
});

ipcMain.on('update-app-setting', function(event, newSetting) {
	settings.update({
		name: currentAppName
	}, {
		$set: newSetting
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