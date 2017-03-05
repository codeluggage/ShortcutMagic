'use babel';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';

import { Settings } from './settings';
let settings = new Settings();
let holdRemote = remote;

export default class SettingsView extends Component {
    componentWillMount() {
		settings.create(this);

		ipcRenderer.on('save', (event) => {
			this.saveCurrentSettings();
		});
		ipcRenderer.on('get-app-settings', (event) => {
            let windows = holdRemote.BrowserWindow.getAllWindows();
            for (let i = 0; i < windows.length; i++) {
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
					if (holdWindow.getTitle() == "settingsWindow") {
						holdWindow.hide();
                        break;
					}
	            }
	        }
		});
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

            let AlwaysOnTopElement = (this.state.globalSettings.alwaysOnTop) ? (
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

                        Open styling for {this.state.appSettings.name}: <button className="btn btn-primary" onClick={() => {
                            ipcRenderer.send('show-mini-settings');
                        }}>Reload</button>
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
                <div style={{
                    backgroundColor: 'white',
                    color: 'black',
                }}>
                    Something is not right here... Sorry! If you click in this window, you can try reloading (command + R) or quit (command + Q) and start ShortcutMagic again.
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
