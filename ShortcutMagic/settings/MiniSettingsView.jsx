'use babel';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';

const path = require('path');
let db = new require('nedb')({
	filename: `${__dirname}/db/styling.db`,
	autoload: true,
});

// The field for "name" is the one we want to keep unique, so anything we write to the db for another running program is
// updated, and not duplicated.
// TODO: this is not always been unique and needs to be improved
db.ensureIndex({
	fieldName: 'name',
	unique: true // Setting unique value constraint on name
}, function (err) {
	if (err) {
		console.log('ERROR: db.ensureIndex failed to set unique constraint for style db', err);
	}
});

let beautifulColors = ["#ffffff", "#000000", "#2c7bb6",  "#00a6ca", "#00ccbc",
	"#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];

let holdRemote = remote;

let inMemoryShortcuts = [];

export default class MiniSettingsView extends Component {
    componentWillMount() {
        this.handleBackgroundColorChange = this.handleBackgroundColorChange.bind(this);
        this.handleItemColorChange = this.handleItemColorChange.bind(this);
        this.handleTextColorChange = this.handleTextColorChange.bind(this);
        this.handleItemBackgroundColorChange = this.handleItemBackgroundColorChange.bind(this);
        this.reloadSettings = this.reloadSettings.bind(this);
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


	handleItemBackgroundColorChange(color) {
        // TODO: Save to db

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-item-background-color', color);
            }
        }
	}

    handleBackgroundColorChange(color) {
        // TODO: Save to db

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-background-color', color);
            }
        }
    }

    handleTextColorChange(color) {
        // TODO: Save to db

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-text-color', color);
            }
        }
    }

    handleItemColorChange(color) {
        // TODO: Save to db

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-item-color', color);
            }
        }
    }

    render() {
        if (!this.state || !this.state.appSettings) {
            return (
                <div style={{
                    backgroundColor: 'white'
                }}>
                    Could not find app settings
                </div>
            );
        }

        console.log("about to render minisettings: ", this.state.appSettings);

		return (
			<div style={{
				display: 'flex',
				flexDirection: 'row',
				margin: 0,
				border: 0,
				padding: 0,
                backgroundColor: this.state.appSettings.backgroundColor,
                color: this.state.appSettings.textColor,
                textAlign: 'center',
			}}>
    			<div style={{
    				display: 'flex',
    				flexDirection: 'column',
                    flex: 1,
    			}}>
            		<h3>Background color</h3>
        			<SketchPicker
        				color={this.state.appSettings.backgroundColor}
    	    			onChangeComplete={this.handleBackgroundColorChange}
    					presetColors={beautifulColors}
        			/>
            		<h3>Item color</h3>
    				<SketchPicker
    					color={this.state.appSettings.itemColor}
    					onChangeComplete={this.handleItemColorChange}
    					presetColors={beautifulColors}
    				/>
                </div>

    			<div style={{
    				display: 'flex',
    				flexDirection: 'column',
                    flex: 1,
    			}}>
            		<h3>Item background color</h3>
    				<SketchPicker
    					color={this.state.appSettings.itemColor}
    					onChangeComplete={this.handleItemBackgroundColorChange}
    					presetColors={beautifulColors}
    				/>
            		<h3>Text color</h3>
    				<SketchPicker
    					color={this.state.appSettings.textColor}
    					onChangeComplete={this.handleTextColorChange}
    					presetColors={beautifulColors}
    				/>
                </div>
			</div>
		);
	}
}

window.onload = function(){
	ReactDOM.render(<MiniSettingsView />, document.getElementById("mini-settings-root"));
};
