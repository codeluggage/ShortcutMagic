'use strict';
import { ipcRenderer } from 'electron';
const readShortcuts = require('../shared/readShortcuts');

console.log('background/index.js - outside window.onload');
window.onload = function () {
       console.log('background/index.js - inside window.onload');
       ipcRenderer.on('load-shortcuts', (startTime) => {
               console.log('#3 - background/index.js - ipcRenderer.send("background-response" with task');
               ipcRenderer.send('load-shortcuts-response', {
                       result: readShortcuts(),
                       startTime: startTime
               });
       });
};