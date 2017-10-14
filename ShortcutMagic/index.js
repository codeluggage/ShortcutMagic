'use strict';

import Sudoer from 'electron-sudo';

const electron = require('electron')
const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    Menu,
    globalShortcut,
} = electron;
const { spawnSync } = require('child_process');
const deepEqual = require('deep-equal');
const parseShortcuts = require('./background/parseShortcuts.js');
const electronLocalshortcut = require('electron-localshortcut');
const log = require('electron-log');
const sizeOf = require('image-size');
const path = require('path');
const Datastore = require('nedb');

// Global (for now) objects:

const sudoer = new Sudoer({
	name: 'ShortcutMagic'
});
const gifDirectory = "~/Movies/Kaptures";
const defaultFullBounds = { x: 200, y: 100, width: 800, height: 600 };
const hiddenBounds  = { x: 89, y: 23, width: 0, height: 0 };
const defaultBubbleHeight = 130;
const defaultBubbleWidth = 250;

let oldMainWindowBounds = defaultFullBounds;

// the name of the app that was switched to last time, so we know it's the name of the currently active program
let currentProgramName = "ShortcutMagic-mac"; // TODO: Check for bugs with this when opening ShortcutMagic the first time
// controls the tray of the application
let trayObject;
// First batch of loaded shortcuts for browserwindows to immediately use
let firstPrograms = [];
// Measure how often we switch programs and try to parse new shortcuts, used to avoid looping endlessly when permissions are missing
let parseTimes = [];
// Show bubblewindow at intervals
let bubbleWindowTimeout;

// Browser windows:
let settingsWindow,
		miniSettingsWindow,
		mainWindow,
		backgroundTaskRunnerWindow,
		backgroundListenerWindow,
		welcomeWindow,
		tooltipWindow,
		gifRecorderWindow,
		gifCommunityWindow,
		bubbleWindow,
		learnWindow,
		surveyWindow,
		aboutWindow;

let inMemoryHiddenNotifications = {};
// These global settings are stored together with the shortcuts, and this is the "name":
const GLOBAL_SETTINGS_KEY = "all programs";
const DEFAULT_GLOBAL_SETTINGS = {
	timeoutRepeat: 0.4,
	showOnAppSwitch: true,
	neverShowBubbleWindow: false,
	survey: false,
};

// a hacky bad construct holding the shortcuts from the db in memory
// TODO: merge into a class that encapsulates the db and functionality, and caches things in memory without checking this array everywhere :|
let inMemoryShortcuts = {};
inMemoryShortcuts[GLOBAL_SETTINGS_KEY] = {
	name: GLOBAL_SETTINGS_KEY,
	showOnAppSwitch: DEFAULT_GLOBAL_SETTINGS.showOnAppSwitch,
	neverShowBubbleWindow: DEFAULT_GLOBAL_SETTINGS.neverShowBubbleWindow,
	timeoutRepeat: DEFAULT_GLOBAL_SETTINGS.timeoutRepeat,
};


// const weirdErrorPos = { x: 89, y: 23, width: 0, height: 0 };


let db;
let isQuitting = false; // TODO: find a better way to do this
let localShortcutsCreated = false; // TODO: find a better way to do this
let loadingText = null;
let recursiveCount = 0;
let recursiveLastFile;
let stopRecursiveLs = false;
let firstLoad = false;

log.transports.console.level = 'info';
log.transports.file.level = 'info';
// TODO: re-enable logging for autoUpdater when update functionality is back 
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

app.setName("ShortcutMagic");

// Start up a survey window after app has been running for a long time
// setTimeout(function() { if (!surveyWindow || !surveyWindow.isVisible()) createSurveyWindow()}, 30000);

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


// Functions
// =========

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
	    if (process.env.NODE_ENV === "development") {
		    getDb().remove({
		      name: "PomoDoneApp"
		    });
		  }

	  	return db;
	  } catch (e) {
	  	// Ignore exception from this
	  	log.error(e);
	  	return db;
	  }
  }

  return db;
}

function getBubbleWindowBounds() {
	const { width } = electron.screen.getPrimaryDisplay().workAreaSize

	return {
  	x: width - (defaultBubbleWidth - 35),
  	y: 35,
  	height: defaultBubbleHeight,
  	width: defaultBubbleWidth,
  };
}

// TODO: Convert callbacks to promises with new await keyword
function getShortcuts(cb) {
	if (inMemoryShortcuts[currentProgramName]) {
		cb(inMemoryShortcuts[currentProgramName]);
	} else {
		getDb().find({
			name: currentProgramName
		}, function(err, res) {
			if (err) {
				log.info('errored during db find: ', err);
				return;
			}

			if (res.length > 0) {
	      let currentShortcuts = inMemoryShortcuts[currentProgramName] = res[0];
	      log.info('loaded shortcuts', currentShortcuts.name, currentShortcuts.bounds, mainWindow.getBounds());
	      cb(inMemoryShortcuts[currentProgramName]);
			} else {
				cb(null);
			}
		});
	}
}

