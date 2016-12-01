'use babel';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';

import { Settings } from './settings';
// console.log("first settings: ", Settings);
var settings = new Settings();
// const Settings = require('./settings/settings');
// console.log('imported settings: ', settings, JSON.stringify(settings) );
// console.log('>>> ', Settings());
// for (val in settings) {
// 	console.log(val);
// }
function makeColorString(color) {
	return `rgba(${ color.rgb.r }, ${ color.rgb.g }, ${ color.rgb.b }, ${ color.rgb.a })`;
}

var holdRemote = remote;

export default class SettingsView extends Component {
    componentWillMount() {
		settings.create(this);

		// TODO: Handle main window initialisation better by using sync messages?
		var mainWindowSettings = settings.get("mainWindow");
		ipcRenderer.send('main-window-settings', mainWindowSettings);

		// ipcRenderer.on('open-settings', (event) => {
		// 	console.log('entered open-settings');
		// 	this.toggleSettings();
		// });

		// TODO: tweak this to fit global and local settings
    	// var applySettingsToState = (event, newSettings) => {
	    //     this.setState(newSettings);
    	// };

		// TODO: Set this when window is about to show too
		this.setState({
			originalAppSettings: mainWindowSettings,
			originalGlobalSettings: mainWindowSettings,
			settings: mainWindowSettings
		});

        this.handleChangeComplete = this.handleChangeComplete.bind(this);
    }

    handleChangeComplete(color) {
    	console.log('hit handleChangeComplete with color ', color);
    	var colorString = makeColorString(color);
		var holdSettings = this.state.settings;
		holdSettings.background = colorString;
    	this.setState({
			settings: holdSettings
		});
    	window.document.documentElement.style.color = colorString;

        if (!settings.windowIds) {
            console.log("cant toggle settings without settings window id");
            return;
        }

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let settingsWindow = windows[i];
            if (settingsWindow && settingsWindow.id == settings.windowIds["settingsWindow"]) {
                settingsWindow.webContents.send('temporarily-update-app-setting', {
					background: colorString
				});
            }
        }
    }

	toggleTargetSettings() {
		// TODO: add confirmation dialog to not throw away settings as it is toggled?
    	console.log('NOT IMPLEMENTED show settings for current app');
		if (this.state.targetSettings == "global") {
			this.state.settings = this.state.originalAppSettings;
			this.state.targetSettings = this.state.settings.name;
		} else {
			this.state.targetSettings = "global";
			this.state.settings = this.state.originalGlobalSettings;
		}
	}

    render() {
    	if (this.state) {
    		console.log('about to render settings with state: ', this.state);
			// TODO: move these into a tab view, one for the current app and one for global
    		return (
    			<div style={{backgroundColor: this.state.settings.background}}>
                    <button style={{
						float:'left',
						backgroundColor: (this.state.targetSettings == 'global') ? 'blue' : 'white'
					}} className="simple-button" onClick={() => {
						this.toggleTargetSettings();
                    }}>Global settings</button>

                    <button style={{
						float:'right',
						backgroundColor: (this.state.targetSettings == 'global') ? 'white' : 'blue'
					}} className="simple-button" onClick={() => {
						this.toggleTargetSettings();
                    }}>Specific settings for {this.state.settings.name}</button>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var alwaysOnTop = !this.state.settings.alwaysOnTop;
	                    	this.setState({
								alwaysOnTop: alwaysOnTop
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		alwaysOnTop: alwaysOnTop
	                    	});
	                    }}>
		                    Float on top: {(this.state.settings.alwaysOnTop) ? "true" : "false"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
							var holdSettings = this.state.settings;
	                    	holdSettings.hidePerApp = !holdSettings.hidePerApp;
	                    	this.setState({
								settings: holdSettings
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		hidePerApp: holdSettings.hidePerApp
	                    	});
	                    }}>
				        	Hide individually per app: {(this.state.settings.hidePerApp) ? "On" : "Off"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
							var holdSettings = this.state.settings;
	                    	holdSettings.boundsPerApp = !holdSettings.boundsPerApp;
	                    	this.setState({
								settings: holdSettings
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		boundsPerApp: holdSettings.boundsPerApp
	                    	});
	                    }}>
				        	Size and position individually per app: {(this.state.settings.boundsPerApp) ? "On" : "Off"}
	                    </button>
		        	</li>

		        	<li>
		        		Choose color:
		    			<SketchPicker
		    				color={this.state.settings.background}
			    			onChangeComplete={this.handleChangeComplete}
		    			/>
		    		</li>

                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-refresh"></i></button>


                    <button style={{color:"white", float:'left'}} className="simple-button" onClick={() => {
                    	console.log('sending state as settings to "save-settings"', this.state.settings);
						// TODO: save to settings.js instead of index.js
                        ipcRenderer.send('save-settings', this.state.settings);
                        // TODO: close window
                    }}>Save</button>
                    <button style={{color:"white", float:'right'}} className="simple-button" onClick={() => {
                    	console.log('cancelling settings window');
                    	ipcRenderer.send('undo-settings');
                        // TODO: close window
                    }}>Cancel</button>
	    		</div>
			);
	  //   	return (
	  //   		<h1>hello from settings!</h1>
	  //   		<ul>
	  //   			{this.state.map(key, obj) {
	  //   				console.log('mapping over state in settings: ', key, obj);
	  //   				return (<li>{key}: {obj}</li>);
	  //   			}}
	  //   		</ul>
			// );
	    } else {
			// TODO: Add a refresh button in case something goes wrong and it needs to load again
	    	return (<h1>Settings loading...</h1>);
	    }
    }
}

window.onload = function(){
	ReactDOM.render(<SettingsView />, document.getElementById("settings-root"));
};
