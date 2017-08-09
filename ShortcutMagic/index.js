'use strict';

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
    Menu,
    globalShortcut,
    // autoUpdater,
} = require('electron');
const os = require('os');
const log = require('electron-log');
const { spawnSync } = require('child_process');
const deepEqual = require('deep-equal');
const parseShortcuts = require('./background/parseShortcuts.js');
let isQuitting = false; // TODO: find a better way to do this
let localShortcutsCreated = false; // TODO: find a better way to do this


import Sudoer from 'electron-sudo';
const sudoer = new Sudoer({
	name: 'ShortcutMagic'
});



log.transports.console.level = 'info';
log.transports.file.level = 'info';
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


const electronLocalshortcut = require('electron-localshortcut');

	// TODO: Properly implement auto update releases
// autoUpdater.on('checking-for-update', () => {
// });
// autoUpdater.on('update-available', (event, info) => {
//     log.info('AUTOUPDATER: update-available', info);
//     //log.info('arguments', arguments);
// });
// autoUpdater.on('update-not-available', (event, info) => {
//     log.info('AUTOUPDATER: update-not-available', info);
//     //log.info('arguments', arguments);
// });
// autoUpdater.on('error', (event, error) => {
//     log.info('AUTOUPDATER: error ', error);
//     //log.info('arguments', arguments);
// });
// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
//     log.info('AUTOUPDATER: update-downloaded ', event, releaseNotes, releaseName, releaseDate, updateURL);
//     //log.info('arguments', arguments);

//     setTimeout(() => {
//         log.info("AUTOUPDATER:  autoUpdater.quitAndInstall();");
//         quitShortcutMagic();
//         autoUpdater.quitAndInstall();
//     }, 2000)
// });


// TODO: Fix preference crash when building release version
// these prefs let us determine if the menu bar is dark or light
// const osxPrefs = require('electron-osx-appearance');

import sizeOf from 'image-size';


// path lets us work with the file path of the running application
const path = require('path');
// nedb is a simple javascript database, smilar to mongodb, where we store the shortcuts and other things about another program
const Datastore = require('nedb');
// db is an instance of nedb and lets us store things on disk in pure text, and treat it like mongogetDb(). this stores the shortcut information
let db;

function getDb() {
  if (!db) {
  	try {
	  	global.folderPath = app.getPath('appData');
	  	const dbPath = `${global.folderPath}/ShortcutMagic/shortcuts.db`;
	    console.log('folderPath: ', dbPath);
	    console.log('dbPath: ', dbPath);

	    db = new Datastore({
	      filename: dbPath,
	      autoload: true,
	    });

	    // The field for "name" is the one we want to keep unique, so anything we write to the db for another running program is
	    // updated, and not duplicated.
	    // TODO: this is not always been unique and needs to be improved
	    getDb().ensureIndex({
	      fieldName: 'name',
	      unique: true // Setting unique value constraint on name
	    }, function (err) {
	      if (err) {
		      log.info('ERROR: getDb().ensureIndex failed to set unique constraint for shortcut db', err);
	      }
	    });


	    // For testing, we need to check parsing of shortcuts sometimes. These applications are simple and have few shortcuts,
	    // so they are quick to test with.
	    // TODO: Make this only run in debug/dev mode
	    log.info("temporary removal of PomoDoneApp and mysms shortcuts for testing, TODO: hard remove instead");
	    getDb().remove({
	      name: "PomoDoneApp"
	    });

	    getDb().remove({
	      name: "mysms"
	    });
	  	return db;
	  } catch (e) {
	  	// Ignore exception from this
	  	log.error(e);
	  	return db;
	  }
  }

  return db;
}

// These global settings are stored together with the shortcuts, and this is the "name":
var GLOBAL_SETTINGS = "all programs";

app.setName("ShortcutMagic");

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
// the gif-displaying tool tip window:
let tooltipWindow;
// the gif recording/saving window:
let gifRecorderWindow;
// the gifCommunity window:
let gifCommunityWindow

let learnWindow;
let surveyWindow;
setTimeout(function() { if (!surveyWindow) {createSurveyWindow()} surveyWindow.show()}, 800000)


// a hacky bad construct holding the shortcuts from the db in memory
// TODO: merge into a class that encapsulates the db and functionality, and caches things in memory without checking this array everywhere :|
let inMemoryShortcuts = [];
// the name of the app that was switched to last time, so we know it's the name of the currently active program
let currentAppName = "Electron"; // TODO: Check for bugs with this when opening ShortcutMagic the first time
// const weirdErrorPos = { x: 89, y: 23, width: 0, height: 0 };
// hackyStopSavePos needs to be replaced with a better system. right now it just stops the size and position of the application
// from being saved. this is typically set when we are loading a position or moving between window modes
let hackyStopSavePos = false;
// The default bounds are appliend when no other bounds are found, typically for new running programs we open and parse
// TODO: Save to settings db
const defaultFullBounds = {x: 1100, y: 150, width: 320, height: 700};
const hiddenBounds  = { x: 89, y: 23, width: 0, height: 0 };



// Functions

