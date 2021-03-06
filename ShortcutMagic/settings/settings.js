'use babel';
const path = require('path');
var Datastore = require('nedb');
import { ipcRenderer, remote } from 'electron';

// TODO:
// - put all settings code here
// - respond to settingsview logic
// - send heavy tasks to settingsWorker - or will this be settingsWorker in itself?

// Is there ever a risk that an app has on eof these names and will overwrite..?
const GLOBAL_SETTINGS_KEY = "all programs";
var settingsInProgress = {};
var lastSavedSettings = {};
var cachedSettings = {};
var defaultSettings = {};
// TODO: Split startup settings from saved settings?

var defaultFullBounds = {x: 1100, y: 100, width: 350, height: 800};
var defaultBubbleBounds = {x: 800, y: 10, width: 250, height: 200};

defaultSettings = {
	name: GLOBAL_SETTINGS_KEY,
	acceptFirstClick: true,
	defaultWindowMode: 'tray',
	alwaysOnTop: true,
  boundsPerApp: false,
	showMenuNames: false,
	frame: false,
	show: true,
	x: defaultFullBounds.x,
	y: defaultFullBounds.y,
	width: defaultFullBounds.width,
	height: defaultFullBounds.height,
	lastFullBounds: defaultFullBounds,
	lastBubbleBounds: defaultBubbleBounds,
	title: "mainWindow",
};

// Pick word 1 and 2 (0 is an empty string because of the preceding slash) as the root of the path
const folderPath = remote.getGlobal('folderPath');
console.log('folderPath: ', folderPath);
const resolvedSettings = `${folderPath}/ShortcutMagic/settings.db`;
console.log('resolvedSettings: ', resolvedSettings);

let resolvedHistoryDb;
let settingsHistoryDb;

let settingsDb 

// No need for unique indexes here, we just keep inserting forever(?)
try {
	resolvedHistoryDb = `${folderPath}/ShortcutMagic/settingsHistory.db`;
	console.log('resolvedHistoryDb: ', resolvedHistoryDb);
	settingsHistoryDb = new Datastore({
		filename: resolvedHistoryDb,
		autoload: true
	});
	
	settingsDb = new Datastore({
		filename: resolvedSettings,
		autoload: true
	});
	
	settingsDb.ensureIndex({
		fieldName: 'name',
		unique: true // Setting unique value constraint on name
	}, function (err) {
		if (err) {
			console.log('ERROR: settings.ensureIndex failed to set unique constraint', err);
		}
	});

	// TODO: send to worker?
	settingsDb.find({
		name: GLOBAL_SETTINGS_KEY
	}, function(err, doc) {
		if (err) {
			console.log('Tried to find default settings, got error: ', err);
			return;
		}

		if (!doc || (doc == [] || doc.length == 0)) {
			settingsDb.insert(defaultSettings, function(err, doc) {
				if (err) {
					console.log('ERROR: inserting default settings into settings db failed with err', err);
				}
			});
		} else {
			cachedSettings[GLOBAL_SETTINGS_KEY] = defaultSettings = doc[0];
		}
	});
} catch (e) {
	log.error(e);
}


// make sure all of these are set ok for main window:
// 'mainWindowSettings': {
// 	title: "ShortcutMagic",
// 	alwaysOnTop: useSettings.alwaysOnTop,
// 	acceptFirstClick: useSettings.acceptFirstClick,
// 	frame: useSettings.frame,
// 	backgroundColor: useSettings.background
// }

export class Settings {
	create(settingsWindow) {
		this.settingsWindow = settingsWindow;

		// When settings are created the SettingsView needs to be initialized
		this.get(ipcRenderer.sendSync('get-app-name-sync'), (newSettings, globalSettings) => {
			cachedSettings[newSettings.name] = newSettings;
			this.settingsWindow.setState({
				globalSettings: globalSettings,
				appSettings: newSettings
			});
		});

		this.registerListeners();
	}

	// Return settings for appName, as well as global settings
	get(appName, cb) {
		if (!appName || appName == "") {
			cb(defaultSettings, cachedSettings[GLOBAL_SETTINGS_KEY]);
			return;
		}

		var val = cachedSettings[appName];
		if (val) {
			cb(val, cachedSettings[GLOBAL_SETTINGS_KEY]);
			return;
		}

		// TODO: farm out to worker? make return value a callback instead?
		settingsDb.find({
			name: appName
		}, function(err, res) {
			if (err) {
				console.log("Hit error trying to load setting in settings.get");
				return;
			}

			if (res && res.length > 0 && res[0]) {
				cachedSettings[appName] = res[0]
				cb(res[0], cachedSettings[GLOBAL_SETTINGS_KEY]);
			} else {
				var fallback = defaultSettings;
				fallback["name"] = appName;
				cb(fallback, cachedSettings[GLOBAL_SETTINGS_KEY]);
			}
		});
	}