function showBubbleWindow() {
	if (inMemoryShortcuts[GLOBAL_SETTINGS_KEY].neverShowBubbleWindow) {
		console.log('showBubbleWindow - not showing because neverShowBubbleWindow is set');
		return;
	}

	console.log('bubbleWindow.setBounds(getBubbleWindowBounds());', bubbleWindow.getBounds());
	const bounds = getBubbleWindowBounds();
	console.log('new bounds: ', bounds);
	bubbleWindow.setBounds(bounds);
	console.log('bubbleWindow.getBounds', bubbleWindow.getBounds());
}

function hideMainWindow() {
	const oldBounds = mainWindow.getBounds();
	if (deepEqual(oldBounds, hiddenBounds)) {
		return;
	}

	oldMainWindowBounds = oldBounds;
	console.log('mainWindow.setBounds(getBubbleWindowBounds());', oldBounds);
	mainWindow.setBounds(hiddenBounds);
	console.log('mainWindow.getBounds', mainWindow.getBounds());
}

function showMainWindow() {
	const currentBounds = mainWindow.getBounds();

	console.log('mainWindow.setBounds(getBubbleWindowBounds());', currentBounds);
	mainWindow.setBounds(defaultFullBounds);
	console.log('mainWindow.getBounds', mainWindow.getBounds());
}

function hideBubbleWindow() {
	console.log('bubbleWindow.setBounds(getBubbleWindowBounds());', bubbleWindow.getBounds());
	bubbleWindow.setBounds(hiddenBounds);
	console.log('bubbleWindow.getBounds', bubbleWindow.getBounds());
}

function focusMainWindow() {
	mainWindow.show();
	mainWindow.focus();
}

function showShortcutWindows() {
	if (!mainWindow) return;

	log.info('showShortcutWindows calling showMainWindow');
	app.dock.show();
	focusMainWindow();
	showBubbleWindow();
}

function quitShortcutMagic() {
    // loop over browserwindows and destroy + null all?

    backgroundTaskRunnerWindow = null;
    mainWindow = null;
    welcomeWindow = null;
    bubbleWindow = null;
    // TODO: Re-enable when these windows are in use again
    // settingsWindow = null;
    // miniSettingsWindow = null;
    // gifRecorderWindow = null;
    // gifCommunityWindow = null;

    if (trayObject) {
        trayObject.destroy();
        trayObject = null;
    }
    if (backgroundListenerWindow) {
        backgroundListenerWindow.destroy(); // This holds on to objective c code, so we force destroy it
        backgroundListenerWindow = null;
    }
}

function createBubbleWindow() {
	if (bubbleWindow) {
		log.info('bubbleWindow already existed, exiting');
		return;
	}

	bubbleWindow = new BrowserWindow({
		title: "bubbleWindow",
		alwaysOnTop: true,
		acceptFirstClick: true,
		transparent: true,
		show: true,
		frame: false,
		x: hiddenBounds.x, y: hiddenBounds.y, width: hiddenBounds.width, height: hiddenBounds.height,
    webPreferences: {
      vibrancy: 'appearance-based',
    },
	});

	bubbleWindow.setHasShadow(false);

  bubbleWindow.on('close', (e) => {
  	if (!isQuitting) {
	  	e.preventDefault();
	  	hideBubbleWindow();
	  }
  });

  bubbleWindow.on('ready-to-show', (e) => {
  	bubbleWindow.webContents.send('set-programs', firstPrograms, currentProgramName);
  	showBubbleWindow();
  })

	var bubblePath = `file://${__dirname}/bubble/index.html`;
	bubbleWindow.loadURL(bubblePath);
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

function saveSuccessfulPermissions() {
  getDb().update({
    name: GLOBAL_SETTINGS_KEY
	}, {
		$set: {
			permission: true,
		}
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			log.info("could not save permissions to disk", err);
		} else {
			log.info("successfully saved permissions: ", res);
		}
	});
}

function permissionCheck(cb) {
	const holdDb = getDb();
	if (!holdDb || !holdDb.find) {
		cb(false);
	} else {
		holdDb.find({
			name: GLOBAL_SETTINGS_KEY,
		}, function(err, res) {
			if (err) {
				log.info(`error searching for ${GLOBAL_SETTINGS_KEY}: `, err);
			}

			if (res.length > 0) {
				cb(res[0].permission);
				return;
			}

			cb(false);
		});
	}
}

