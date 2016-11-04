'use strict';
import { ipcRenderer } from 'electron';
const task = require('../shared/task.js');
console.log('before window onload', task);

console.log('background/index.js - outside window.onload');
window.onload = function () {
    console.log('background/index.js - inside window.onload');
    ipcRenderer.on('load-shortcuts', (startTime) => {
        console.log('#3 about to send with pomodoneapp hardcoded');

        ipcRenderer.send('load-shortcuts-response', {
            result: task("PomoDoneApp"),
            startTime: startTime
        });
    });
};