function updateInMemoryBounds(bounds, hidden) {
	const currentlyHidden = deepEqual(bounds, hiddenBounds);
	if (!inMemoryShortcuts[currentAppName]) {
		inMemoryShortcuts[currentAppName] = {
			bounds,
			hidden,
		};
	} else {
		inMemoryShortcuts[currentAppName].bounds = bounds;
		inMemoryShortcuts[currentAppName].hidden = hidden;
	}
}

// TODO: Use promise instead of this callback hell: 
function getShortcuts(cb) {
	if (inMemoryShortcuts[currentAppName]) {
		cb(inMemoryShortcuts[currentAppName]);
	} else {
		getDb().find({
			name: currentAppName
		}, function(err, res) {
			if (err) {
				log.info('errored during db find: ', err);
				return;
			}

			if (res.length > 0) {
	      let currentShortcuts = inMemoryShortcuts[currentAppName] = res[0];
	      log.info('loaded shortcuts', currentShortcuts.name, currentShortcuts.bounds, mainWindow.getBounds());
	      cb(inMemoryShortcuts[currentAppName]);
			} else {
				cb(null);
			}
		});
	}
}

function showMainWindow() {
	const bounds = mainWindow.getBounds();

	getShortcuts((currentShortcuts) => {
		if (currentShortcuts &&
			!deepEqual(currentShortcuts.bounds, hiddenBounds) &&
			(currentShortcuts.hidden || deepEqual(bounds, hiddenBounds))) {

			currentShortcuts.hidden = false;
			mainWindow.setBounds(currentShortcuts.bounds);
			updateInMemoryBounds(currentShortcuts.bounds, false);
		} else {
			mainWindow.setBounds(defaultFullBounds);
			updateInMemoryBounds(defaultFullBounds, false);
		}
	});
}

function hideMainWindow() {
	const bounds = mainWindow.getBounds();

	getShortcuts((currentShortcuts) => {
		// Already hidden?
		if (!deepEqual(bounds, hiddenBounds)) {
			hackyStopSavePos = true;
			mainWindow.setBounds(hiddenBounds);
			updateInMemoryBounds(bounds, true);
			hackyStopSavePos = false;
		}
	});
}

function toggleWindow() {
	if (!mainWindow) return;

	const bounds = mainWindow.getBounds();
	log.info('togglewindow with existing bounds: ', bounds);
	if (deepEqual(bounds, hiddenBounds)) {
		log.info('togglewindow calling showMainWindow');
		showMainWindow();
	} else {
		log.info('togglewindow calling hideMainWindow');
		hideMainWindow();
	}
}

function quitShortcutMagic() {
    // loop over browserwindows and destroy + null all?

    settingsWindow = null; // TODO: double check that the settings window isn't destroyed elsewhere
    miniSettingsWindow = null;
    backgroundTaskRunnerWindow = null;
    mainWindow = null;
    welcomeWindow = null;
    gifRecorderWindow = null;
    gifCommunityWindow = null;

    if (trayObject) {
        trayObject.destroy();
        trayObject = null;
    }
    if (backgroundListenerWindow) {
        backgroundListenerWindow.destroy(); // This holds on to objective c code, so we force destroy it
        backgroundListenerWindow = null;
    }
}

function savePosition() {
	if (!mainWindow) {
		log.info('no mainWindow in savePosition()');
		return;
	}

	const newBounds = mainWindow.getBounds();
	let oldBounds = null;

	getShortcuts((currentShortcuts) => {
		if (currentShortcuts) { 
			oldBounds = currentShortcuts.bounds;
		}

		updateInMemoryBounds(newBounds);

		log.info('savePosition() [FROM TO] ', oldBounds, newBounds);

		let payload = {
			hidden: deepEqual(newBounds, hiddenBounds)
		};

		if (!payload.hidden) {
			payload.bounds = newBounds;
		}

		getDb().update({
			name: currentAppName
		}, {
			$set: payload
		}, function(err, res) {
			if (err) {
				log.info('ERROR: upserting in db got error: ', err);
			} else {
				log.info('finished saving position, [NAME HIDDEN NEW ACTUAL] ', currentAppName, payload.hidden, payload.bounds, mainWindow.getBounds());
			}
		});
	});
}

function createMiniSettingsWindow() {
	if (miniSettingsWindow) {
		log.info('miniSettingsWindow already existed, exiting');
		return;
	}

	miniSettingsWindow = new BrowserWindow({
		show: false,
		title: "miniSettingsWindow",
		alwaysOnTop: true,
		acceptFirstClick: true,
		transparent: true,
		frame: false,
		x: 800, y: 50, width: 500, height: 700,
	});

	var settingsPath = `file://${__dirname}/settings/miniIndex.html`;
	miniSettingsWindow.loadURL(settingsPath);
}

function createSettingsWindow() {
	if (settingsWindow) {
		log.info('settingsWindow already existed, exiting');
		return;
	}

	settingsWindow = new BrowserWindow({
		show: false,
		title: "settingsWindow",
		alwaysOnTop: true,
		acceptFirstClick: true,
		frame: false,
		height: 600,
		width: 1000,
	});

	var settingsPath = `file://${__dirname}/settings/index.html`;
	log.info('settings path trying to load index: ', settingsPath);
	settingsWindow.loadURL(settingsPath);
	log.info("after loading url");
}

