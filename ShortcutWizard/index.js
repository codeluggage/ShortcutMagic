'use strict';

// Vibrancy changes how the window transparency looks. Blurred, foggy, dim, etc.
const electronVibrancy = require('electron-vibrancy');
const {
    // app lets us access global things about the whole running application, like the application name, the dock state,
    // and events that trigger for the whole application, like app.on('before-quit', ...
    app,
    // BrowserWindow is a chrome window which loads a html file. Used for all the windows of the application
    BrowserWindow,
    // ipcMain is used for listening to events sent from other threads, like from inside BrowserWindow's
    ipcMain,
    // Tray is used for the icon in the menu bar on mac, where we show the wizard hat
    Tray,
    // systemPreferences let us access things like if the operating system is in dark mode
    systemPreferences
} = require('electron');

// path lets us work with the file path of the running application
const path = require('path');
// nedb is a simple javascript database, smilar to mongodb, where we store the shortcuts and other things about another program
const Datastore = require('nedb');
// db is an instance of nedb and lets us store things on disk in pure text, and treat it like mongodb. this stores the shortcut information
var db = new Datastore({
	filename: `${__dirname}/db/shortcuts.db`,
	autoload: true
});

// The field for "name" is the one we want to keep unique, so anything we write to the db for another running program is
// updated, and not duplicated.
// TODO: this is not always been unique and needs to be improved
db.ensureIndex({
	fieldName: 'name',
	unique: true // Setting unique value constraint on name
}, function (err) {
	if (err) {
		console.log('ERROR: db.ensureIndex failed to set unique constraint', err);
	}
});


// For testing, we need to check parsing of shortcuts sometimes. These applications are simple and have few shortcuts,
// so they are quick to test with.
// TODO: Make this only run in debug/dev mode
console.log("temporary removal of PomoDoneApp and mysms shortcuts for testing, TODO: hard remove instead");
db.remove({
	name: "PomoDoneApp"
});
db.remove({
	name: "mysms"
});



// hackyStopSavePos needs to be replaced with a better system. right now it just stops the size and position of the application
// from being saved. this is typically set when we are loading a position or moving between window modes
var hackyStopSavePos = false;
// The default bounds are appliend when no other bounds are found, typically for new running programs we open and parse
var defaultFullBounds = {x: 1100, y: 100, width: 350, height: 800};
var defaultBubbleBounds = {x: 800, y: 10, width: 250, height: 200};

app.setName("ShortcutWizard");
// The dock icon is hidden because we are trying to be an overlay application that is just "always there"
// TODO: Set this in the settings, in case someone wants a full running program
app.dock.hide();

// Global (for now) objects:
// controls the tray of the application
let trayObject;
// the BrowserWindow for the settings window
let settingsWindow;
// the popover BrowserWindow for quick settings
let miniSettingsWindow;
// the BrowserWindow for the running actual application window
let mainWindow;
// a hidden background BrowserWindow that runs tasks in a "background" thread
let backgroundTaskRunnerWindow;
// a hidden background BrowserWindow that runs objective c code to listen for application switches in the operating system and calls to our ipcMain
let backgroundListenerWindow;
// the front window when the application opens, introduction and explanation of how to run correctly with security settings
// TODO: make hideable with a setting
let welcomeWindow;
// a hacky bad construct holding the shortcuts from the db in memory
// TODO: merge into a class that encapsulates the db and functionality, and caches things in memory without checking this array everywhere :|
let inMemoryShortcuts = [];
// the name of the app that was switched to last time, so we know it's the name of the currently active program
let currentAppName = "Electron";
// TODO: Save to settings db


// Functions

