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

var beautifulColors = ["#ffffff", "#000000", "#2c7bb6",  "#00a6ca", "#00ccbc",
	"#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];

function makeColorString(color) {
	return `rgba(${ color.rgb.r }, ${ color.rgb.g }, ${ color.rgb.b }, ${ color.rgb.a })`;
}

var holdRemote = remote;


export default class SettingsView extends Component {
    componentWillMount() {
		settings.create(this);

		ipcRenderer.on('set-background-color', (event, color) => {
			this.handleBackgroundColorChange(color);
		});
		ipcRenderer.on('set-item-color', (event, color) => {
			this.handleItemColorChange(color);
		});
		ipcRenderer.on('set-text-color', (event, color) => {
			this.handleTextColorChange(color);
		});
		ipcRenderer.on('set-item-background-color', (event, color) => {
			this.handleItemBackgroundColorChange(color);
		});
		ipcRenderer.on('save', (event) => {
			this.saveCurrentSettings();
		});
		ipcRenderer.on('get-app-settings', (event) => {
            var windows = holdRemote.BrowserWindow.getAllWindows();
            for (var i = 0; i < windows.length; i++) {
                let holdWindow = windows[i];
                if (holdWindow && holdWindow.getTitle() == "miniSettingsWindow") {
                    console.log("inside settingsWindow sending to miniSettingsWindow: ", this.state.appSettings);
                    holdWindow.webContents.send('send-app-settings', this.state.appSettings);
                }
            }
		});

		// TODO: tweak this to fit global and local settings
    	// var applySettingsToState = (event, newSettings) => {
	    //     this.setState(newSettings);
    	// };

        this.handleBackgroundColorChange = this.handleBackgroundColorChange.bind(this);
        this.handleItemColorChange = this.handleItemColorChange.bind(this);
        this.handleTextColorChange = this.handleTextColorChange.bind(this);
        this.handleItemBackgroundColorChange = this.handleItemBackgroundColorChange.bind(this);
		this.saveCurrentSettings = this.saveCurrentSettings.bind(this);
		this.cancelCurrentSettings = this.cancelCurrentSettings.bind(this);
    }

	saveCurrentSettings() {
		settings.set(this.state.appSettings, this.state.globalSettings);
	}

	cancelCurrentSettings() {
		settings.get(this.state.appSettings.name, (originalSettings, globalSettings) => {
			this.setState({
				globalSettings: globalSettings,
				appSettings: originalSettings
			});

	        var windows = holdRemote.BrowserWindow.getAllWindows();
	        for (var i = 0; i < windows.length; i++) {
	            let holdWindow = windows[i];
	            if (holdWindow) {
					if (holdWindow.getTitle() == "mainWindow") {
						// TODO: Is this needed when it's already updated?
						holdWindow.webContents.send('set-background-color', originalSettings.backgroundColor);
						holdWindow.webContents.send('set-item-color', originalSettings.itemColor);
						holdWindow.webContents.send('set-item-background-color', originalSettings.itemBackgroundColor);
						holdWindow.webContents.send('set-text-color', originalSettings.textColor);
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

	handleItemBackgroundColorChange(color) {
    	var colorString = makeColorString(color);
		var holdSettings = this.state.appSettings;
		holdSettings.itemBackgroundColor = colorString;
    	this.setState({
			appSettings: holdSettings
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-item-background-color', colorString);
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


            // Potential future settings:
    		        	// <li>
    					// 	Set window state (regular/small/hidden) for all apps?
    	                //     <button className="simple-button" onClick={() => {
    					// 		var holdSettings = this.state.globalSettings;
    	                //     	holdSettings.hidePerApp = !holdSettings.hidePerApp;
    	                //     	this.setState({
    					// 			globalSettings: holdSettings
    					// 		});
    	                //     	ipcRenderer.send('temporarily-update-app-settings', {
    	                //     		hidePerApp: holdSettings.hidePerApp
    	                //     	});
    	                //     }}>
    				    //     	{(this.state.globalSettings.hidePerApp) ? "On" : "Off"}
    	                //     </button>
    		        	// </li>
    		        	// <li>
    					// 	Show menu names?
    	                //     <button className="simple-button" onClick={() => {
    					// 		var holdSettings = this.state.globalSettings;
    	                //     	holdSettings.showMenuNames = !holdSettings.showMenuNames;
    	                //     	this.setState({
    					// 			globalSettings: holdSettings
    					// 		});
    	                //     	ipcRenderer.send('temporarily-update-app-settings', {
    	                //     		showMenuNames: holdSettings.showMenuNames
    	                //     	});
    	                //     }}>
    				    //     	{(this.state.globalSettings.showMenuNames) ? "On" : "Off"}
    	                //     </button>
    		        	// </li>
            let GeneralSettingsElement = (
                <button className="btn btn-default" onClick={() => {
                    window.document.getElementById("globalSettings").style.display = "block";
                    window.document.getElementById("appSettings").style.display = "none";
                }}>
                    General Settings
                </button>
            );

            let AppSettingsElement = (
                <button className="btn btn-default" onClick={() => {
                    window.document.getElementById("globalSettings").style.display = "none";
                    window.document.getElementById("appSettings").style.display = "block";
                }}>
                    {this.state.appSettings.name} Settings
                </button>
            );

            let AlwaysOnTopElement = (this.state.globalSettings.boundsPerApp) ? (
                <div className="checkbox">
                    <label>
                        <input id="alwaysOnTopCheckbox" type="checkbox" defaultChecked /> Always float window on top of other windows)
                    </label>
                </div>
            ) : (
                <div className="checkbox">
                    <label>
                        <input id="alwaysOnTopCheckbox" type="checkbox"/> Always float window on top of other windows
                    </label>
                </div>
            );

            let BoundsPerAppElement = (this.state.globalSettings.boundsPerApp) ? (
				<div className="checkbox">
					<label>
                        <input id="boundsPerAppCheckbox" type="checkbox" defaultChecked /> Use the same the same size for all apps
                    </label>
				</div>
            ) : (
				<div className="checkbox">
					<label>
                        <input id="boundsPerAppCheckbox" type="checkbox" /> Use the same the same size for all apps
                    </label>
				</div>
            );

    		return (
                <div>
                    <header className="toolbar toolbar-header">
                        <div className="toolbar-actions">
                            <div className="btn-group">
                                {GeneralSettingsElement}
                                {AppSettingsElement}
                            </div>
                        </div>
                    </header>

        			<div id="globalSettings" style={{
                        display: 'none',
                        padding: '15px',
                    }}>
						<form>
                            {AlwaysOnTopElement}
                            {BoundsPerAppElement}
						</form>
                    </div>

                    <div id="appSettings" style={{
                        padding: '15px',
                    }}>
                        Reload the shortcuts for {this.state.appSettings.name}: <button id="reload-button" className="btn btn-primary" onClick={() => {
                            console.log('sending reloadShortcuts from ipcRenderer');
                            ipcRenderer.send('main-parse-shortcuts');
                        }}>Reload</button>

            			<div style={{
            				display: 'flex',
            				flexDirection: 'row',
            				// margin: 0,
            				// border: 0,
            				// padding: 0,
                            // backgroundColor: this.state.appSettings.backgroundColor,
                            // color: this.state.appSettings.textColor,
                            textAlign: 'center',
            			}}>
                			<div style={{
                                flex: 1,
                			}}>
                        		<h3>Background color</h3>
                    			<SketchPicker
                    				color={this.state.appSettings.backgroundColor}
                	    			onChangeComplete={this.handleBackgroundColorChange}
                					presetColors={beautifulColors}
                    			/>
                            </div>
                            <div style={{
                                flex: 1,
                			}}>
                        		<h3>Item color</h3>
                				<SketchPicker
                					color={this.state.appSettings.itemColor}
                					onChangeComplete={this.handleItemColorChange}
                					presetColors={beautifulColors}
                				/>
                            </div>
                			<div style={{
                                flex: 1,
                			}}>
                        		<h3>Item background color</h3>
                				<SketchPicker
                					color={this.state.appSettings.itemBackgroundColor}
                					onChangeComplete={this.handleItemBackgroundColorChange}
                					presetColors={beautifulColors}
                				/>
                            </div>
                			<div style={{
                                flex: 1,
                			}}>
                        		<h3>Text color</h3>
                				<SketchPicker
                					color={this.state.appSettings.textColor}
                					onChangeComplete={this.handleTextColorChange}
                					presetColors={beautifulColors}
                				/>
                            </div>
            			</div>
    	    		</div>

                    <footer className="toolbar toolbar-footer pull-bottom" style={{
                        bottom: 0,
                        position: 'fixed',
                        width: '100%',
                    }}>
                      <div className="toolbar-actions">
                        <button className="btn btn-default" onClick={() => {
    						this.cancelCurrentSettings();
                        }}>
                          Cancel
                        </button>

                        <button className="btn btn-primary pull-right" onClick={() => {
							let alwaysOnTop = this.state.globalSettings.alwaysOnTop;
							let boundsPerApp = this.state.globalSettings.boundsPerApp;
                            let holdSettings = {
                                alwaysOnTop: window.document.getElementById("alwaysOnTopCheckbox").checked,
                                boundsPerApp: window.document.getElementById("boundsPerAppCheckbox").checked,
                            };

                            if (holdSettings.alwaysOnTop != alwaysOnTop ||
                                holdSettings.boundsPerApp != boundsPerApp) {
    	                    	this.setState({
    								globalSettings: holdSettings
    							});

    	                    	ipcRenderer.send('save-app-settings', holdSettings);
        						this.saveCurrentSettings();
                            }

                            let windows = holdRemote.BrowserWindow.getAllWindows();
                            for (let i = 0; i < windows.length; i++) {
                                let holdWindow = windows[i];
                                if (holdWindow && holdWindow.getTitle() == "settingsWindow") holdWindow.hide();
                            }
                        }}>
                          Save
                        </button>
                      </div>
                    </footer>
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
				            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
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