function permissionCheck(cb) {
	const identifier = "com.electron.shortcutmagic-mac";
	sudoer.spawn(`tccutil --insert ${identifier}`, [], {}).then((tccutilResult) => {
		const stdout = tccutilResult.stdout;
		log.info("tccutil insert: ", stdout.toString());
		const stderr = tccutilResult.stderr;
		log.info("tccutil err: ", stderr.toString());

		// TODO: Make more robust and portable in different OS versions
		if (tccutilResult.stderr.toString().trim() == "tccutil: Usage: tccutil reset SERVICE") {
			log.info("tccutil not installed");

			const installTccutil = spawnSync('brew', [
				'install',
				'tccutil'
			]);
			log.info(installTccutil.stdout, installTccutil.stderr);

			if (installTccutil.stderr) {
				log.info("error running brew install tccutil", installTccutil.stderr);

				const installBrew = spawnSync('/usr/bin/ruby', [
					'-e',
					'"$(curl',
					'-fsSL',
					'https://raw.githubusercontent.com/Homebrew/install/master/install)"',
				]);
				
				const installBrewErr = installBrew.stderr.toString();
				if (installBrewErr) {
					log.info('installBrewErr', installBrewErr);
					log.info('installing brew failed, returning false for permissions');
					cb(false);
				}
			}

			sudoer.spawn(`tccutil --insert ${identifier}`, [], {}).then((tccutilResult2) => {
				log.info("second tccutil attempt", tccutilResult2.stdout.toString(), tccutilResult2.stderr.toString());
				const tccutilResult2Err = tccutilResult2.stderr.toString();
				if (tccutilResult2Err) {
					log.info('installing tccutil failed, returning false for permissions', tccutilResult2Err);
					cb(false);
				}

				log.info('permissions success!');
				cb(true);
			});
		} else {
			log.info("tccutil installed");
			cb(true);
			// sudoer.spawn(`tccutil --list | grep ${identifier}`, [], {}).then((tccutilListResult) => {
			// 	log.info(tccutilListResult.stdout.toString());

			// 	if (tccutilListResult.stderr.toString()) {
			// 		log.info("error running sudo tccutil --list", tccutilListResult.stderr.toString());
			// 		cb(false);
			// 	}

			// 	if (tccutilListResult.stdout.toString() == "") {
			// 		log.info('empty grep, failed permissions');
			// 		cb(false);
			// 	}

			// 	if (tccutilListResult.stdout.toString() != identifier) {
			// 		log.info(`result is not equal to ${identifier}`);
			// 		cb(false);
			// 	}

			// 	log.info('permissions success!');
			// 	cb(true);
			// });
		}
	});
}

function createWindows() {
	if (!global.folderPath) {
		console.log('setting folderpath on global, was -> is');
		console.log(global["folderPath"]);
  	global.folderPath = app.getPath('appData');
		console.log(global["folderPath"]);
	}
	// keep it simple for now, change asap
	let reallyQuit = true;
	permissionCheck((success) => {
		if (!success && reallyQuit) {
			return;
		}

		reallyQuit = false;

		createBackgroundTaskRunnerWindow();
		createBackgroundListenerWindow();
		createSettingsWindow();
		createMiniSettingsWindow();
		createMainWindow();
    createTooltipWindow();
    createGifRecorderWindow();
    createGifCommunityWindow();

    if (!localShortcutsCreated) {
    	localShortcutsCreated = true;
	    electronLocalshortcut.register(mainWindow, 'Cmd+1', () => {
	        log.info("hit execute");
	        mainWindow.webContents.send('execute-list-item', 1);
	    });

	    electronLocalshortcut.register(mainWindow, 'Cmd+2', () => {
	        log.info("hit execute");
	        mainWindow.webContents.send('execute-list-item', 2);
	    });

	    electronLocalshortcut.register(mainWindow, 'Cmd+3', () => {
	        log.info("hit execute");
	        mainWindow.webContents.send('execute-list-item', 3);
	    });

	    electronLocalshortcut.register(mainWindow, 'Cmd+4', () => {
	        log.info("hit execute");
	        mainWindow.webContents.send('execute-list-item', 4);
	    });

	    electronLocalshortcut.register(mainWindow, 'Cmd+5', () => {
	        log.info("hit execute");
	        mainWindow.webContents.send('execute-list-item', 5);
	    });
	  }
	});
	
}

function createGifCommunityWindow() {
	if (gifCommunityWindow) {
		log.info('gifCommunityWindow already existed, exiting');
		return;
	}

    gifCommunityWindow = new BrowserWindow({
        name: "gifCommunityWindow",
        show: false,
        frame: true,
        x: 334, y: 153, width: 900, height: 600,
        nodeIntegration: false,
    });

    gifCommunityWindow.loadURL('https://shortcutmagic.meteorapp.com');
}

function createGifRecorderWindow() {
		if (gifRecorderWindow) {
			log.info('gifRecorderWindow already existed, exiting');
			return;
		}

    gifRecorderWindow = new BrowserWindow({
		name: "gifRecorderWindow",
        show: false,
        frame: false,
        acceptFirstClick: true,
        alwaysOnTop: true,
        x: 750, y: 153, width: 400, height: 400,
    });

    gifRecorderWindow.loadURL(`file://${__dirname}/gifRecorder/gifRecorder.html`);
}