// Sets bounds for the current window mode, saves it in the db
const setAndSaveBounds = (newBounds) => {
    // If we're called without newBounds, the current bounds are the basis
	if (!newBounds) {
		newBounds = mainWindow.getBounds();
	}

    // Take the existing window mode and prepare it for saving to the db
    var windowMode = inMemoryShortcuts[currentAppName].windowMode;
	var payload = { windowMode: windowMode };

	if (windowMode == "full") {
        // We are currently in "full" mode, so the bounds should be saved to the memory shortcuts and the db payload
		payload["lastFullBounds"] = inMemoryShortcuts[currentAppName].lastFullBounds = newBounds;
	} else if (windowMode == "bubble") {
        // We are currently in "bubble" mode, so the bounds should be saved to the memory shortcuts and the db payload
		payload["lastBubbleBounds"] = inMemoryShortcuts[currentAppName].lastBubbleBounds = newBounds;
	} else {
        // No bounds need to be stored for hidden mode
	}

	console.log("_________________________________________ SAVING ____________________________________");
	console.log(`---------windowMode: ${windowMode}------------`);
	console.log(`---------bounds (should be nothing): ${JSON.stringify(inMemoryShortcuts[currentAppName].bounds)}------------`);
	console.log(`---------lastFullBounds: ${JSON.stringify(inMemoryShortcuts[currentAppName].lastFullBounds)}------------`);
	console.log(`---------lastBubbleBounds: ${JSON.stringify(inMemoryShortcuts[currentAppName].lastBubbleBounds)}------------`);
	console.log("_________________________________________ SAVING ____________________________________");

    // Store the payload in the db for the current app
	db.update({
		name: currentAppName
	}, {
		$set: payload
	}, {
		upsert: true
	}, function(err, res) {
		if (err) {
			console.log('ERROR: upserting bounds in applywindowmode in db got error: ', err);
		} else {
			console.log('finished upserting bounds in applywindowmode');
		}
	});
};

// Changes the window mode, either by just calling it or calling it with the argument
const applyWindowMode = (newWindowMode) => {
	var setAndSaveWindowMode = (newWindowMode) => {
		if (newWindowMode == "bubble") {
			setAndSaveBounds();
			inMemoryShortcuts[currentAppName].windowMode = "bubble";

			mainWindow.show();
			console.log("In bubble-mode in applyWindowMode, sending to mainWindow");
			mainWindow.webContents.send('bubble-mode');

			var bubbleBounds = undefined;
			var currentApp = inMemoryShortcuts[currentAppName];

			if (currentApp) {
				bubbleBounds = (currentApp) ? currentApp.lastBubbleBounds : undefined;
				hackyStopSavePos = true;
				mainWindow.setBounds((bubbleBounds) ? bubbleBounds : defaultBubbleBounds);
				hackyStopSavePos = false;
			} else {
				db.find({
					name: currentAppName
				}, function(err, res) {
					console.log('loaded shortcuts: ');
					if (err) {
						console.log('errored during db find: ', err);
						return;
					}

					if (res != [] && res.length > 0) {
						inMemoryShortcuts[currentAppName] = currentApp = res[0];
						bubbleBounds = currentApp.lastFullBounds;
					}

					hackyStopSavePos = true;
					mainWindow.setBounds((bubbleBounds) ? bubbleBounds : defaultBubbleBounds);
					hackyStopSavePos = false;
				});
			}
		} else if (newWindowMode == "full") {
			setAndSaveBounds();
			inMemoryShortcuts[currentAppName].windowMode = "full";

			// TODO: load from full settings or use default
			mainWindow.show();
			console.log("In full-mode in applyWindowMode, sending to mainWindow");
			mainWindow.webContents.send('full-mode');

			var fullBounds = undefined;
			var currentApp = inMemoryShortcuts[currentAppName];

			if (currentApp) {
				fullBounds = (currentApp) ? currentApp.lastFullBounds : undefined;
				hackyStopSavePos = true;
				mainWindow.setBounds((fullBounds) ? fullBounds : defaultFullBounds);
				hackyStopSavePos = false;
			} else {
				db.find({
					name: currentAppName
				}, function(err, res) {
					console.log('loaded shortcuts: ');
					if (err) {
						console.log('errored during db find: ', err);
						return;
					}

					if (res != [] && res.length > 0) {
						inMemoryShortcuts[currentAppName] = currentApp = res[0];
						fullBounds = currentApp.lastFullBounds;
					}

					hackyStopSavePos = true;
					mainWindow.setBounds((fullBounds) ? fullBounds : defaultFullBounds);
					hackyStopSavePos = false;
				});
			}
		} else if (newWindowMode == "hidden") {
            setAndSaveBounds();
			inMemoryShortcuts[currentAppName].windowMode = "hidden";

			mainWindow.hide();
			console.log("In hidden-mode in applyWindowMode, sending to mainWindow");
			mainWindow.webContents.send('hidden-mode');
		} else {
			console.log("in setAndSaveWindowMode() ERROR ERROR ERROR ERROR ERROR ERROR ERROR ");
			console.log("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ");
			console.log("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ");
			console.log("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ");
		}
	};


    // Bail out if we are already on this window mode
    // TODO: handle this better, what does the user expect when arriving here? First click, misclick?
	if (newWindowMode && newWindowMode == inMemoryShortcuts[currentAppName].windowMode) return;
	console.log(`_________ newWindowMode:${newWindowMode}, in memory window mode: ${inMemoryShortcuts[currentAppName].windowMode}`);

	if (newWindowMode) {
		if (newWindowMode == "hidden") {
			setAndSaveWindowMode("hidden");
		} else if (newWindowMode == "bubble") {
			setAndSaveWindowMode("bubble");
		} else if (newWindowMode == "full") {
			setAndSaveWindowMode("full");
		}
	} else {
		// Without a new specific window mode, we toggle through each mode
		if (inMemoryShortcuts[currentAppName].windowMode == "hidden") {
			setAndSaveWindowMode("full");
			console.log(`setAndSaveWindowMode("full") done `);
		} else if (inMemoryShortcuts[currentAppName].windowMode == "bubble") {
			setAndSaveWindowMode("hidden");
			console.log(`setAndSaveWindowMode("hidden") done `);
		} else if (inMemoryShortcuts[currentAppName].windowMode == "full") {
			setAndSaveWindowMode("bubble");
			console.log(`setAndSaveWindowMode("bubble") done `);
		}

        // This should not happen, but if it does it's probably from a new app so go to the next natural mode; bubble
		if (!inMemoryShortcuts[currentAppName].windowMode) {
			console.log("Error: no window mode found, setting bubble as fallback");
			setAndSaveWindowMode("bubble");
		}
	}
};