	getHistory(appName, cb) {
		if (!appName || appName == "") {
			cb([
				defaultSettings
			]);
			return;
		}

		// TODO: Cache history too?
		// var val = cachedSettings[appName];
		// if (val) {
		// 	cb(val);
		// 	return;
		// }

		// TODO: farm out to worker? make return value a callback instead?
		settingsHistoryDb.find({
			name: appName
		}, function(err, res) {
			if (err) {
				console.log("Hit error trying to load setting in settings.get");
				cb([
					defaultSettings
				]);
				return;
			}

			// Send entire res, not just res[0]
			if (res && res.length > 0) {
				// TODO: Cache history too?
				// cachedSettings[appName] = res[0]
				cb(res);
			} else {
				// Last resort is to send the default settings in a list...
				cb([
					defaultSettings
				]);
			}
		});
	}

	set(appSettings, globalSettings) {
		delete appSettings._id;
		cachedSettings[appSettings.name] = appSettings;
		cachedSettings[GLOBAL_SETTINGS_KEY] = globalSettings;

		settingsDb.update({
			name: GLOBAL_SETTINGS_KEY
		}, {
			$set: globalSettings
		}, {
			upsert: true
		}, function(err, doc) {
			if (err) {
				console.log("Error upserting in settings.js set", err, globalSettings);
			} else {
				console.log("Succeeded in saving settings to db: ", globalSettings);
			}
		});

		settingsDb.update({
			name: appSettings.name
		}, {
			$set: appSettings
		}, {
			upsert: true
		}, function(err, doc) {
			if (err) {
				console.log("Error upserting in settings.js set", err, appSettings);
			} else {
				console.log("Succeeded in saving settings to db: ", appSettings);
			}
		});

		appSettings["date"] = new Date();
		settingsHistoryDb.insert(appSettings, (err, doc) => {
			if (err) {
				console.log("error when inserting setting in settingsHistoryDb");
			}
		});
	}

	// TODO: How to make this work with the history?
	undoSettings(appName) {
		if (!appName) {
			console.log("cannot undo settings without appname");
			return;
		}

		settingsDb.find({
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
		});
	}
	// in window? unnecessary?
	// destroySettings();

	registerListeners() {
		// TODO: Ideally show a "do you want to save your changes?" dialog if there were
		// changes done to the app settings (not for global)
		ipcRenderer.on('app-changed', (event, newName) => {
			var changeSettings = (newSettings, globalSettings) => {
				this.settingsWindow.setState({
					globalSettings: globalSettings,
					appSettings: newSettings
				});
			};

			var cached = cachedSettings[newName];
			if (cached) {
				changeSettings(cached, cachedSettings[GLOBAL_SETTINGS_KEY]);
			} else {
				this.get(newName, changeSettings);
			}
		});

		// pseudocode: move window to left or right side depending on main window position
		// if (mainWindow.bounds().x < app.getScreenSize() / 2) {
		// 	// window is towards the left, put settings to the right:
		// 	settingsWindow.setBounds(mainWindowBounds.x - mainWindowBounds.width,
		// 		mainWindowBounds.y, 400, mainWindowBounds.height);
		// } else {
		// 	// window is towards the right, put settings to the left:
		// 	settingsWindow.setBounds(mainWindowBounds.x,
		// 		mainWindowBounds.y, 400, mainWindowBounds.height);



		// TODO: move the state updates into the SettingsView
        // ipcRenderer.on('get-default-settings', applySettingsToState);
    	// ipcRenderer.on('get-settings', applySettingsToState);

		// ipcRenderer.on('create-shortcut-window', (event, cb) => {
		// 	console.log("inside create-shortcut-window::::::::::::::::: ", cb);
		// 	holdSettings = this.get("mainWindow");
		// 	console.log("got holdSettings, calling cb function", holdSettings);
		// 	cb(holdSettings);
		// });

		// ipcRenderer.on('temporarily-update-app-settings', (event, newSettings) => {
		// 	// TODO: don't save settings here, just pass them on to the shortcut window
		// 	if (this.shortcutsWindow) {
		// 		// TODO: test this shortcutsWindow reference properly
		// 		this.shortcutsWindow.webContents.send('update-app-setting', newSettings);
		// 	}
		// });
	}
};
