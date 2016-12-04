'use babel';
const path = require('path');
var Datastore = require('nedb');
import { ipcRenderer, remote } from 'electron';

// TODO:
// - put all settings code here
// - respond to settingsview logic
// - send heavy tasks to settingsWorker - or will this be settingsWorker in itself?

// Is there ever a risk that an app has on eof these names and will overwrite..?
var GLOBAL_SETTINGS = "all programs";
var settingsInProgress = {};
var lastSavedSettings = {};
var cachedSettings = {};
var defaultSettings = {};
// TODO: Split startup settings from saved settings?
defaultSettings = {
	name: GLOBAL_SETTINGS,
	acceptFirstClick: true,
	alwaysOnTop: true,
	frame: false,
	show: true,
	x: 1100, y: 100, width: 350, height: 800,
	backgroundColor: '#adadad'
};

// Defaults
var settingsDb = new Datastore({
	filename: `${__dirname}/../db/settings.db`,
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
	name: GLOBAL_SETTINGS
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
	create(settingsWindow) {
		this.settingsWindow = settingsWindow;
		this.registerListeners();
	}

	// Return a full set of settings for an app
	get(appName, cb) {
		if (!appName || appName == "") {
			cb(defaultSettings);
			return;
		}

		var val = cachedSettings[appName];
		if (val) {
			cb(val);
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
				cb(res[0]);
			} else {
				cb(defaultSettings);
			}
		});
	}

	// Save a full set of settings for an app - uses $set and can be partial as long as name exists
	set(newSettings) {
		delete newSettings._id;
		cachedSettings[newSettings.name] = newSettings;
		settingsDb.update({
			name: newSettings.name
		}, {
			$set: newSettings
		}, {
			upsert: true
		}, function(err, doc) {
			if (err) {
				console.log("Error upserting in settings.js set", err, newSettings);
			} else {
				console.log("Succeeded in saving settings to db: ", newSettings);
			}
		});
	}

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

			// TODO: streamline default settings
			settingsWindow.webContents.send('default-settings', setDefaultSettings);
		});
	}
	// in window? unnecessary?
	// destroySettings();

	registerListeners() {
		ipcRenderer.on('first-app-opened', (event, newName) {
			this.get(newName, (newSettings) => {
				ipcRenderer.send('create-shortcut-window', newSettings);

				this.settingsWindow.setState({
					originalAppSettings: newSettings,
					settings: newSettings
				});
			});
		});

		// TODO: Should this be in settings.js together with other listeners, and
		// then trigger a setState from there to here?
		// TODO: Ideally show a "do you want to save your changes?" dialog if there were
		// changes done to the app settings (not for global)
		ipcRenderer.on('app-changed', (event, newName) => {
			this.get(newName, (newSettings) => {
				this.settingsWindow.setState({
					originalAppSettings: newSettings,
					settings: newSettings
				});
			});
		});




		// TODO: move the state updates into the SettingsView
        // ipcRenderer.on('get-default-settings', applySettingsToState);
    	// ipcRenderer.on('get-settings', applySettingsToState);

		// ipcRenderer.on('create-shortcut-window', (event, cb) => {
		// 	console.log("inside create-shortcut-window::::::::::::::::: ", cb);
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

		ipcRenderer.on('temporarily-update-app-setting', (event, newSettings) => {
			// TODO: don't save settings here, just pass them on to the shortcut window
			if (this.shortcutsWindow) {
				// TODO: test this shortcutsWindow reference properly
				this.shortcutsWindow.webContents.send('update-app-setting', newSettings);
			}
		});
	}
};