const showWindow = () => {
	mainWindow.show()
	mainWindow.focus()
}

const toggleWindow = () => {
	console.log('togglewindow with isVisible: ', mainWindow.isVisible());
	if (mainWindow.isVisible()) {
		mainWindow.hide();
	} else {
		showWindow();
	}
}

ipcMain.on('show-window', () => {
    showWindow();
});

function quitShortcutWizard() {
    trayObject.destroy();
    trayObject = null;
    settingsWindow = null; // TODO: double check that the settings window isn't destroyed elsewhere
    miniSettingsWindow = null;
    backgroundTaskRunnerWindow = null;
    backgroundListenerWindow.destroy(); // This holds on to objective c code, so we force destroy it
    backgroundListenerWindow = null;
    mainWindow = null;
};


function savePosition(appName) {
	if (!appName || !mainWindow) return;

	var newBounds = mainWindow.getBounds();

	db.find({
		name: appName
	}, function(err, doc) {
		if (err) {
			console.log('error finding in savePosition: ', err);
			return;
		}

		if (doc != [] && doc.length > 0) {
			var newShortcuts = doc[0];
			var positionsNotEqual = false;

			if (newShortcuts.windowMode == "full") {
				console.log(`comparing old ${JSON.stringify(newBounds)} with loaded ${JSON.stringify(newShortcuts.lastFullBounds)}`);
				positionsNotEqual = JSON.stringify(newShortcuts.lastFullBounds) != JSON.stringify(newBounds);
			} else if (newShortcuts.windowMode == "bubble") {
				console.log(`comparing old ${JSON.stringify(newBounds)} with loaded ${JSON.stringify(newShortcuts.lastBubbleBounds)}`);
				positionsNotEqual = JSON.stringify(newShortcuts.lastBubbleBounds) != JSON.stringify(newBounds);
            }

			if (positionsNotEqual) {
				console.log("========== compare found differences, updating db ");

				var saveSet = {};

				// First set in memory:
				if (newShortcuts.windowMode == "full") {
					newShortcuts.lastFullBounds = newBounds;
					saveSet = {
						lastFullBounds: newBounds
					};
				} else if (newShortcuts.windowMode == "bubble") {
					newShortcuts.lastBubbleBounds = newBounds;
					saveSet = {
						lastBubbleBounds: newBounds
					};
				}

				inMemoryShortcuts[appName] = newShortcuts;

				// ...then in storage:
				db.update({
					name: appName
				}, {
					$set: saveSet
				}, function(err, res) {
					console.log('finished updating bounds with err res doc', err, res, newBounds);
				});
			} else {
				console.log("========== compare success ");
			}
		}
	});
}

