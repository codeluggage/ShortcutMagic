'use babel';
const path = require('path');
var Datastore = require('nedb');
import { ipcRenderer, remote } from 'electron';

// TODO:
// - put all settings code here
// - respond to settingsview logic
// - send heavy tasks to settingsWorker - or will this be settingsWorker in itself?

var GLOBAL_SETTINGS = "__GLOBALSETTINGS__"; // Is there ever a risk that an app has this name and will overwrite..?
var settingsInProgress = {};
var lastSavedSettings = {};
var cachedSettings = {};
var defaultSettings = {};
defaultSettings[GLOBAL_SETTINGS] = {
	name: GLOBAL_SETTINGS,
	acceptFirstClick: true,
	alwaysOnTop: true,
	frame: false,
	hidePerApp: true,
	boundsPerApp: true,
	x: 1100, y: 100, width: 350, height: 800,
	// backgroundColor: '#adadad'
};

// Defaults
var settings = new Datastore({
	filename: `${__dirname}/../db/settings.db`,
	autoload: true
});

settings.ensureIndex({
	fieldName: 'name',
	unique: true // Setting unique value constraint on name
}, function (err) {
	if (err) {
		console.log('ERROR: settings.ensureIndex failed to set unique constraint', err);
	}
});


// TODO: send to worker?
settings.find({
	name: GLOBAL_SETTINGS
}, function(err, doc) {
	if (err) {
		console.log('Tried to find default settings, got error: ', err);
		return;
	}

	if (!doc || (doc == [] || doc.length == 0)) {
		settings.insert(defaultSettings[GLOBAL_SETTINGS], function(err, doc) {
			if (err) {
				console.log('ERROR: inserting default settings into settings db failed with err', err);
			}
		});
	} else {
		defaultSettings = doc[0];
	}
});


// make sure all of these are set ok for main window:
// 'mainWindowSettings': {
// 	title: "ShortcutWizard",
// 	alwaysOnTop: useSettings.alwaysOnTop,
// 	acceptFirstClick: useSettings.acceptFirstClick,
// 	frame: useSettings.frame,
// 	backgroundColor: useSettings.background
// }

export class Settings {
	create() {
		// TODO: check against already initialized
		console.log("inside Settings class 'create' function");
		this.registerListeners();
	}

	get(setting) {
		// TODO: look up settings in cache first, then in db, send db call to worker thread
		console.log("entered GET on SETTINGS class, with setting: ", setting);

		if (setting == "mainWindow") {
			return defaultSettings[GLOBAL_SETTINGS];
		}
	}

	undoSettings(appName) {
		if (!appName) {
			console.log("cannot undo settings without appname");
			return;
		}

		settings.find({
			name: appName
		}, function(err, doc) {
			var setDefaultSettings = defaultSettings;
			setDefaultSettings["name"] = appName;

			if (err) {
				// TODO: streamline default settings
				console.log('cound not find settings in undoSettings');
			} else if (doc && doc != [] && doc.length > 0) {
				setDefaultSettings = doc[0];
			}

			// TODO: streamline default settings
			settingsWindow.webContents.send('default-settings', setDefaultSettings);
		});
	}
	// in window? unnecessary?
	// destroySettings();