function permissionAttempt(cb) {
	const saveAndCb = (res) => {
		if (res) {
			saveSuccessfulPermissions();
		}

		cb(res);
	};

	const identifier = "com.electron.shortcutmagic-mac";

	// if (process.env.NODE_ENV === "development") {
	// 	console.log('>>>>>>>>>>>>>>>>> IGNORING PERMISSIONS <<<<<<<<<<<<<<<<<<<<');
	// 	saveAndCb(true);
	// }

	sudoer.spawn(`tccutil --enable ${identifier}`, [], {}).then((tccutilResult) => {
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
					saveAndCb(false);
				}
			}

			sudoer.spawn(`tccutil --insert ${identifier}`, [], {}).then((tccutilResult2) => {
				log.info("second tccutil attempt", tccutilResult2.stdout.toString(), tccutilResult2.stderr.toString());
				const tccutilResult2Err = tccutilResult2.stderr.toString();
				if (tccutilResult2Err) {
					log.info('installing tccutil failed, returning false for permissions', tccutilResult2Err);
					saveAndCb(false);
				}

				log.info('permissions success!');
				saveAndCb(true);
			});
		} else {
			log.info("tccutil installed");
			saveAndCb(true);
			// sudoer.spawn(`tccutil --list | grep ${identifier}`, [], {}).then((tccutilListResult) => {
			// 	log.info(tccutilListResult.stdout.toString());

			// 	if (tccutilListResult.stderr.toString()) {
			// 		log.info("error running sudo tccutil --list", tccutilListResult.stderr.toString());
			// 		saveAndCb(false);
			// 	}

			// 	if (tccutilListResult.stdout.toString() == "") {
			// 		log.info('empty grep, failed permissions');
			// 		saveAndCb(false);
			// 	}

			// 	if (tccutilListResult.stdout.toString() != identifier) {
			// 		log.info(`result is not equal to ${identifier}`);
			// 		saveAndCb(false);
			// 	}

			// 	log.info('permissions success!');
			// 	saveAndCb(true);
			// });
		}
	});
}

function createWindows() {
	console.log('createWindows called with firstPrograms length: ', firstPrograms.length);

	if (!global.folderPath) {
		console.log('setting folderpath on global, was -> is');
		console.log(global["folderPath"]);
  	global.folderPath = app.getPath('appData');
		console.log(global["folderPath"]);
	}

	let reallyQuit = true;
	const create = (success) => {
		getDb().find({}, function(err, res) {
			log.info('loaded programs, err? ', err);
			if (err) {
				log.info('errored during db find: ', err);
			} else {
				if (!res) {
					log.info('errored during db find: ', err);
				} else {
					firstPrograms = res;
				}

				const newGlobalSettings = firstPrograms.find(p => p.name == GLOBAL_SETTINGS_KEY);
				if (!newGlobalSettings) {
					firstPrograms.push(inMemoryShortcuts[GLOBAL_SETTINGS_KEY]);
				} else {
					inMemoryShortcuts[GLOBAL_SETTINGS_KEY] = Object.assign(inMemoryShortcuts[GLOBAL_SETTINGS_KEY], newGlobalSettings);
				}
			}

			// TODO: Re-enable old windows here again
			createBackgroundTaskRunnerWindow();
			createBackgroundListenerWindow();
			// createSettingsWindow();
			// createMiniSettingsWindow();
			createBubbleWindow();
			createMainWindow();
	    createTooltipWindow();
	    // createGifRecorderWindow();
	    // createGifCommunityWindow();
		});
  };

	// TODO: reduce this to only 1 permissionCheck and permissionAttempt and
	// don't keep all the logic in createWindows()
	permissionCheck((res) => {
		if (res) {
			create();
		} else {
			permissionAttempt((success) => {
				if (!success && reallyQuit) {
					return;
				}

				reallyQuit = false;
				create();
			});
		}
	});

	// TODO: Re-enable shortcuts for main window... somehow. 
   //  if (!localShortcutsCreated) {
   //  	localShortcutsCreated = true;
	  //   electronLocalshortcut.register(mainWindow, 'Cmd+1', () => {
	  //       log.info("hit execute");
	  //       mainWindow.webContents.send('execute-list-item', 1);
	  //   });

	  //   electronLocalshortcut.register(mainWindow, 'Cmd+2', () => {
	  //       log.info("hit execute");
	  //       mainWindow.webContents.send('execute-list-item', 2);
	  //   });

	  //   electronLocalshortcut.register(mainWindow, 'Cmd+3', () => {
	  //       log.info("hit execute");
	  //       mainWindow.webContents.send('execute-list-item', 3);
	  //   });

	  //   electronLocalshortcut.register(mainWindow, 'Cmd+4', () => {
	  //       log.info("hit execute");
	  //       mainWindow.webContents.send('execute-list-item', 4);
	  //   });

	  //   electronLocalshortcut.register(mainWindow, 'Cmd+5', () => {
	  //       log.info("hit execute");
	  //       mainWindow.webContents.send('execute-list-item', 5);
	  //   });
	  // }
	
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

	mainWindow = new BrowserWindow({
		name: "ShortcutMagic",
		title: "ShortcutMagic",
		acceptFirstClick: false,
		alwaysOnTop: false,
		frame: true,
		show: false,
		transparent: false,
	  x: defaultFullBounds.x, y: defaultFullBounds.y, width: defaultFullBounds.width, height: defaultFullBounds.height,
	});

	mainWindow.loadURL(`file://${__dirname}/components/index.html`);

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
			app.dock.hide();
    }
  });

  mainWindow.on('ready-to-show', (e) => {
  	mainWindow.webContents.send('set-programs', firstPrograms, currentProgramName);
  	bubbleWindow.webContents.send('set-programs', firstPrograms, currentProgramName);
  	app.dock.show();
  	mainWindow.show();
  });


  console.log('inMemoryShortcuts when mainWindow is created: ');
  console.log(inMemoryShortcuts);
  console.log(JSON.stringify(inMemoryShortcuts));

  if (!inMemoryShortcuts || !inMemoryShortcuts[GLOBAL_SETTINGS_KEY] || !inMemoryShortcuts[GLOBAL_SETTINGS_KEY].survey) {
  	const noSurveyTimeout = 10000;
  	console.log('starting with timeout... ', noSurveyTimeout);

		setTimeout(() => {
			console.log('survey firing ');
			mainWindow.webContents.send('show-survey-request');
		}, noSurveyTimeout);


  } else if (inMemoryShortcuts[GLOBAL_SETTINGS_KEY].survey == "cancelled") {
  	const cancelledTimeout = 15000;
  	console.log('starting with timeout... ', cancelledTimeout);

		setTimeout(() => {
			console.log('SURVEY > FIRING ');
			mainWindow.webContents.send('show-survey-request');
		}, cancelledTimeout);
  }
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

	if (bubbleWindow) {
		bubbleWindow.openDevTools();
	} else {
		log.info("cant find bubbleWindow to show");
	}
}

