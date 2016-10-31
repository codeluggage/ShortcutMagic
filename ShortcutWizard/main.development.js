import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import createElectronWorker from './createElectronWorker.js';
import http from 'http';

var port = process.env.ELECTRON_WORKER_PORT,
    host = process.env.ELECTRON_WORKER_HOST,
    workerId = process.env.ELECTRON_WORKER_ID; // worker id useful for logging


let menu;
let template;
let mainWindow = null;
let backgroundWindow = null;
let settingsWindow = null;
let willQuitApp = false; // TODO: consider a cleaner approach

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
}

// ipcMain.on('openSettingsPage', (event, args) => {
//   settingsWindow = new BrowserWindow({
//     show: true,
//     width: 728,
//     height: 500,
//     acceptFirstMouse: true
//   });

//   settingsWindow.webContents.on('did-finish-load', () => {
//     mainWindow.hide();
//     settingsWindow.show();
//     settingsWindow.focus();
//   });

//   settingsWindow.on('close', (e) => {
//     settingsWindow.hide();
//     mainWindow.show();
//     mainWindow.focus();
//     settingsWindow = null;
//   });

//   settingsWindow.loadURL(`file://${__dirname}/app/settings.html`);
//   mainWindow.openDevTools();
// });


ipcMain.on('reloadShortcuts', (event, args) => {
  console.log('triggered reloadShortcuts, about to create electronworker');
  createElectronWorker();
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

  mainWindow = createMainWindow();
  // backgroundWindow = createBackgroundWindow();

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);
  mainWindow.show();

    // you can use any webserver library/framework you like (connect, express, hapi, etc)
  console.log('creating server: ');
  var server = http.createServer(function(req, res) {
    console.log('inside createserver call, req res: ', req, res);
    // You can respond with a status `500` if you want to indicate that something went wrong
    res.writeHead(200, {'Content-Type': 'application/json'});
    // data passed to `electronWorkers.execute` will be available in req body
    req.pipe(res);
  });
  console.log(server);

  server.listen(port, host);
  console.log('server listening');
});

app.on('activate', () => {
  console.log('about to call show', mainWindow);
  if (mainWindow) mainWindow.show()
});

app.on('before-quit', () => willQuitApp = true);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});



// function createBackgroundWindow() {
//   const win = new BrowserWindow({
//     show: false
//   });

//   win.loadURL(`file://${__dirname}/background/index.html`);

//   return win;
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
    console.log('>>>>>>>>> hit mainWindow on close');
    if (willQuitApp) {
      console.log('willQuitApp = true, setting mainWindow to null');
      /* tried to quit the app */
      mainWindow = null;
    } else {
      console.log('willQuitApp = false, hiding mainWindow');
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

  return mainWindow;
}