function createMiniSettingsWindow() {
	miniSettingsWindow = new BrowserWindow({
		show: false,
		title: "miniSettingsWindow",
		alwaysOnTop: true,
		acceptFirstClick: true,
		transparent: true,
		frame: false,
		x: 800, y: 50, width: 300, height: 800,
	});

	var settingsPath = `file://${__dirname}/settings/miniIndex.html`;
	miniSettingsWindow.loadURL(settingsPath);
}

function createSettingsWindow() {
	settingsWindow = new BrowserWindow({
		show: false,
		title: "settingsWindow",
		alwaysOnTop: true,
		acceptFirstClick: true,
		frame: false,
		height: 700,
		width: 700,
	});

	var settingsPath = `file://${__dirname}/settings/index.html`;
	console.log('settings path trying to load index: ', settingsPath);
	settingsWindow.loadURL(settingsPath);
	console.log("after loading url");
}

function createWindows() {
	// The actual shortcut window is only created when the app switches
	createTray();
	createBackgroundTaskRunnerWindow();
	createBackgroundListenerWindow();
	createSettingsWindow();
	createMiniSettingsWindow();
	// createWelcomeWindow();
	createMainWindow();
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		name: "ShortcutWizard",
		acceptFirstClick: true,
		alwaysOnTop: true,
		frame: false,
		show: false, // Don't show until we have the information of the app that is running
		transparent: true,
		x: 1100, y: 100, width: 350, height: 800,
		title: "mainWindow"
	});

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
	// mainWindow.on('ready-to-show', () => {
	// 	console.log('loaded window, vibrancy: ', electronVibrancy);
	//     // electronVibrancy.SetVibrancy(true, browserWindowInstance.getNativeWindowHandle());
	// 	electronVibrancy.SetVibrancy(mainWindow, 0);
	// });

	mainWindow.loadURL(`file://${__dirname}/index.html`);

	mainWindow.on('resize', (event) => {
		// TODO: Set up a limit here to not save too often, or queue it up
		if (!hackyStopSavePos) {
			console.log("//////////////////////////////////////// on.resize");
			savePosition(currentAppName);
		}
	});

	mainWindow.on('moved', (event) => {
		if (!hackyStopSavePos) {
			console.log("//////////////////////////////////////// on.moved");
			savePosition(currentAppName);
		}
	});



	mainWindow.setHasShadow(false);

	// applyWindowMode(inMemoryShortcuts[currentAppName].windowMode);
	mainWindow.show();

	// All windows are created, collect all their window id's and let each of them
	// know what is available to send messages to:

	// TODO: Run applescript to select previous app and set that as the current app,
	// in order to correctly load the state of that app for the main window settings
}

function createTray() {
	// TODO: read if menu is dark or not, load white/black hat icon as response:
	const iconPath = path.join(__dirname, systemPreferences.isDarkMode() ? 'wizard-white.png' : 'wizard.png');
	trayObject = new Tray(iconPath);

	console.log('created trayObject: ', trayObject);
	trayObject.setToolTip('ShortcutWizard!');
	trayObject.on('right-click', (event) => {
		if (mainWindow) {
			mainWindow.show();
			mainWindow.openDevTools();
		} else {
			console.log("cant find mainwindow to show");
		}

		if (settingsWindow) {
			settingsWindow.show();
			settingsWindow.openDevTools();
		} else {
			console.log("cant find settingswindow to show");
		}

		if (backgroundTaskRunnerWindow) {
			backgroundTaskRunnerWindow.show();
			backgroundTaskRunnerWindow.openDevTools();
		} else {
			console.log("cant find backgroundTaskRunnerWindow to show");
		}

		if (backgroundListenerWindow) {
			backgroundListenerWindow.show();
			backgroundListenerWindow.openDevTools();
		} else {
			console.log("cant find backgroundListenerWindow to show");
		}

		if (welcomeWindow) {
			welcomeWindow.show();
			welcomeWindow.openDevTools();
		} else {
			console.log("cant find backgroundListenerWindow to show");
		}

		if (miniSettingsWindow) {
			miniSettingsWindow.show();
			miniSettingsWindow.openDevTools();
		} else {
			console.log("cant find backgroundListenerWindow to show");
		}
	});

	// trayObject.on('double-click', applyWindowMode);
	trayObject.on('click', (event) => {
		// TODO: switch to main window and focus the search field
        if (currentAppName != "Electron" && inMemoryShortcuts[currentAppName].windowMode) {
    		applyWindowMode();
        }

		if (mainWindow.isVisible() && process.defaultApp && event.metaKey) {
			mainWindow.openDevTools({
				mode: 'detach'
			});
		}
	});

	return trayObject;
}