function createTray() {
	if (trayObject) {
		log.info('trayObject already existed, exiting');
		return;
	}

	// TODO: read if menu is dark or not, load white/black hat icon as response:
	// const osxPrefs = require('electron-osx-appearance');
	// const iconPath = path.join(__dirname, osxPrefs.isDarkMode() ? 'assets/wizard-white.png' : 'wizard.png');

	const iconPath = path.join(__dirname, 'assets/wizard_16x16.png');
	trayObject = new Tray(iconPath);

	log.info('created trayObject: ', trayObject);
	trayObject.setToolTip('ShortcutMagic!');
	trayObject.on('right-click', showShortcutWindows);


	const trayMenuTemplate = [{
		label: 'Show (right click the hat)',
		click: showShortcutWindows
	},
	{
		label: 'Open debugging windows',
		click: debugEverything,
	},
	{
		label: 'Quit',
		accelerator: 'Cmd+Q', 
		click: function () {
			isQuitting = true;
			app.quit();
			quitShortcutMagic();
		}
	}];

	trayObject.setContextMenu(Menu.buildFromTemplate(trayMenuTemplate));

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
		show: false,
		width: 800,
		height: 540,
		title: "welcomeWindow",
		alwaysOnTop: true,
		frame: false,
		nodeIntegration: true,
	});

	welcomeWindow.loadURL(`file://${__dirname}/welcome/index.html`);

	welcomeWindow.on('ready-to-show', event => {
		welcomeWindow.show();
	});

	welcomeWindow.on('closed', event => {
		log.info('in welcomewindow closed, isQuitting: ', isQuitting);
		welcomeWindow = null;
	});
}

function createSurveyWindow() {
	surveyWindow = new BrowserWindow({
		show: true,
		x: 350,
		y: 100,
		width: 806,
		height: 606,
		title: "Help make ShortcutMagic better by giving feedback",
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
		title: "Learn to use ShortcutMagic",
		alwaysOnTop: false,
		frame: true,
		nodeIntegration: true,
	});

	learnWindow.loadURL(`file://${__dirname}/learn/index.html`);

	learnWindow.on('closed', (e) => {
		if (!isQuitting) {
			e.preventDefault();
			learnWindow.hide();
		}
	});
}

