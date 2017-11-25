'use strict'

const log = require('electron-log');

log.transports.console.level = 'info';
log.transports.file.level = 'info';

const debugAllWindows = (allWindows) => {
	if (!allWindows) {
		log.info('Could not open dev tools for no windows')
		return
	}

	allWindows.forEach(w => debugWindow(w))
}

const debugWindow = (browserWindow) => {
	if (!browserWindow) {
		log.info('Could not open dev tools for window that does not exist')
		return
	}

	log.info('Opening dev tools for ', browserWindow.title)
	browserWindow.openDevTools()
}

module.exports = {
	debugAllWindows,
	debugWindow
}