function createTooltipWindow() {
	if (tooltipWindow) {
		log.info('tooltipWindow already existed, exiting');
		return;
	}

    tooltipWindow = new BrowserWindow({
		name: "tooltipWindow",
        show: false,
        frame: false,
        alwaysOnTop: true,
        x: 334, y: 153, width: 826, height: 568,
    });


    tooltipWindow.loadURL(`file://${__dirname}/tooltip/tooltip.html`);
}

function createMainWindow() {
	if (mainWindow) {
		log.info('mainWindow already existed, exiting');
		return;
	}
	if (!inMemoryShortcuts[GLOBAL_SETTINGS]) {
	    inMemoryShortcuts[GLOBAL_SETTINGS] = {
	        boundsPerApp: true,
	        alwaysOnTop: true,
	    };
	}

	// temp
	var res = [];
	inMemoryShortcuts[GLOBAL_SETTINGS]["boundsPerApp"] = (res["boundsPerApp"]) ? res["boundsPerApp"] : true;
	inMemoryShortcuts[GLOBAL_SETTINGS]["alwaysOnTop"] = (res["alwaysOnTop"]) ? res["alwaysOnTop"] : true;

	mainWindow = new BrowserWindow({
		name: "ShortcutMagic",
		title: "mainWindow",
		acceptFirstClick: true,
		alwaysOnTop: inMemoryShortcuts[GLOBAL_SETTINGS]["alwaysOnTop"],
		frame: false,
		show: true,
		transparent: true,
	  x: hiddenBounds.x,
	  y: hiddenBounds.y,
	  width: hiddenBounds.width,
	  height: hiddenBounds.height,
    webPreferences: {
      vibrancy: 'appearance-based',
    },
	});

	mainWindow.setHasShadow(false);

	mainWindow.loadURL(`file://${__dirname}/index.html`);

	mainWindow.on('resize', (event) => {
		log.info("//////////////////////////////////////// on.resize with hackyStopSavePos ", hackyStopSavePos);

		if (!hackyStopSavePos) {
			savePosition();
		}
	});

	mainWindow.on('moved', (event) => {
		log.info("//////////////////////////////////////// on.moved with hackyStopSavePos ", hackyStopSavePos);
		if (!hackyStopSavePos) {
			savePosition();
		}
	});

	showMainWindow();

    //   if (type == "appearance-based") {
    //     vibrancyType = NSVisualEffectMaterialAppearanceBased;
    //   } else if (type == "light") {
    //     vibrancyType = NSVisualEffectMaterialLight;
    //   } else if (type == "dark") {
    //     vibrancyType = NSVisualEffectMaterialDark;
    //   } else if (type == "titlebar") {
    //     vibrancyType = NSVisualEffectMaterialTitlebar;
    //   }
    //
    //   if (base::mac::IsOSYosemiteOrLater()) 
    //     if (type == "selection") {
    //       vibrancyType = NSVisualEffectMaterialSelection;
    //     } else if (type == "menu") {
    //       vibrancyType = NSVisualEffectMaterialMenu;
    //     } else if (type == "popover") {
    //       vibrancyType = NSVisualEffectMaterialPopover;
    //     } else if (type == "sidebar") {
    //       vibrancyType = NSVisualEffectMaterialSidebar;
    //     } else if (type == "medium-light") {
    //       vibrancyType = NSVisualEffectMaterialMediumLight;
    //     } else if (type == "ultra-dark") 
    //       vibrancyType = NSVisualEffectMaterialUltraDark;
}

function debugEverything() {
    if (mainWindow) {
        // mainWindow.show();
        mainWindow.openDevTools();
    } else {
        log.info("cant find mainwindow to show");
    }

    if (settingsWindow) {
        // settingsWindow.show();
        settingsWindow.openDevTools();
    } else {
        log.info("cant find settingswindow to show");
    }

    if (backgroundTaskRunnerWindow) {
        // backgroundTaskRunnerWindow.show();
        backgroundTaskRunnerWindow.openDevTools();
    } else {
        log.info("cant find backgroundTaskRunnerWindow to show");
    }

    if (backgroundListenerWindow) {
        // backgroundListenerWindow.show();
        backgroundListenerWindow.openDevTools();
    } else {
        log.info("cant find backgroundListenerWindow to show");
    }

    if (welcomeWindow) {
        // welcomeWindow.show();
        welcomeWindow.openDevTools();
    } else {
        log.info("cant find welcomeWindow to show");
    }

    if (miniSettingsWindow) {
        // miniSettingsWindow.show();
        miniSettingsWindow.openDevTools();
    } else {
        log.info("cant find miniSettingsWindow to show");
    }

	if (tooltipWindow) {
		// tooltipWindow.show();
		tooltipWindow.openDevTools();
	} else {
		log.info("cant find tooltipWindow to show");
	}

	if (gifRecorderWindow) {
		// gifRecorderWindow.show();
		gifRecorderWindow.openDevTools();
	} else {
		log.info("cant find gifRecorderWindow to show");
	}
}