function createAboutWindow() {
	if (aboutWindow) {
		log.info('aboutWindow already existed, exiting');
		return;
	}

	aboutWindow = new BrowserWindow({
		show: false,
		width: 600,
		height: 410,
		title: "About",
		alwaysOnTop: true,
		frame: true,
		nodeIntegration: true,
	});

	aboutWindow.loadURL(`file://${__dirname}/about/index.html`);

	aboutWindow.on('ready-to-show', event => {
		aboutWindow.show();
		aboutWindow.focus();
	});

	aboutWindow.on('closed', event => {
		aboutWindow = null;
	});
}

function saveWithoutPeriods(payload) {
	payload.bounds = mainWindow.getBounds();
	inMemoryShortcuts[payload.name] = payload;

	let savePayload = payload;
	let stringified = JSON.stringify(savePayload.shortcuts).replace(/\./g, 'u002e');
	savePayload.shortcuts = JSON.parse(stringified);

	console.log(payload);


	getDb().update({
		name: savePayload.name
	}, {
		$set: savePayload
	}, {
		upsert: true
	}, function(err, res) {
		if (err) {
			log.info('ERROR: upserting in db got error: ', err);
		} else {
			log.info('finished upserting shortcuts for ' + savePayload.name + ' in db');

			getDb().find({}, function(err, res) {
				log.info('loaded programs, err? ', err);
				if (err) {
					log.info('errored during db find: ', err);
					return;
				}
				if (!res || !res.length) {
					log.info('errored during db find: ', err);
					return;
				}

				mainWindow.webContents.send('set-programs', res, savePayload.name);
				bubbleWindow.webContents.send('set-programs', res, savePayload.name);
			});
		}
	});
}

function parseOrWait() {
	if (!loadingText) {
		if (parseTimes.length > 5) {
			const times = parseTimes.map(t => t.getTime());
			let prev;
			let deltas = times.map(t => { let ret = 0; if (prev) { ret = t - prev } prev = t; return ret }).sort().reverse();
			if (deltas[0] + deltas[1] + deltas[2] < 500) {
				//temp
				console.log('>>>>>>>>>>>>>>>> repeating too often, bailing out');
				mainWindow.webContents.send('permission-failure');
				parseTimes = [];
				return;
			}
		}
		hideMainWindow();

		loadingText = "Learning...";
		// mainWindow.webContents.send('set-loading', true);
		trayObject.setTitle(loadingText);
		hideBubbleWindow();

		log.info('calling parseShortcuts with currentProgramName', currentProgramName);
		parseShortcuts(currentProgramName, mainParseShortcutsCallback);
		parseTimes.push(new Date());
	} else {
		// TODO: Handle never ending shortcut parsing better
		// Clear out eventually
		setTimeout(() => {
			showBubbleWindow();
			showMainWindow();

			mainWindow.webContents.send('set-current-program', currentProgramName, inMemoryShortcuts[currentProgramName]);
			// mainWindow.webContents.send('set-loading', false);
			trayObject.setTitle("");
			loadingText = null;
		}, 20000);
	}
}

function loadWithPeriods(forceReload) {
	log.info(`entering loadWithPeriods with currentProgramName ${currentProgramName} and forceReload ${forceReload}`);

	if (!mainWindow) {
		log.info("no mainWindow when calling loadWithPeriods()");
	}

	if (!currentProgramName) {
		log.info("no currentProgramName when calling loadWithPeriods()");
	}

	if (forceReload) {
		parseOrWait();
		return;
	}


	getShortcuts((currentShortcuts) => {
		if (currentShortcuts) {
			log.info('loaded in memory shortcuts ', currentProgramName);
			console.log(' loadWithPeriods SENDING >>>>>>>>>>> ');
			console.log(currentProgramName);

			mainWindow.webContents.send('set-current-program', currentProgramName, inMemoryShortcuts[currentProgramName]);
			bubbleWindow.webContents.send('set-current-program-name', currentProgramName);

		} else {
			getDb().find({
				name: currentProgramName
			}, function(err, res) {
				log.info('loaded shortcuts, err? ', err);
				if (err) {
					log.info('errored during db find: ', err);
					return;
				}

				if (res.length > 0) {
		    	parseOrWait();
		    	return;
				}

				currentShortcuts = res[0];
				if (!currentShortcuts) {
					log.info('No data - parsing instead');
					parseOrWait();
					return;
				} else if (!currentShortcuts.bounds || deepEqual(currentShortcuts.bounds, hiddenBounds)) {
					log.info('ERROR bad data - loaded currentShortcuts but no bounds found! resetting to default');
					currentShortcuts.bounds = defaultFullBounds;
				}

				// Convert the sanitised periods into real periods again: 
				var stringified = JSON.stringify(currentShortcuts.shortcuts);
				stringified = stringified.replace(/u002e/g, '.');
				currentShortcuts.shortcuts = JSON.parse(stringified);

	      inMemoryShortcuts[currentProgramName] = currentShortcuts;

				console.log(' loadWithPeriods SENDING >>>>>>>>>>> ');
				console.log(currentProgramName);

				mainWindow.webContents.send('set-current-program', currentProgramName, inMemoryShortcuts[currentProgramName]);
				bubbleWindow.webContents.send('set-current-program-name', currentProgramName);
			});
		}
	});
}