function createBackgroundTaskRunnerWindow() {
	backgroundTaskRunnerWindow = new BrowserWindow({
		show: false,
		title: "backgroundTaskRunnerWindow"
	});

	console.log('#1 load window:');
	backgroundTaskRunnerWindow.loadURL(`file://${__dirname}/background/index.html`);
}

function createBackgroundListenerWindow() {
	backgroundListenerWindow = new BrowserWindow({
		show: false,
		title: "backgroundListenerWindow"
	});

	console.log('loaded listener window');
	backgroundListenerWindow.loadURL(`file://${__dirname}/background/listener.html`);
}

function createWelcomeWindow() {
	welcomeWindow = new BrowserWindow({
		show: true,
		title: "welcomeWindow"
	});

	welcomeWindow.loadURL(`file://${__dirname}/welcome/index.html`);
}

function updateRenderedShortcuts(shortcuts) {
	mainWindow.webContents.send('update-shortcuts', shortcuts);
}

function saveWithoutPeriods(payload) {
	if (payload.windowMode == "bubble") {
		payload.lastBubbleBounds = mainWindow.getBounds();
	} else if (payload.windowMode == "full") {
		payload.lastFullBounds = mainWindow.getBounds();
	}

	inMemoryShortcuts[payload.name] = payload;

	var stringified = JSON.stringify(payload.shortcuts);
	stringified = stringified.replace(/\./g, 'u002e');
	payload.shortcuts = JSON.parse(stringified);

	db.update({
		name: payload.name
	}, {
		$set: payload
	}, {
		upsert: true
	}, function(err, res) {
		if (err) {
			console.log('ERROR: upserting in db got error: ', err);
		} else {
			console.log('finished upserting shortcuts for ' + payload.name + ' in db');
		}
	});
}

function loadWithPeriods(appName) {
	console.log(`entering loadWithPeriods for appname ${appName}`);
	var holdShortcuts = inMemoryShortcuts[appName];
	if (holdShortcuts) {
		console.log(`found and loaded in-memory shortcuts and window mode ${inMemoryShortcuts[appName].windowMode}`);
        var success = false;

		hackyStopSavePos = true;
		if (holdShortcuts.windowMode == "bubble" && holdShortcuts.lastBubbleBounds) {
            success = true;
			mainWindow.setBounds(holdShortcuts.lastBubbleBounds);
            if (!mainWindow.isVisible()) {
                // TODO: Fix this issue - when using alt+` as shortcut for iTerm the window does not get focus because mainWindow.show() takes focus here
                setTimeout(() => { mainWindow.show() }, 100);
            }
		} else if (holdShortcuts.windowMode == "full" && holdShortcuts.lastFullBounds) {
            success = true;
			mainWindow.setBounds(holdShortcuts.lastFullBounds);
            if (!mainWindow.isVisible()) {
                // TODO: Fix this issue - when using alt+` as shortcut for iTerm the window does not get focus because mainWindow.show() takes focus here
                setTimeout(() => { mainWindow.show() }, 100);
            }
		} else if (holdShortcuts.windowMode == "hidden") {
            success = true;
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            }
        }
		hackyStopSavePos = false;

        if (success) {
            mainWindow.webContents.send('update-shortcuts', holdShortcuts);
            return;
        }
	}


	db.find({
		name: appName
	}, function(err, res) {
		console.log('loaded shortcuts, err? ', err);
		if (err) {
			console.log('errored during db find: ', err);
			return;
		}

		if (res != [] && res.length > 0) {
			var newShortcuts = res[0];

			// We replace the period with a character code so the db understands it as a single string
			// instead of sub-selecting items in the json:
			var stringified = JSON.stringify(newShortcuts.shortcuts);
			stringified = stringified.replace(/u002e/g, '.');
			newShortcuts.shortcuts = JSON.parse(stringified);

            // TODO: This is probably redundant and can be skipped
            if (!newShortcuts.windowMode) {
                newShortcuts.windowMode = "full";
                newShortcuts.lastFullBounds = defaultFullBounds;
            }
			inMemoryShortcuts[appName] = newShortcuts;

			if (mainWindow) {
				hackyStopSavePos = true;

        		if (newShortcuts.windowMode == "bubble" && newShortcuts.lastBubbleBounds) {
        			mainWindow.setBounds(newShortcuts.lastBubbleBounds);
                    if (!mainWindow.isVisible()) {
                        // TODO: Fix this issue - when using alt+` as shortcut for iTerm the window does not get focus because mainWindow.show() takes focus here
                        setTimeout(() => { mainWindow.show() }, 100);
                    }
        		} else if (newShortcuts.windowMode == "full" && newShortcuts.lastFullBounds) {
        			mainWindow.setBounds(newShortcuts.lastFullBounds);
                    if (!mainWindow.isVisible()) {
                        // TODO: Fix this issue - when using alt+` as shortcut for iTerm the window does not get focus because mainWindow.show() takes focus here
                        setTimeout(() => { mainWindow.show() }, 100);
                    }
        		} else if (newShortcuts.windowMode == "hidden") {
                    if (mainWindow.isVisible()) {
                        mainWindow.hide();
                    }
                }
				hackyStopSavePos = false;

				mainWindow.webContents.send('update-shortcuts', newShortcuts);
			} else {
				console.log("CANT FIND MAIN WINDOW WHEN LOADING SHORTCUTS");
			}
		} else {
			mainWindow.webContents.send('set-loading', appName);
			console.log('sending webview-parse-shortcuts with appName', appName);
			backgroundTaskRunnerWindow.webContents.send('webview-parse-shortcuts', appName);
		}
	});
}