function createTray() {
	if (trayObject) {
		log.info('trayObject already existed, exiting');
		return;
	}
	// TODO: read if menu is dark or not, load white/black hat icon as response:
	// const iconPath = path.join(__dirname, osxPrefs.isDarkMode() ? 'assets/wizard-white.png' : 'wizard.png');
	const iconPath = path.join(__dirname, 'assets/wizard_16x16.png');
	trayObject = new Tray(iconPath);

	log.info('created trayObject: ', trayObject);
	trayObject.setToolTip('ShortcutMagic!');
	trayObject.on('right-click', toggleWindow);


	const trayMenuTemplate = [{
		label: 'Show/Hide (right click)',
		click: toggleWindow
	},
	{
		label: 'Open debug windows (advanced)',
		click: debugEverything
	},
	{
		label: 'Quit',
		click: function () {
			app.quit();
			quitShortcutMagic();
		}
	}];
	const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
	trayObject.setContextMenu(trayMenu);

	return trayObject;
}

function createBackgroundTaskRunnerWindow() {
	if (backgroundTaskRunnerWindow) {
		log.info('backgroundTaskRunnerWindow already existed, exiting');
		return;
	}

	backgroundTaskRunnerWindow = new BrowserWindow({
		show: false,
		title: "backgroundTaskRunnerWindow"
	});

	log.info('#1 load window:');
	backgroundTaskRunnerWindow.loadURL(`file://${__dirname}/background/index.html`);
}

function createBackgroundListenerWindow() {
	if (backgroundListenerWindow) {
		log.info('backgroundListenerWindow already existed, exiting');
		return;
	}

	backgroundListenerWindow = new BrowserWindow({
		show: false,
		title: "backgroundListenerWindow"
	});

	log.info('loaded listener window');
	backgroundListenerWindow.loadURL(`file://${__dirname}/background/listener.html`);
}

function createWelcomeWindow() {
	if (welcomeWindow) {
		log.info('welcomeWindow already existed, exiting');
		return;
	}

	welcomeWindow = new BrowserWindow({
		show: true,
		width: 800,
		height: 720,
		title: "welcomeWindow",
		backgroundColor: "#323f53",
		alwaysOnTop: true,
		frame: false,
		nodeIntegration: true,
	});

	welcomeWindow.loadURL(`file://${__dirname}/welcome/index.html`);
	welcomeWindow.on('closed', event => {
		log.info('in welcomewindow closed, isQuitting: ', isQuitting);
		if (!isQuitting) {
			app.dock.hide(); // TODO: Read from settings instead
		}

		welcomeWindow = null;
	});
}

function createSurveyWindow() {
	if (surveyWindow) {
		log.info('surveyWindow already existed, exiting');
		return;
	}

	surveyWindow = new BrowserWindow({
		show: false,
		x: 350,
		y: 100,
		width: 800,
		height: 600,
		title: "surveyWindow",
		alwaysOnTop: true,
		frame: true,
		nodeIntegration: true,
	});

	surveyWindow.loadURL(`file://${__dirname}/survey/index.html`);

	// TODO: prevent closing and just hide
	surveyWindow.on('closed', event => {
		log.info('in surveyWindow closed');
	});
}

function createLearnWindow() {
	if (learnWindow) {
		log.info('learnWindow already existed, exiting');
		return;
	}

	learnWindow = new BrowserWindow({
		show: false,
		x: 40,
		y: 40,
		width: 1100,
		height: 800,
		name: "How to use ShortcutMagic efficiently",
		title: "learnWindow",
		alwaysOnTop: false,
		frame: true,
		nodeIntegration: true,
	});

	learnWindow.loadURL(`file://${__dirname}/learn/index.html`);

	// TODO: prevent closing and just hide
	learnWindow.on('closed', event => {
		log.info('in learnWindow closed');
	});
}

function updateRenderedShortcuts(shortcuts) {
	mainWindow.webContents.send('update-shortcuts', shortcuts);
}

function saveWithoutPeriods(payload) {
	payload.bounds = mainWindow.getBounds();

	inMemoryShortcuts[payload.name] = payload;

	var stringified = JSON.stringify(payload.shortcuts);
	stringified = stringified.replace(/\./g, 'u002e');
	payload.shortcuts = JSON.parse(stringified);

	getDb().update({
		name: payload.name
	}, {
		$set: payload
	}, {
		upsert: true
	}, function(err, res) {
		if (err) {
			log.info('ERROR: upserting in db got error: ', err);
		} else {
			log.info('finished upserting shortcuts for ' + payload.name + ' in db');
		}
	});
}