ipcMain.on('show-window', () => {
  focusMainWindow();
});

ipcMain.on('blur-window', () => {
	mainWindow.hide();
});

ipcMain.on('show-mini-settings', (e) => {
    miniSettingsWindow.show();
});

// // You can use 'before-quit' instead of (or with) the close event
// app.on('before-quit', function (e) {
//     // Handle menu-item or keyboard shortcut quit here
//     if (!reallyQuit){
//         e.preventDefault();
//         mainWindow.hide();
//     }
// });

// Remove mainWindow.on('closed'), as it is redundant

// // Events
// app.on('window-all-closed', function() {
// 	app.quit();
// });

app.on('activate-with-no-open-windows', () => {
	if (!mainWindow || !backgroundListenerWindow || !backgroundTaskRunnerWindow) {
		createWindows();
	}

  mainWindow.show();
  showMainWindow();
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
        focusMainWindow();
    });

    // globalShortcut.register('Command+Shift+Alt+Up', function () {
    //     let currentBounds = mainWindow.getBounds();
    //     currentBounds.y -= 25;
    //     mainWindow.setBounds(currentBounds);
    // });

    // globalShortcut.register('Command+Shift+Alt+Left', function () {
    //     let currentBounds = mainWindow.getBounds();
    //     currentBounds.x -= 25;
    //     mainWindow.setBounds(currentBounds);
    // });

    // globalShortcut.register('Command+Shift+Alt+Down', function () {
    //     let currentBounds = mainWindow.getBounds();
    //     currentBounds.y += 25;
    //     mainWindow.setBounds(currentBounds);
    // });

    // globalShortcut.register('Command+Shift+Alt+Right', function () {
    //     let currentBounds = mainWindow.getBounds();
    //     currentBounds.x += 25;
    //     mainWindow.setBounds(currentBounds);
    // });

    globalShortcut.register('Command+Shift+Alt+S', function () {
        // TODO: Implement escape to drop focus and return to previous app
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('focus-search-field');
    });

	// createWindows();
	// loadWithPeriods(backgroundTaskRunnerWindow.webContents.send('read-last-app-name'));
    createTray();
    createLearnWindow();
    console.log('starting permission attempt.............................................................');
    permissionCheck((res) => res ? createWindows() : createWelcomeWindow());
});

app.on('before-quit', (event) => {
	log.info('in before-quit');
	isQuitting = true;
	globalShortcut.unregisterAll()
	quitShortcutMagic();
});

ipcMain.on('get-app-name-sync', function(event) {
	event.returnValue = currentProgramName;
});

// ipcMain.on('set-programs-async', (e) => {
// 	if (!inMemoryShortcuts || !inMemoryShortcuts.length) {
// 	  // TODO: At some point this might be too much to read at once?
// 		getDb().find({}, function(err, res) {
// 			if (err) {
// 				log.info('errored during db find: ', err);
// 				return;
// 			}

// 			if (res.length > 0) {
// 				// firstLoad = true;
// 				inMemoryShortcuts = res;
// 				mainWindow.webContents.send('set-programs', res);
// 				bubbleWindow.webContents.send('set-programs', res)
// 			} else {
// 				log.info('zero for res.length');
// 			}
// 		});
// 	} else {
// 		mainWindow.webContents.send('set-programs', inMemoryShortcuts);
// 		bubbleWindow.webContents.send('set-programs', inMemoryShortcuts)
// 	}
// });

ipcMain.on('main-app-switched-notification', appSwitched);

