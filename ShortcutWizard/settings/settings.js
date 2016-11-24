'use babel';
const path = require('path');
var Datastore = require('nedb');
import { BrowserWindow, ipcRenderer, remote } from 'electron';


// TODO:
// - put all settings code here
// - respond to settingsview logic
// - send heavy tasks to settingsWorker - or will this be settingsWorker in itself?

var GLOBAL_SETTINGS = "__GLOBALSETTINGS__"; // Is there ever a risk that an app has this name and will overwrite..?
var settingsWindow;
var settingsInProgress = {};
var lastSavedSettings = {};
var cachedSettings = {};
var defaultSettings = {};
defaultSettings[GLOBAL_SETTINGS] = {
	acceptFirstClick: true,
	alwaysOnTop: true,
	frame: false,
	hidePerApp: true,
	boundsPerApp: true,
	initialBounds: {x: 1100, y: 100, width: 350, height: 800},
	background: '#adadad'
};

// Defaults
var settings = new Datastore({
	filename: `${__dirname}/db/settings.db`,
	autoload: true
});

// TODO: send to worker?
settings.find({
	name: "defaults"
}, function(err, doc) {
	if (err) {
		console.log('Tried to find default settings, got error: ', err);
		return;
	}

	if (!doc || (doc == [] || doc.length == 0)) {
		settings.insert({
			"defaults": defaultSettings
		}, function(err, doc) {
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

export default class Settings {
	function create() {
		// TODO: check against already initialized
		console.log("inside Settings class 'create' function");
		this.registerListeners();
		this.settingsWindow = this.createSettingsWindow();
		this.windowId = ipcRenderer.sendAsync('register-window', 'settings');
	}

	function get(setting) {
		// TODO: look up settings in cache first, then in db, send db call to worker thread

	}

	function destroySettings() {
		if (settingsWindow) {
			undoSettings();
			settingsWindow = null;
		}
	}

	function toggleSettings() {
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
	}

	function undoSettings() {
		settings.find({
			name: currentAppName
		}, function(err, doc) {
			var setDefaultSettings = defaultSettings;
			setDefaultSettings["name"] = currentAppName;

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

	function createSettingsWindow() {
		var newSettingsWindow = new BrowserWindow({
			show: true,
			title: "ShortcutWizard Settings",
			alwaysOnTop: true,
			acceptFirstClick: true,
			frame: false,
		});

		var settingsPath = `file://${__dirname}/index.html`;
		console.log('settings path trying to load index: ', settingsPath);
		newSettingsWindow.loadURL(settingsPath);
		newSettingsWindow.on('closed', destroySettings);
		return newSettingsWindow;
	}

	function registerListeners() {
		ipcRenderer.on('open-settings', (event) => {
			console.log('entered open-settings');
			this.toggleSettings();
		});

		ipcRenderer.on('get-settings', (event) => {
			// TODO: use GLOBAL_SETTINGS to get global settings too
			console.log('entered get-settings');
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


		ipcRenderer.on('temporarily-update-app-setting', function(event, newSettings) {
			// TODO: don't save settings here, just pass them on to the shortcut window
		});

		ipcRenderer.on('save-global-settings', function(event, newSettings) {
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
		ipcRenderer.on('save-settings', function(event, newSettings) {
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
}