function loadWithPeriods() {
	log.info(`entering loadWithPeriods with currentAppName ${currentAppName}`);

	if (!mainWindow) {
		log.info("no mainWindow when calling loadWithPeriods()");
	}

	if (!currentAppName) {
		log.info("no currentAppName when calling loadWithPeriods()");
	}


	getShortcuts((currentShortcuts) => {
		if (currentShortcuts && currentShortcuts.bounds) {
			log.info('loaded in memory shortcuts, mainWindow bounds are [OLD NEW HIDDEN] ', mainWindow.getBounds(), currentShortcuts.bounds, currentShortcuts.hidden);

			hackyStopSavePos = true;
			mainWindow.setBounds(currentShortcuts.hidden ? hiddenBounds : currentShortcuts.bounds);
			hackyStopSavePos = false;

			mainWindow.webContents.send('update-shortcuts', currentShortcuts);
		} else {
			getDb().find({
				name: currentAppName
			}, function(err, res) {
				log.info('loaded shortcuts, err? ', err);
				if (err) {
					log.info('errored during db find: ', err);
					return;
				}

				if (res.length > 0) {
					currentShortcuts = res[0];
					if (!currentShortcuts) {
						log.info('ERROR bad data - loaded currentShortcuts but did not exist!');
						return;
					} else if (!currentShortcuts.bounds) {
						log.info('ERROR bad data - loaded currentShortcuts but no bounds found! resetting to default');
						currentShortcuts.bounds = defaultFullBounds;
					}

					// We replace the period with a character code so the db understands it as a single string
					// instead of sub-selecting items in the json:
					var stringified = JSON.stringify(currentShortcuts.shortcuts);
					stringified = stringified.replace(/u002e/g, '.');
					currentShortcuts.shortcuts = JSON.parse(stringified);

					log.info('loaded shortcuts from DB, bounds [OLD OLD-MEMORY NEW] ', mainWindow.getBounds(), (inMemoryShortcuts[currentAppName]) ? inMemoryShortcuts[currentAppName].bounds : null, currentShortcuts.bounds);
		      inMemoryShortcuts[currentAppName] = currentShortcuts;
		      mainWindow.setBounds(currentShortcuts.bounds);
		      mainWindow.webContents.send('update-shortcuts', currentShortcuts);
				} else {
					mainWindow.webContents.send('set-loading', currentAppName);
					trayObject.setTitle("Loading...");

					log.info('calling parseShortcuts with currentAppName', currentAppName);
					parseShortcuts(currentAppName, mainParseShortcutsCallback);
				}
			});
		}
	});
}


ipcMain.on("not-loading", (e) => {
	trayObject.setTitle("");
});

ipcMain.on('toggle-window', () => {
  toggleWindow();
});

ipcMain.on('show-window', () => {
  showMainWindow();
});

ipcMain.on('blur-window', () => {
	hideMainWindow();
});

ipcMain.on('show-mini-settings', (e) => {
    miniSettingsWindow.show();
});

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
	// TODO: Properly implement auto update releases

    // const checkForUpdates = () => {
    //     log.info("before AUTOUPDATER setFeedUrl");
    //     // const appVersion = app.getVersion();
    //     var platform = `${os.platform()}_${os.arch()}`;
    //     var version = app.getVersion();
    //     autoUpdater.setFeedURL(`https://shortcutmagic-updater.herokuapp.com/update/${platform}/${version}`);
    //     log.info("after AUTOUPDATER setFeedUrl");
    //     log.info("before AUTOUPDATER checkForUpdates");
    //     autoUpdater.checkForUpdates();
    //     // setTimeout(checkForUpdates, 3600000);
    // };

    // setTimeout(checkForUpdates, 1000);


    globalShortcut.register('Command+Shift+Alt+Space', function () {
        toggleWindow();
    });

    globalShortcut.register('Command+Shift+Alt+Up', function () {
        let currentBounds = mainWindow.getBounds();
        currentBounds.y -= 25;
        mainWindow.setBounds(currentBounds);
    });

    globalShortcut.register('Command+Shift+Alt+Left', function () {
        let currentBounds = mainWindow.getBounds();
        currentBounds.x -= 25;
        mainWindow.setBounds(currentBounds);
    });

    globalShortcut.register('Command+Shift+Alt+Down', function () {
        let currentBounds = mainWindow.getBounds();
        currentBounds.y += 25;
        mainWindow.setBounds(currentBounds);
    });

    globalShortcut.register('Command+Shift+Alt+Right', function () {
        let currentBounds = mainWindow.getBounds();
        currentBounds.x += 25;
        mainWindow.setBounds(currentBounds);
    });

    globalShortcut.register('Command+Shift+Alt+S', function () {
        // TODO: Implement escape to drop focus and return to previous app
        mainWindow.webContents.send('focus-search-field');
    });

	// createWindows();
	// loadWithPeriods(backgroundTaskRunnerWindow.webContents.send('read-last-app-name'));
    createWelcomeWindow();
    createLearnWindow();
    createTray();
    // createMainWindow();
});

app.on('before-quit', (event) => {
	log.info('in before-quit');
	isQuitting = true;
	globalShortcut.unregisterAll()
	quitShortcutMagic();
});

ipcMain.on('get-app-name-sync', function(event) {
	event.returnValue = currentAppName;
});

ipcMain.on('main-app-switched-notification', appSwitched);

