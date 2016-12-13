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

        this.handleBackgroundColorChange = this.handleBackgroundColorChange.bind(this);
        this.handleItemColorChange = this.handleItemColorChange.bind(this);
        this.handleTextColorChange = this.handleTextColorChange.bind(this);
		this.saveCurrentSettings = this.saveCurrentSettings.bind(this);
		this.cancelCurrentSettings = this.cancelCurrentSettings.bind(this);
    }

	saveCurrentSettings() {
		settings.set(this.state.appSettings, this.state.globalSettings);

		// Send message to main window? it should always be loaded by the settings anyway..
        holdRemote.BrowserWindow.getFocusedWindow().hide();
	}

	cancelCurrentSettings() {
		settings.get(this.state.appSettings.name, (newSettings, globalSettings) => {
			// TODO: apply to main window and then close this settings window
			this.setState({
				globalSettings: globalSettings,
				appSettings: newSettings
			});

	        var windows = holdRemote.BrowserWindow.getAllWindows();
	        for (var i = 0; i < windows.length; i++) {
	            let holdWindow = windows[i];
	            if (holdWindow) {
					if (holdWindow.getTitle() == "mainWindow") {
						holdWindow.webContents.send('set-background-color', newSettings.backgroundColor);
					} else if (holdWindow.getTitle() == "settingsWindow") {
						holdWindow.hide();
					}
	            }
	        }
		});
	}

    handleBackgroundColorChange(color) {
    	console.log('hit handleChangeComplete with color ', color);
    	var colorString = makeColorString(color);
		var holdSettings = this.state.appSettings;
		holdSettings.backgroundColor = colorString;
    	this.setState({
			appSettings: holdSettings
		});

    	// window.document.documentElement.style.backgroundColor = colorString;

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-background-color', colorString);
            }
        }
    }

    handleTextColorChange(color) {
    	var colorString = makeColorString(color);
		var holdSettings = this.state.appSettings;
		holdSettings.textColor = colorString;
    	this.setState({
			appSettings: holdSettings
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-text-color', colorString);
            }
        }
    }

    handleItemColorChange(color) {
    	var colorString = makeColorString(color);
		var holdSettings = this.state.appSettings;
		holdSettings.itemColor = colorString;
    	this.setState({
			appSettings: holdSettings
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-item-color', colorString);
            }
        }
    }

    render() {
    	if (this.state && this.state.appSettings && this.state.globalSettings) {

	    	// window.document.documentElement.style.backgroundColor = this.state.appSettings.backgroundColor;

    		console.log('about to render settings with state and names: ', this.state);

			// TODO:
			// * add list view code from main window

    		return (
    			<div>
					<h1>Global settings (applies to all apps)</h1>

		        	<li>
	                    <button className="simple-button" onClick={() => {
							var holdSettings = this.state.globalSettings;
	                    	holdSettings.alwaysOnTop = !holdSettings.alwaysOnTop;
	                    	this.setState({
								globalSettings: holdSettings
							});

	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		alwaysOnTop: alwaysOnTop
	                    	});
	                    }}>
		                    Always float window on top of other windows? {(this.state.globalSettings.alwaysOnTop) ? "true" : "false"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
							var holdSettings = this.state.globalSettings;
	                    	holdSettings.hidePerApp = !holdSettings.hidePerApp;
	                    	this.setState({
								globalSettings: holdSettings
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		hidePerApp: holdSettings.hidePerApp
	                    	});
	                    }}>
				        	Set window state (regular, small, hidden) for all apps? {(this.state.globalSettings.hidePerApp) ? "On" : "Off"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
							var holdSettings = this.state.globalSettings;
	                    	holdSettings.boundsPerApp = !holdSettings.boundsPerApp;
	                    	this.setState({
								globalSettings: holdSettings
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		boundsPerApp: holdSettings.boundsPerApp
	                    	});
	                    }}>
				        	Use one window size for all apps? {(this.state.globalSettings.boundsPerApp) ? "On" : "Off"}
	                    </button>
		        	</li>


					<h1>Settings for {this.state.appSettings.name}</h1>

					<div style={{
						display: 'flex',
						flexDirection: 'row',
						margin: 'auto'
					}}>
						<div style={{flexDirection: 'column'}}>
			        		<h2>Background color</h2>
			    			<SketchPicker
			    				color={this.state.appSettings.backgroundColor}
				    			onChangeComplete={this.handleBackgroundColorChange}
			    			/>
						</div>
						<div style={{flexDirection: 'column'}}>
			        		<h2>Item color</h2>
							<SketchPicker
								color={this.state.appSettings.itemColor}
								onChangeComplete={this.handleItemColorChange}
							/>
						</div>
						<div style={{flexDirection: 'column'}}>
			        		<h2>Text color</h2>
							<SketchPicker
								color={this.state.appSettings.textColor}
								onChangeComplete={this.handleTextColorChange}
							/>
						</div>
					</div>

                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-refresh"></i></button>


                    <button style={{color:"black", float:'left'}} className="simple-button" onClick={() => {
						this.saveCurrentSettings();
                    }}>Save</button>
                    <button style={{color:"black", float:'right'}} className="simple-button" onClick={() => {
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
				        holdRemote.BrowserWindow.getFocusedWindow().hide()
					}}>Close settings</button>
				</div>
			);
	    }
    }
}

window.onload = function(){
	ReactDOM.render(<SettingsView />, document.getElementById("settings-root"));
};