function appSwitched(event, appName) {
		const compare = appName.toLowerCase();

  if (compare === "screensaverengine" ||
      compare === "loginwindow" ||
      compare === "dock" ||
      compare === "google software update..." ||
      compare === "google software update" ||
      compare === "dropbox finder integration" ||
      compare === "kap" ||
      compare === "securityagent" ||
      compare === "airplayuiagent" ||
      compare === "coreservicesuiagent" ||
      compare === "mullvad" || 
      compare === "evernote helper" ||
      (compare === "electron" && process.env.NODE_ENV !== "development")) {
		log.info("Not switching to this app: ", appName);
		return;
	}

	// TODO: Make this list editable somewhere to avoid people having problems?
	// TODO: Convert to regex or match
	if ((compare === "shortcutmagic" && process.env.NODE_ENV !== "development") ||
			(compare === "shortcutmagic-mac" && process.env.NODE_ENV !== "development") ||
			(compare === "electron" && process.env.NODE_ENV === "development")) {
		
		mainWindow.show();
		mainWindow.focus();
		return;
	}

	if (compare == currentProgramName) {
		log.info("cannot switch to same app again");
		return;
	}

	if (!mainWindow) {
		log.info("cannot switch app without main window");
		return;
	}

	currentProgramName = appName;
	loadWithPeriods();
	console.log('appSwitched  with settings:  ');
	console.log(inMemoryShortcuts[GLOBAL_SETTINGS_KEY]);

	mainWindow.webContents.send('set-current-program', currentProgramName, inMemoryShortcuts[currentProgramName]);
	bubbleWindow.webContents.send('set-current-program-name', currentProgramName);

	if (!inMemoryShortcuts) { 
		showBubbleWindow();
		return;
	}

	const settings = inMemoryShortcuts[GLOBAL_SETTINGS_KEY];
	if (!settings || settings.neverShowBubbleWindow) {
		return;
	} 

	if (settings.showOnAppSwitch) {
		showBubbleWindow();
	}

	if (settings.timeoutRepeat && !bubbleWindowTimeout) {
		bubbleWindowTimeout = true;

		const repeatTimeout = inMemoryShortcuts[GLOBAL_SETTINGS_KEY].timeoutRepeat * 60000; // 1 minute

		// TODO: Make recursive to repeat on timeoutRepeat value
		const recursing = () => {
				setTimeout(() => {
					if (currentProgramName)
					bubbleWindowTimeout = false;
					bubbleWindow.webContents.send('set-current-program-name', null);
					showBubbleWindow();

					// TODO: Re-enable recursing when it can be stopped from overlapping
					// setTimeout(recursing, repeatTimeout); // Minutes to milliseconds 
				}, repeatTimeout); // Minutes to milliseconds 
		}

		recursing();
	}
}

function mainParseShortcutsCallback(payload) {
	log.info("mainParseShortcutsCallback");
	// mainWindow.webContents.send('set-loading', false);
	trayObject.setTitle("");
	loadingText = null;
	showBubbleWindow();
	showMainWindow();

	if (payload) {
		saveWithoutPeriods(payload);
	} else {
		appSwitched(null, currentProgramName);
	}

	const name = (payload) ? payload.name : currentProgramName;
	const program = (payload) ? payload : inMemoryShortcuts[currentProgramName];
	mainWindow.webContents.send('set-current-program', name, program);
}

ipcMain.on('main-parse-shortcuts', function(event, appName) {
	log.info('#2 - root index.js, triggered main-parse-shortcuts, with appName: ', appName, typeof appName);
	if (appName && currentProgramName !== appName) {
		appSwitched(event, appName);
	} else {
		appSwitched(event, currentProgramName);
	}

	loadWithPeriods(true);
});


ipcMain.on('open-settings', function(event) {
	ipcMain.send('open-settings');
});

ipcMain.on('update-shortcut-item', (event, shortcutItem) => {
	var shortcutObject = {};
	shortcutObject[`shortcuts.${shortcutItem.name}`] = shortcutItem;

	if (!inMemoryShortcuts || !inMemoryShortcuts[currentProgramName]) {
		log.info("error: no loaded shortcuts when updating with update-shortcut-item");
	} else {
		inMemoryShortcuts[currentProgramName].shortcuts[shortcutItem.name] = shortcutItem;
	}

	getDb().update({
		name: currentProgramName
	}, {
		$set: shortcutObject
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			log.info("error when updating favorite for list item ", listItemName);
		} else {
			log.info("saved ", shortcutObject, res);
			// loadWithPeriods();
		}
	});
});

ipcMain.on('execute-list-item', (event, listItem, targetProgramName) => {
	if (!listItem) {
		// how did we end up here??
		log.info("tried to execute non existent stuff");
		return;
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
		backgroundTaskRunnerWindow.webContents.send('webview-execute-shortcut', targetProgramName, listItem);
	} else {
		// Did not find shortcuts, still attempt to execute the menu item by clicking it with applescript
		backgroundTaskRunnerWindow.webContents.send('webview-execute-menu-item', targetProgramName, listItemName, menu);
	}
});