function appSwitched(event, appName) {
	// TODO: Make this list editable somewhere to avoid people having problems?
    if (appName === "Electron" ||
        appName === "ShortcutMagic" ||
        appName === "ShortcutMagic-mac") {
        log.info("Not switching to ourselves, but sending 'focus-self' to main window");
        mainWindow.webContents.send('focus', true);
        return;
    }

    if (appName === "ScreenSaverEngine" ||
        appName === "loginwindow" ||
        appName === "Dock" ||
        appName === "Google Software Update..." ||
        appName === "Google Software Update" ||
        appName === "Dropbox Finder Integration" ||
        appName === "Kap" ||
        appName === "SecurityAgent" ||
        appName === "AirPlayUIAgent" ||
        appName === "CoreServicesUIAgent") {
		log.info("Not switching to this app: ", appName);
    mainWindow.webContents.send('focus', false);
		return;
	}

	if (appName == currentAppName) {
		log.info("cannot switch to same app again");
    mainWindow.webContents.send('focus', false);
		return;
	}

	if (!mainWindow) {
		log.info("cannot switch app without main window");
		return;
	}

	// log.info(`${currentAppName} -> ${appName}`);

	currentAppName = appName;
	loadWithPeriods();
	log.info("finished loading pos for app: ", mainWindow.getBounds(), appName);

	settingsWindow.webContents.send('app-changed', currentAppName);
	miniSettingsWindow.webContents.send('app-changed', currentAppName);
}

function mainParseShortcutsCallback(payload) {
	log.info("mainParseShortcutsCallback");

	if (payload) {
		updateRenderedShortcuts(payload);
		saveWithoutPeriods(payload);
	} else {
		appSwitched(null, currentAppName);
	}
}

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	log.info('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	if (appName && currentAppName !== appName) {
		appSwitched(event, appName);
	} else {
		appSwitched(event, currentAppName);
	}

	loadWithPeriods();
});

ipcMain.on('update-shortcut-order', function(event, appName, shortcuts) {
	log.info('entered update-shortcut-order', appName);
	getDb().update({
		name: appName
	}, {
		$set: {
			shortcuts: shortcuts
		}
	}, function(err, doc) {
		if (err) {
			log.info('failed to upsert shortcuts in "update-shortcut-order"', err);
		} else {
			log.info('succeeded in updating order of shortcuts');
		}
	});
});

ipcMain.on('open-settings', function(event) {
	ipcMain.send('open-settings');
});

ipcMain.on('update-shortcut-item', (event, shortcutItem) => {
	var shortcutObject = {};
	shortcutObject[`shortcuts.${shortcutItem.name}`] = shortcutItem;

	// TODO: use new function (callback hell) here until promises 
	if (!inMemoryShortcuts || !inMemoryShortcuts[currentAppName]) {
		log.info("error: no loaded shortcuts when updating with update-shortcut-item");
	} else {
		inMemoryShortcuts[currentAppName].shortcuts[shortcutItem.name] = shortcutItem;
	}

	getDb().update({
		name: currentAppName
	}, {
		$set: shortcutObject
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			log.info("error when updating favorite for list item ", listItemName);
		} else {
			log.info("succeeded favoriting item: ", res);
			loadWithPeriods(); // TODO: Is this really needed? Double rendering
		}
	});
});

ipcMain.on('execute-list-item', (event, listItem) => {
	if (!listItem) {
		// how did we end up here??
		log.info("tried to execute non existent stuff");
		return;
		// loadWithPeriods(); // TODO: load shortcuts and do remaining work in callback here
	}

	var listItemName = listItem.name;
	var menu = listItem.menu;
	// TODO: Run applescript for opening menu here
	// - perhaps have a toggled state here, where first click sets state and shows the list item, and the second click executes
	log.info("calling execute-list-item with ", listItem);


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
	log.info('on update-current-app-value with ', newAppValue);

	getDb().update({
		name: currentAppName
	}, {
		$set: newAppValue
	}, function(err, doc) {
		if (err) {
			log.info('failed to update current app value in "update-current-app-value"', err);
		} else {
			log.info('successfully updated app value');
		}
	});
});

ipcMain.on('set-full-view-mode', (event) => {
	showMainWindow();
});

ipcMain.on('set-hidden-mode', (event) => {
	hideMainWindow();
});

ipcMain.on('save-app-settings', (event, newSetting) => {
    inMemoryShortcuts[GLOBAL_SETTINGS]["boundsPerApp"] = newSetting["boundsPerApp"];
    inMemoryShortcuts[GLOBAL_SETTINGS]["alwaysOnTop"] = newSetting["alwaysOnTop"];
    mainWindow.setAlwaysOnTop(newSetting["alwaysOnTop"]);

    getDb().update({
        name: GLOBAL_SETTINGS
	}, {
		$set: newSetting
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			log.info("error when saving global settings", newSetting);
		} else {
			log.info("successfully saved global settings: ", res);
		}
	});
});

ipcMain.on('temporarily-update-app-settings', (event, newSetting) => {
    inMemoryShortcuts[GLOBAL_SETTINGS]["boundsPerApp"] = newSetting["boundsPerApp"];
    inMemoryShortcuts[GLOBAL_SETTINGS]["alwaysOnTop"] = newSetting["alwaysOnTop"];
    mainWindow.setAlwaysOnTop(newSetting["alwaysOnTop"]);
});

ipcMain.on('unfocus-main-window', (event) => {
    // TODO: Fix unfocusing window properly
    mainWindow.blur();
});

