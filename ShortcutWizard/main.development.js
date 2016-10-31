import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { createProxyForRemote, requireTaskPool  } from 'electron-remote';
import ReadShortcuts from './ReadShortcuts.js';
const readShortcutsModule = requireTaskPool(require.resolve('./ReadShortcuts.js'));


let menu;
let template;
let mainWindow = null;
// let backgroundWindow = null;
let settingsWindow = null;
let willQuitApp = false; // TODO: consider a cleaner approach
let remoteWindow = null;

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
}

ipcMain.on('openSettingsPage', (event, args) => {
  settingsWindow = createSettingsWindow();
});


ipcMain.on('reloadShortcuts', (event, args) => {
  console.log('+++++++++++++ about to call remoteWindow.readShortcuts');

  remoteWindow.readShortcuts().then((shortcuts) => {
    console.log('++++++++++++ DONE!!!!!!! calling event shortcutsReloaded with shortcuts: ', shortcuts);
    event.sender.send('shortcutsReloaded', shortcuts);
  })
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

app.on('ready', async () => {
  await installExtensions();

  console.log('+++++++ about to create mainWindow: ');
  createMainWindow();
  // console.log('+++++++++ created mainWindow, it should not have readShortcuts: ', mainWindow.readShortcuts);
  // window.readShortcuts = ReadShortcuts;
  console.log('+++++++++ set readShortcuts on WINDOW, it SHOULD have readShortcuts: ', window.readShortcuts);

  // backgroundWindow = createBackgroundWindow();

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);

  console.log('++++++++++++++ done loading url, initializing eval handler: ');
  initializeEvalHandler();
  console.log('++++++++++++++ done initializing eval handler, creating remote window:');
  remoteWindow = createProxyForRemote(window);
  // TODO TEST DETTE HER med nytt window
  console.log('+++++++++++++++ done creating remote window, it has shortcuts?', remoteWindow.readShortcuts);
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


// function createBackgroundWindow() {
//   const newBackgroundWindow = new BrowserWindow({
//     show: false,
//     invisible: true
//   });

//   console.log('+++++++++++++ created new background window, now loading url');
//   newBackgroundWindow.loadURL(`file://${__dirname}/app/backgroundIndex.html`);
//   console.log('+++++++++++++ url loaded, returning windo');

//   return newBackgroundWindow;
// }

function createMainWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false,
    alwaysOnTop: true,
    acceptFirstMouse: true
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', (e) => {
    if (willQuitApp) {
      console.log('willQuitApp = true, setting mainWindow to null');
      /* tried to quit the app */
      mainWindow = null;
    } else {
      /* only tried to close the mainWindow */
      e.preventDefault();
      mainWindow.hide();
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    // mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
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
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
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
          mainWindow.hide();
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
          mainWindow.close();
        }
      }]
    }, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() {
          mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
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
    mainWindow.setMenu(menu);
  }

  return newMainWindow;
}