// Events
app.on('window-all-closed', function() {
	app.quit();
});

app.on('activate-with-no-open-windows', () => {
	if (!mainWindow || !backgroundListenerWindow || !backgroundTaskRunnerWindow) {
		createWindows();
	}
});

app.on('ready', () => {
	createWindows();
	loadWithPeriods(backgroundTaskRunnerWindow.webContents.send('read-last-app-name'));
});

app.on('before-quit', (event) => {
	quitShortcutWizard();
});

ipcMain.on('get-app-name-sync', function(event) {
	event.returnValue = currentAppName;
});

ipcMain.on('main-app-switched-notification', function(event, appName) {
	// TODO: Make this list editable somewhere to avoid people having problems?
	if (appName == "Electron" || appName == "ShortcutWizard" ||
		appName == "ScreenSaverEngine" || appName == "loginwindow" ||
		appName == "Dock") {
		console.log("Not switching to this app: ", appName);
		return;
	}

	if (appName == currentAppName) {
		console.log("cannot switch to same app again");
		return;
	}

	if (!mainWindow) {
		console.log("cannot switch app without main window");
		return;
	}

	console.log(`${currentAppName} -> ${appName}`);


	// if (currentAppName) {
	// 	savePosition(currentAppName);
	// }
	// console.log('finished updating pos of app: ', currentAppName);
	// console.log("before loadWithPeriods, bounds was: ", mainWindow.getBounds());

	// TODO: add css spinner when this is running
	// TODO: load in background render thread
	loadWithPeriods(appName);
	console.log("finished loading pos for app: ", mainWindow.getBounds(), appName);
	currentAppName = appName;

	settingsWindow.webContents.send('app-changed', currentAppName);
});

ipcMain.on('main-parse-shortcuts-callback', function(event, payload) {
	console.log("main-parse-shortcuts-callback");
	if (payload) {
		updateRenderedShortcuts(payload);
		saveWithoutPeriods(payload);
	}
});

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	console.log('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	loadWithPeriods(appName);
});

