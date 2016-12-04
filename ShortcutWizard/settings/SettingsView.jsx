'use babel';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';

import { Settings } from './settings';
// console.log("first settings: ", Settings);
var GLOBAL_SETTINGS = "all programs";
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

		// TODO: tweak this to fit global and local settings
    	// var applySettingsToState = (event, newSettings) => {
	    //     this.setState(newSettings);
    	// };

        this.handleChangeComplete = this.handleChangeComplete.bind(this);
		this.saveCurrentSettings = this.saveCurrentSettings.bind(this);
		this.cancelCurrentSettings = this.cancelCurrentSettings.bind(this);
    }

	saveCurrentSettings() {
		settings.set(this.state.settings);

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
			console.log("holdWindow : ", holdWindow.id);

            if (holdWindow && holdWindow.id == settings.windowIds["settingsWindow"]) {
                holdWindow.hide();
            }
        }
	}

	cancelCurrentSettings() {
		settings.get(this.state.settings.name, (newSettings) => {
			// TODO: apply to main window and then close this settings window
			this.setState({
				settings: newSettings
			});

	    	window.document.documentElement.style.backgroundColor = newSettings.backgroundColor;

	        var windows = holdRemote.BrowserWindow.getAllWindows();
	        for (var i = 0; i < windows.length; i++) {
	            let holdWindow = windows[i];
				console.log("holdWindow : ", holdWindow.id);

	            if (holdWindow) {
					if (holdWindow.id == settings.windowIds["settingsWindow"]) {
		                holdWindow.hide();
					} else if (holdWindow.id == settings.windowIds["mainWindow"]) {
						holdWindow.webContents.send('set-background-color', newSettings.backgroundColor);
					}
	            }
	        }
		});
	}

    handleChangeComplete(color) {
    	console.log('hit handleChangeComplete with color ', color);
    	var colorString = makeColorString(color);
		var holdSettings = this.state.settings;
		holdSettings.background = colorString;
    	this.setState({
			settings: holdSettings
		});
    	window.document.documentElement.style.backgroundColor = colorString;

        if (!settings.windowIds) {
            console.log("cant toggle settings without settings window id");
            return;
        }

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
			console.log("holdWindow : ", holdWindow.id);


            if (holdWindow && holdWindow.id == settings.windowIds["mainWindow"]) {
                holdWindow.webContents.send('temporarily-update-app-setting', {
					backgroundColor: colorString
				});
				// holdWindow.setBackgroundColor(colorString);
            }
        }
    }

	enableLocalSettings() {
		var original = this.state.settings;
		// Only care if we are coming from the specific settings we didn't already have:
		if (original.name == GLOBAL_SETTINGS) {
			this.setState({
				originalGlobalSettings: original,
				settings: this.originalAppSettings
			});
		}
	}

	enableGlobalSettings() {
		var original = this.state.settings;
		// Only care if we are coming from the global settings:
		if (original.name != GLOBAL_SETTINGS) {
			this.setState({
				originalAppSettings: original,
				settings: this.originalGlobalSettings
			});
		}
	}

    render() {
    	if (this.state) {
    		console.log('about to render settings with state and names: ', this.state,
				this.state.settings.name, this.state.originalAppSettings.name, this.state.originalGlobalSettings.name);
			// TODO: move these into a tab view, one for the current app and one for global

			// TODO: mark changed settings with a star * to indicate that they have changed
    		return (
    			<div style={{backgroundColor: this.state.settings.background}}>
					<h1>Settings for {this.settings.name}</h1>

                    <button style={{
						float:'left',
						backgroundColor: (this.state.settings.name == GLOBAL_SETTINGS) ? 'blue' : 'white'
					}} className="react-tabs" onClick={() => {
						this.enableGlobalSettings();
                    }}>Global settings</button>

                    <button style={{
						float:'right',
						backgroundColor: (this.state.settings.name != GLOBAL_SETTINGS) ? 'blue' : 'white'
					}} className="react-tabs" onClick={() => {
						this.enableLocalSettings();
                    }}>Settings for {this.state.originalAppSettings.name}</button>

		        	<li>
	                    <button className="simple-button" onClick={() => {
							var holdSettings = this.state.settings;
	                    	holdSettings.alwaysOnTop = !holdSettings.alwaysOnTop;
	                    	this.setState({
								settings: holdSettings
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
						this.saveCurrentSettings();
                    }}>Save</button>
                    <button style={{color:"white", float:'right'}} className="simple-button" onClick={() => {
						this.cancelCurrentSettings();
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
	    	return (
				<div>
					<h1>ShortcutWizard can't show the settings for some reason...</h1>
					<button onClick={() => {
				        var windows = holdRemote.BrowserWindow.getAllWindows();
				        for (var i = 0; i < windows.length; i++) {
				            let holdWindow = windows[i];
				            if (holdWindow && holdWindow.id == settings.windowIds["mainWindow"]) {
								holdWindow.hide();
				            }
				        }
					}}>Close settings</button>
				</div>
			);
	    }
    }
}

window.onload = function(){
	ReactDOM.render(<SettingsView />, document.getElementById("settings-root"));
};
