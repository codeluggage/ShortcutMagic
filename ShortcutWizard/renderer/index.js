'use strict';
const { ipcRenderer } = require('electron');
const unwrapShortcuts = require('../unwrapShortcuts.js');
const readShortcuts = require('../background/readShortcuts.js');

window.onload = function () {
	// Loading UI: 
	const progressBar = document.getElementById('progress-bar');


	console.log('--- starting read');
	var desc = readShortcuts("PomoDoneApp");
	console.log('--- starting unwrap');
	var unwrapped = unwrapShortcuts(desc);
	console.log('ended unwrap with: ', unwrapped);




	
	function startProcess() {
		document.getElementById('status').textContent = 'Started!';
		setInterval(() => {
			const maxValue = parseInt(progressBar.getAttribute('max'), 10);
			let nextValue = parseInt(progressBar.getAttribute('value'), 10) + 1;

			if (nextValue > maxValue) {
				nextValue = 0;
			}

			progressBar.setAttribute('value', nextValue);
		}, 25);

	}

	function finishProcess(result, timeElapsed) {
		progressBar.setAttribute('value', 0);
		document.getElementById('status').textContent =
			'Finished with a result of: ' +
			result +
			' in ' +
			(timeElapsed / 1000) +
			' seconds';
	}


	const backgroundButton = document.getElementById('in-background');

	backgroundButton.onclick = function longRunningBackgroundTask() {
		// We have to cast to a number because crossing the IPC boundary will convert the Date object to an empty object.
		// Error, Date and native objects won't be able to be passed around via IPC.
		const backgroundStartTime = +new Date();

		startProcess();
		console.log('renderer/index.js - sending ipc for background-start-task');
		ipcRenderer.send('background-start', backgroundStartTime);
	}

	ipcRenderer.on('background-response', (event, payload) => {
		console.log('renderer/index.js - ipcRenderer.on("background-response", (event, payload) => {');

		finishProcess(payload.result, new Date() - payload.startTime);
	});
};