	registerListeners() {
		// TODO: move the state updates into the SettingsView
        // ipcRenderer.on('get-default-settings', applySettingsToState);
    	// ipcRenderer.on('get-settings', applySettingsToState);

		// ipcRenderer.on('main-window-settings', (event, cb) => {
		// 	console.log("inside main-window-settings::::::::::::::::: ", cb);
		// 	holdSettings = this.get("mainWindow");
		// 	console.log("got holdSettings, calling cb function", holdSettings);
		// 	cb(holdSettings);
		// });

		// ipcRenderer.on('update-window-ids', (event, newIds) => {
		// 	this.windowIds = newIds;
		// 	var shortcutsId = this.windowIds["shortcuts"];
		//
		// 	if (shortcutsId) {
		// 		this.shortcutsWindow = remote.BrowserWindow.fromId(shortcutsId);
		// 	}
		// });

		ipcRenderer.on('update-window-ids', (event, windowIds) => {
			console.log("inside settings.js update-window-ids");
			this.windowIds = windowIds;
			// TODO: Listen to 'show' event and move browser window

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

		});

		ipcRenderer.on('get-settings', (event) => {
			// TODO: use GLOBAL_SETTINGS to get global settings too
			console.log('entered get-settings');
			var currentAppName = ipcRenderer.sendSync('get-app-name-sync');
			if (!currentAppName) {
				console.log("cant perform get-settings without app name");
				return;
			}

			settings.find({
				name: currentAppName
			}, function(err, doc) {
				if (err) {
					console.log('Error loading settings', err);
					// TODO: streamline default settings
					settingsWindow.webContents.send('default-settings', {
						name: currentAppName,
						alwaysOnTop: mainWindow.isAlwaysOnTop(),
						acceptFirstClick: defaultSettings[GLOBAL_SETTINGS].acceptFirstClick,
						frame: defaultSettings[GLOBAL_SETTINGS].frame,
						hidePerApp: defaultSettings[GLOBAL_SETTINGS].hidePerApp,
						boundsPerApp: defaultSettings[GLOBAL_SETTINGS].boundsPerApp,
						background: defaultSettings[GLOBAL_SETTINGS].background
					});
				} else if (doc && doc != [] && doc.length > 0) {
					console.log('succeeded in loading settings');
					settingsWindow.webContents.send('default-settings', doc[0]);
				} else {
					console.log('couldnt find settings for app, falling back to default');
					// TODO: streamline default settings
					settingsWindow.webContents.send('default-settings', {
						name: currentAppName,
						alwaysOnTop: mainWindow.isAlwaysOnTop(),
						acceptFirstClick: defaultSettings[GLOBAL_SETTINGS].acceptFirstClick,
						frame: defaultSettings[GLOBAL_SETTINGS].frame,
						hidePerApp: defaultSettings[GLOBAL_SETTINGS].hidePerApp,
						boundsPerApp: defaultSettings[GLOBAL_SETTINGS].boundsPerApp,
						background: defaultSettings[GLOBAL_SETTINGS].background
					});
				}
			});
		});


		ipcRenderer.on('temporarily-update-app-setting', (event, newSettings) => {
			// TODO: don't save settings here, just pass them on to the shortcut window
			if (this.shortcutsWindow) {
				// TODO: test this shortcutsWindow reference properly
				this.shortcutsWindow.webContents.send('update-app-setting', newSettings);
			}
		});

		ipcRenderer.on('save-global-settings', (event, newSettings) => {
			settings.update({
				name: GLOBAL_SETTINGS
			}, {
				$set: newSettings
			}, {
				upsert: true
			}, function(err, doc) {
				if (err) {
					console.log('failed to upsert settings in "update-app-setting" for global settings', err);
					return;
				}
			});

			cachedSettings[GLOBAL_SETTINGS] = newSettings;
		});

		// Updates and saves the settings
		ipcRenderer.on('save-settings', (event, newSettings) => {
			console.log('inside save-settings with newSettings', newSettings);
			var newSettingName = newSettings.name;
			settings.update({
				name: newSettings[newSettingName]
			}, {
				$set: newSettings
			}, {
				upsert: true
			}, function(err, doc) {
				if (err) {
					console.log('failed to upsert settings in "update-app-setting"', err);
					return;
				}

				if (newSettingName == "background") {
					mainWindow.webContents.send('set-background', newSettings[newSettingName]);
				} else {
					// TODO: handle destruction better, or find a way to update settings on the running window
					console.log('TODO: Send re-create message to main window because settings have updated')
					// mainWindow = createMainWindow(doc[0]);
				}
			});

			// Update in memory cache of settings
			// TODO: Review all settings.update calls to ensure none are missing this cache
			cachedSettings[newSettings.name] = newSettings;
		});

		// revert to settings before settings window was opened
		ipcRenderer.on('undo-settings', (event) => {
			this.undoSettings();
		});
	}
};
