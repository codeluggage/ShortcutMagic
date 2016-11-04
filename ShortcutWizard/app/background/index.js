'use strict';
import { ipcRenderer } from 'electron';
const task = require('../shared/task');
console.log('before window onload', task);

console.log('background/index.js - outside window.onload');
window.onload = function () {
    console.log('background/index.js - inside window.onload');
    ipcRenderer.on('background-start-task', (appName) => {
        console.log('#3 about to send with pomodoneapp hardcoded');

        ipcRenderer.send('load-shortcuts-response', {
            result: task(appName),
            startTime: startTime
        });
    });
};