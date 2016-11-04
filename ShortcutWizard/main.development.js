import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
// var storageManager = require('app/storageManager');

// console.log(require('module').globalPaths);
// console.log(require('electron'));


let menu;
let template;
let mainWindow = null;
let backgroundWindow = null;
let settingsWindow = null;
let willQuitApp = false; // TODO: consider a cleaner approach

if (process.env.NODE_ENV === 'development') {
    require('electron-debug')(); // eslint-disable-line global-require
}

ipcMain.on('openSettingsPage', (event, args) => {
    settingsWindow = createSettingsWindow();
});

ipcMain.on('load-shortcuts-response', function(event, args) {
    // console.log('got response in main thread: ', args);
    // TODO: Get name at this point
    // storageManager.saveShortcut(args/*, name*/);
    mainWindow.webContents.send('load-shortcuts-response', args);
});

ipcMain.on('background-start', function(event, args) {
    console.log('TRIGGERED RELOADsHORTCUTS IN MAIN');
    // var existingShortcuts = storageManager.loadShortcut(/*name*/);
    // if (!existingShortcuts) {
      if (!args) { 
        args = "PomoDoneApp";
      }

        backgroundWindow.webContents.send('background-start-task', args);
        console.log('sent args to webcontents', args, backgroundWindow.webContents);
    // }
});


const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

console.log('about to set .on for app: ', app);
app.on('ready', async () => {
  await installExtensions();

  mainWindow = createMainWindow();
  backgroundWindow = createBackgroundWindow();
  console.log('+++++++++++++ backgroundWindow done creating');

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);
});

app.on('activate', () => mainWindow.show());
app.on('before-quit', () => willQuitApp = true);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function createSettingsWindow() {
  const newSettingsWindow = new BrowserWindow({
    show: true,
    width: 728,
    height: 500,
    acceptFirstMouse: true
  });

  newSettingsWindow.webContents.on('did-finish-load', () => {
    mainWindow.hide();
    newSettingsWindow.show();
    newSettingsWindow.focus();
  });

  newSettingsWindow.on('close', (e) => {
    newSettingsWindow.hide();
    mainWindow.show();
    mainWindow.focus();
    settingsWindow = null;
  });

  newSettingsWindow.loadURL(`file://${__dirname}/app/settings.html`);
  newSettingsWindow.openDevTools();
}


function createBackgroundWindow() {
  const newBackgroundWindow = new BrowserWindow({
    show: false,
    webPreferences: {
     webSecurity: false
   }
  });

  console.log('+++++++++++++ created new background window, now loading url');
  newBackgroundWindow.loadURL(`file://${__dirname}/app/background/index.html`);
  console.log('+++++++++++++ url loaded, returning windo', newBackgroundWindow);

  return newBackgroundWindow;
}

function createMainWindow() {
  const newMainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false,
    alwaysOnTop: true,
    acceptFirstMouse: true
  });

  newMainWindow.webContents.on('did-finish-load', () => {
    newMainWindow.show();
    newMainWindow.focus();
  });

  newMainWindow.on('close', (e) => {
    if (willQuitApp) {
      console.log('willQuitApp = true, setting newMainWindow to null');
      /* tried to quit the app */
      mainWindow = null;
    } else {
      /* only tried to close the newMainWindow */
      e.preventDefault();
      newMainWindow.hide();
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    // newMainWindow.openDevTools();
    newMainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          newMainWindow.inspectElement(x, y);
        }
      }]).popup(newMainWindow);
    });
  }

  if (process.platform === 'darwin') {
    template = [{
      label: 'Electron',
      submenu: [{
        label: 'About ElectronReact',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide ElectronReact',
        accelerator: 'Command+H',
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }]
    }, {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      }, {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      }, {
        type: 'separator'
      }, {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      }]
    }, {
      label: 'View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: 'Reload',
        accelerator: 'Command+R',
        click() {
          newMainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          newMainWindow.setFullScreen(!newMainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          newMainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          newMainWindow.setFullScreen(!newMainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      }, {
        label: 'Close',
        accelerator: 'Command+W',
        click() {
          newMainWindow.hide();
        }
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      label: '&File',
      submenu: [{
        label: '&Open',
        accelerator: 'Ctrl+O'
      }, {
        label: '&Close',
        accelerator: 'Ctrl+W',
        click() {
          newMainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          newMainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          newMainWindow.setFullScreen(!newMainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          newMainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          newMainWindow.setFullScreen(!newMainWindow.isFullScreen());
        }
      }]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Learn More',
        click() {
          shell.openExternal('http://electron.atom.io');
        }
      }, {
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }, {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://discuss.atom.io/c/electron');
        }
      }, {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/atom/electron/issues');
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    newMainWindow.setMenu(menu);
  }

  return newMainWindow;
}
