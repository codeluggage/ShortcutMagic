'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
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
settings.create();
console.log('after creating, settings now has window: ', settings);
// TODO: Handle main window initialisation better by using sync messages?
ipcRenderer.send('main-window-settings', settings.get("mainWindow"));


function makeColorString(color) {
	return `rgba(${ color.rgb.r }, ${ color.rgb.g }, ${ color.rgb.b }, ${ color.rgb.a })`;
}

export default class SettingsView extends Component {
    componentWillMount() {
		console.log("inside SettingsView componentWillMount");
        this.handleChangeComplete = this.handleChangeComplete.bind(this);

    	var applySettingsToState = (event, newSettings) => {
	        this.setState(newSettings);
    	};
    }

	// toggleSettings() {
		// pseudocode: move window to left or right side depending on main window position
		// if (mainWindow.bounds().x < app.getScreenSize() / 2) {
		// 	// window is towards the left, put settings to the right:
		// 	settingsWindow.setBounds(mainWindowBounds.x - mainWindowBounds.width,
		// 		mainWindowBounds.y, 400, mainWindowBounds.height);
		// } else {
		// 	// window is towards the right, put settings to the left:
		// 	settingsWindow.setBounds(mainWindowBounds.x,
		// 		mainWindowBounds.y, 400, mainWindowBounds.height);
		// }
	// }

    handleChangeComplete(color) {
    	console.log('hit handleChangeComplete with color ', color);
    	var colorString = makeColorString(color);
    	this.setState({ background: colorString });
    	window.document.documentElement.style.color = colorString;
    	ipcRenderer.send('temporarily-update-app-setting', {
    		background: colorString
    	});
    }

    render() {
    	if (this.state) {
    		console.log('about to render settings with state: ', this.state);
			// TODO: move these into a tab view, one for the current app and one for global
    		return (
    			<div style={{backgroundColor: this.state.background}}>
                    <button style={{color:"white", float:'left'}} className="simple-button" onClick={() => {
                    	console.log('NOT IMPLEMENTED show settings for all apps');
                    }}>Settings for all apps</button>

                    <button style={{color:"white", float:'right'}} className="simple-button" onClick={() => {
                    	console.log('NOT IMPLEMENTED show settings for current app');
                    }}>Settings for {this.state.name}</button>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var alwaysOnTop = !this.state.alwaysOnTop;
	                    	this.setState({
								alwaysOnTop: alwaysOnTop
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		alwaysOnTop: alwaysOnTop
	                    	});
	                    }}>
		                    Float on top: {(this.state.alwaysOnTop) ? "true" : "false"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var hidePerApp = !this.state.hidePerApp;
	                    	this.setState({
								hidePerApp: hidePerApp
							});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		hidePerApp: hidePerApp
	                    	});
	                    }}>
				        	Hide individually per app: {(this.state.hidePerApp) ? "On" : "Off"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var boundsPerApp = !this.state.boundsPerApp;
	                    	this.setState({boundsPerApp: boundsPerApp});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		boundsPerApp: boundsPerApp
	                    	});
	                    }}>
				        	Size and position individually per app: {(this.state.boundsPerApp) ? "On" : "Off"}
	                    </button>
		        	</li>

		        	<li>
		        		Choose color:
		    			<SketchPicker
		    				color={this.state.background}
			    			onChangeComplete={this.handleChangeComplete}
		    			/>
		    		</li>

                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-refresh"></i></button>


                    <button style={{color:"white", float:'left'}} className="simple-button" onClick={() => {
                    	console.log('sending state as settings to "save-settings"', this.state);
                        ipcRenderer.send('save-settings', this.state);
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
	    	return (<h1>Settings loading...</h1>);
	    }
    }
}

window.onload = function(){
	ReactDOM.render(<SettingsView />, document.getElementById("settings-root"));
};