// TODO: merge with update-shortcut-item
ipcMain.on('update-current-app-value', function(event, newAppValue) {
	log.info('on update-current-app-value with ', newAppValue);

	// if (newAppValue.shortcuts.length < 2) {
		// throw new Error("NOT ENOUGH SHORTCUTS");
	// }

	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');
	console.log('saving update-current-app-value');
	console.log(newAppValue);
	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');


	getDb().update({
		name: currentProgramName
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

ipcMain.on('save-app-settings', (event, newSetting) => {
	console.log('save-app-settings with ');
	console.log(newSetting);

	Object.assign(inMemoryShortcuts[GLOBAL_SETTINGS_KEY], newSetting);

	// if (newSetting.shortcuts.length < 2) {
		// throw new Error("NOT ENOUGH SHORTCUTS");
	// }

  getDb().update({
    name: GLOBAL_SETTINGS_KEY
	}, {
		$set: inMemoryShortcuts[GLOBAL_SETTINGS_KEY],
	}, {
		upsert: true
	}, (err, res) => {
		if (err) {
			log.info("error when saving global settings", newSetting);
		} else {
			log.info("successfully saved global settings: ", res, inMemoryShortcuts[GLOBAL_SETTINGS_KEY]);
		}
	});
});

// ipcMain.on('temporarily-update-app-settings', (event, newSetting) => {
//     inMemoryShortcuts[GLOBAL_SETTINGS_KEY]["boundsPerApp"] = newSetting["boundsPerApp"];
//     inMemoryShortcuts[GLOBAL_SETTINGS_KEY]["alwaysOnTop"] = newSetting["alwaysOnTop"];
//     mainWindow.setAlwaysOnTop(newSetting["alwaysOnTop"]);
// });

ipcMain.on('unfocus-shortcutmagic', (event) => {
    // TODO: Fix unfocusing window properly
    mainWindow.blur();
    bubbleWindow.blur();
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
  gifRecorderWindow.webContents.send('recording-for-shortcut-in-path', listItem, gifPath, currentProgramName);
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

	// if (shortcutObject.shortcuts.length < 2) {
		// throw new Error("NOT ENOUGH SHORTCUTS");
	// }

	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');
	console.log('saving save-gif');
	console.log(shortcutObject);
	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');
	console.log('=============================================');


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
      console.log('savegif  SENDING >>>>>>>>>>> ');
      console.log(currentProgramName);

      mainWindow.webContents.send('set-current-program-name', currentProgramName);
      bubbleWindow.webContents.send('set-current-program-name', currentProgramName);
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
});

ipcMain.on('log', (event) => {
    log.info('logging from ipcMain.on "log" ');
    log.info(event);
});

ipcMain.on('welcome-window-ready', (event) => {
    createWindows();
    welcomeWindow.close();
    welcomeWindow = null;
});

ipcMain.on('open-learn', (e) => {
	if (!learnWindow) { 
		createLearnWindow();
	}

	learnWindow.show();
	learnWindow.focus();
});

ipcMain.on('hide-bubble-window', (e, manual) => {
	// if (manual) {
	// 	inMemoryHiddenNotifications[currentProgramName] = (inMemoryHiddenNotifications[currentProgramName] ? inMemoryHiddenNotifications[currentProgramName] + 1 : 1);

	// 	// TODO: Display prompt to hide forever?
	// 	if (!inMemoryShortcuts[currentProgramName].hideNotification && inMemoryHiddenNotifications[currentProgramName] > 1) {
	// 		bubbleWindow.webContents.send('prompt-to-hide', currentProgramName);
	// 		return;
	// 	}
	// }

	hideBubbleWindow();
});

ipcMain.on('force-to-top', (e, shortcut) => {
	mainWindow.webContents.send('force-to-top', shortcut);
});

ipcMain.on('open-about', (e) => {
	if (!aboutWindow) { 
		createAboutWindow();
	}
});

ipcMain.on('quit', (e) => {
	isQuitting = true;
	app.quit();
	quitShortcutMagic();
})

ipcMain.on('configure-suggestions', (e, mode) => {
	switch (mode) {
		case 0:
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].showOnAppSwitch = false;
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].timeoutRepeat = false;
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].neverShowBubbleWindow = true;
			break;
		case 1:
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].showOnAppSwitch = false;
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].timeoutRepeat = DEFAULT_GLOBAL_SETTINGS.timeoutRepeat;
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].neverShowBubbleWindow = false;
			break;
		case 2:
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].showOnAppSwitch = true;
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].timeoutRepeat = DEFAULT_GLOBAL_SETTINGS.timeoutRepeat;
			inMemoryShortcuts[GLOBAL_SETTINGS_KEY].neverShowBubbleWindow = false;
			break;
	}
});

ipcMain.on('show-survey-window', (e) => {
	createSurveyWindow();
});

ipcMain.on('answered-survey', (e) => {
	getDb().update({
		name: GLOBAL_SETTINGS_KEY,
	}, {
		$set: {
			survey: 'answered',
		}
	});
});

ipcMain.on('cancelled-survey', (e) => {
	getDb().update({
		name: GLOBAL_SETTINGS_KEY,
	}, {
		$set: {
			survey: 'cancelled',
		}
	});
});