ipcMain.on('update-shortcut-order', function(event, appName, shortcuts) {
	console.log('entered update-shortcut-order', appName);
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

// ipcMain.on('main-parse-shortcuts', function(event, ) {
// });
//
// ipcMain.on('change-window-mode', function(event, ) {
// });

ipcMain.on('open-settings', function(event) {
	ipcMain.send('open-settings');
});

// ipcMain.on('toggle-favorite-list-item', (event, listItemName) => {
// 	var holdShortcuts = inMemoryShortcuts[currentAppName];
// 	if (!holdShortcuts) {
// 		// how did we end up here??
// 		console.log("Could not find shortcuts in memory, needs loaded data");
// 		// loadWithPeriods(appName); // TODO: load shortcuts and do remaining work in callback here
// 	}
//
// 	var holdIndex = 0;
// 	var shortcuts = holdShortcuts.shortcuts;
// 	if (!shortcuts) {
// 		console.log("cant find shortcuts for ", listItemName);
// 		return;
// 	}
//
// 	var shortcut = undefined;
//
// 	var i;
// 	for (i = 0; i < shortcuts.length; i++) {
// 		if (shortcuts[i] && shortcuts[i].name == listItemName) {
// 			shortcut = shortcuts[i];
// 			console.log("found and set shortcut for favorite, breaking out: ", shortcut);
// 			break;
// 		}
// 	}
//
// 	if (!shortcut) {
// 		console.log("cant find shortcut in ", shortcuts);
// 		return;
// 	}
//
// 	shortcut.isFavorite = (shortcut.isFavorite) ? false : true;
// 	shortcuts[i] = shortcut;
// 	holdShortcuts.shortcuts = shortcuts;
// 	console.log("saving shortcutObject", shortcuts);
//
// 	db.update({
// 		name: currentAppName
// 	}, {
// 		$set: holdShortcuts
// 	}, {
// 		upsert: true
// 	}, (err, res) => {
// 		if (err) {
// 			console.log("error when updating favorite for list item ", listItemName);
// 		} else {
// 			console.log("succeeded toggling favorite: ", res);
// 			inMemoryShortcuts[currentAppName] = holdShortcuts;
//
// 			mainWindow.webContent.send('update-shortcuts', holdShortcuts);
// 		}
// 	});
// });


ipcMain.on('update-shortcut-item', (event, shortcutItem) => {
	var shortcutObject = {};
	shortcutObject[`shortcuts.${shortcutItem.name}`] = shortcutItem;

	if (!inMemoryShortcuts || !inMemoryShortcuts[currentAppName]) {
		console.log("error: no loaded shortcuts when updating with update-shortcut-item");
	} else {
		inMemoryShortcuts[currentAppName].shortcuts[shortcutItem.name] = shortcutItem;
	}

	db.update({
		name: currentAppName
	}, {
		$set: shortcutObject
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			console.log("error when updating favorite for list item ", listItemName);
		} else {
			console.log("succeeded favoriting item: ", res);
			loadWithPeriods(currentAppName); // TODO: Is this really needed? Double rendering
		}
	});
});

ipcMain.on('execute-list-item', (event, listItem) => {
	if (!listItem) {
		// how did we end up here??
		console.log("tried to execute non existent stuff");
		return;
		// loadWithPeriods(appName); // TODO: load shortcuts and do remaining work in callback here
	}

	var listItemName = listItem.name;
	var menu = listItem.menu;
	// TODO: Run applescript for opening menu here
	// - perhaps have a toggled state here, where first click sets state and shows the list item, and the second click executes
	console.log("calling execute-list-item with ", listItem);


	// Only check for shortcut values that can stand alone, and defines if the list item has
	// shortcuts that can be executed. Not sure how only a mod could be assigned, but it would
	// not be possible to execute that as a key combo.
	if (listItem.char || listItem.glyph) {
		// Found shortcuts, execute
		backgroundTaskRunnerWindow.webContents.send('webview-execute-shortcut', currentAppName, listItem);
	} else {
		// Did not find shortcuts, still attempt to execute the menu item by clicking it with applescript
		backgroundTaskRunnerWindow.webContents.send('webview-execute-menu-item', currentAppName, listItemName, menu);
	}
});

ipcMain.on('update-current-app-value', function(event, newAppValue) {
	console.log('on update-current-app-value with ', newAppValue);

	db.update({
		name: currentAppName
	}, {
		$set: newAppValue
	}, function(err, doc) {
		if (err) {
			console.log('failed to update current app value in "update-current-app-value"', err);
		} else {
			console.log('successfully updated app value');
		}
	});
});

ipcMain.on('set-full-view-mode', (event) => {
	console.log("entrypoint for set-full-view-mode");
	applyWindowMode("full");
});

ipcMain.on('set-bubble-mode', (event) => {
	console.log("entrypoint for set-bubble-mode");
	applyWindowMode("bubble");
});

ipcMain.on('set-hidden-mode', (event) => {
	console.log("entrypoint for set-hidden-mode");
	applyWindowMode("hidden");
});
