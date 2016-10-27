// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electronScreen = require('electron').screen

const size = electronScreen.getPrimaryDisplay().size
const message = `Your screen is: ${size.width}px x ${size.height}px`

document.getElementById('got-screen-info').innerHTML = message