ipcMain.on('show-tooltip-for-list-item', (event, listItem) => {
    log.info(`in show-tooltip-for-list-item with ${JSON.stringify(listItem)}`);
    let originalBounds = tooltipWindow.getBounds();
    let mainBounds = mainWindow.getBounds();

    if (listItem.gif) {
        log.info("trying to call sizeOf with gif ", listItem.gif);
        var dimensions = sizeOf(listItem.gif);
        log.info("dimensions for gif: ", dimensions);

        if (!dimensions || !dimensions.height || !dimensions.width) {
            log.info("invalid dimensions: ", dimensions);
            return;
        }

        originalBounds.height = dimensions.height;
        originalBounds.width = dimensions.width;
    }

    // Show window left or right of main window depending on screen position:
    if (mainBounds.x > 600) {
        originalBounds.x = mainBounds.x - originalBounds.width;
    } else {
        originalBounds.x = mainBounds.x + mainBounds.width;
    }

    tooltipWindow.setBounds(originalBounds);
    tooltipWindow.webContents.send('set-gif', listItem);
    tooltipWindow.show();
})

ipcMain.on('hide-tooltip', (event) => {
    // tooltipWindow.webContents.send('reset');
    tooltipWindow.hide();
});

let gifDirectory = "~/Movies/Kaptures";
let recursiveCount = 0;
let recursiveLastFile;
let stopRecursiveLs = false;
function recursiveLs() {
	log.info("inside recursiveLs", ++recursiveCount);

	// Grab latest file that matches .gif from the gif directory
  const result = spawnSync( 'ls ', [ '-lrtc', '-d', '-1', '${gifDirectory}/*', '|', 'grep', '.gif' ] );
  var stderr = result.stderr;
  var stdout = result.stdout;

  if (stderr) {
  	log.info("errored when running ls: ", stderr);
    recursiveLastFile = undefined;
    stopRecursiveLs = true;
  }

	// Cut last newline from ls command
	let gifFile = stdout.substr(0, stdout.length - 1);
	// Extract last filename, ordered by time
	let newFile = gifFile.substr(stdout.lastIndexOf("\n") + 1, gifFile.length);

	if (recursiveLastFile && newFile != recursiveLastFile) {
		gifRecorderWindow.webContents.send('file-detected', `${newFile}`);
	} else {
		recursiveLastFile = newFile;
	}

	// check logic
	if (!stopRecursiveLs) {
		setTimeout(recursiveLs, 2000);
	} else {
		stopRecursiveLs = false;
	}
}


ipcMain.on('record-gif', (event, listItem) => {
	// TODO: Go further than just opening? Or show how to use Kap in a tutorial
  const result = spawnSync( 'open', [ '/Applications/Kap.app' ] );

  if (result.stderr) {
    log.info("errored when opening Kap.app: ", stderr);
    recursiveLastFile = undefined;
    stopRecursiveLs = true;
  }

  // TODO: Customize from gifRecorderWindow
  let gifPath = "~/Movies/Kaptures";
  gifRecorderWindow.webContents.send('recording-for-shortcut-in-path', listItem, gifPath, currentAppName);
  // TODO: Display on the list item itself instead? Less easy to hide in the recording... 
  gifRecorderWindow.show();

  recursiveLs();
});

ipcMain.on('cancel-gif-recording', (event) => {
    stopRecursiveLs = true;
    recursiveLastFile = undefined;
});

ipcMain.on('keep-recording-gif', (event) => {
    recursiveLastFile = undefined;
});

ipcMain.on('save-gif', (event, newGif, listItem, appName) => {
	gifRecorderWindow.hide();

	listItem.gif = newGif;
	stopRecursiveLs = true;
	recursiveLastFile = undefined;

	let shortcutObject = {};
	shortcutObject[`shortcuts.${listItem.name}`] = listItem;
	log.info("updating shortcut with gif: ", listItem);

	if (!inMemoryShortcuts || !inMemoryShortcuts[appName]) {
		log.info("error: no loaded shortcuts when saving with save-gif");
	} else {
		inMemoryShortcuts[appName].shortcuts[listItem.name] = listItem;
	}

	getDb().update({
        name: appName
	}, {
		$set: shortcutObject
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			log.info("error saving new gif", err, newGif);
		} else {
      // This might update the window with other shortcuts than the one we just recorded a gif for. That is ok
      // because the gif will be visible when they switch back to that app again.
      mainWindow.webContents.send('update-shortcuts', inMemoryShortcuts[currentAppName]);
			log.info("successfuly saved new gif", res);
		}
	});
});


ipcMain.on('toggle-gif-community', (event) => {
	if (gifCommunityWindow.isVisible()) {
		gifCommunityWindow.blur();
	} else {
		gifCommunityWindow.show();
		gifCommunityWindow.focus();
	}
});

ipcMain.on('create-windows', (event) => {
    createWindows();
    mainWindow.show();
});

ipcMain.on('log', (event) => {
    log.info('logging from ipcMain.on "log" ');
    log.info(event);
});

ipcMain.on('welcome-window-ready', (event) => {
    createWindows();
});

ipcMain.on('open-learn', (e) => {
	if (!learnWindow) { 
		createLearnWindow();
	}

	learnWindow.show();
	learnWindow.focus();
});