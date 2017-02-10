'use babel';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';

var beautifulColors = ["#ffffff", "#000000", "#2c7bb6",  "#00a6ca", "#00ccbc",
	"#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];

var holdRemote = remote;

export default class MiniSettingsView extends Component {
    componentWillMount() {
        ipcRenderer.on('send-app-settings', (event, newSettings) => {
            console.log("HIT send-app-settings!! with new settings: ", newSettings);
            this.setState({
                appSettings: newSettings
            });
        });

        this.handleBackgroundColorChange = this.handleBackgroundColorChange.bind(this);
        this.handleItemColorChange = this.handleItemColorChange.bind(this);
        this.handleTextColorChange = this.handleTextColorChange.bind(this);
        this.handleItemBackgroundColorChange = this.handleItemBackgroundColorChange.bind(this);
    }

	handleItemBackgroundColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-item-background-color', color);
				holdWindow.webContents.send('save');
            }
        }
	}

    handleBackgroundColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-background-color', color);
				holdWindow.webContents.send('save');
            }
        }
    }

    handleTextColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-text-color', color);
				holdWindow.webContents.send('save');
            }
        }
    }

    handleItemColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-item-color', color);
				holdWindow.webContents.send('save');
            }
        }
    }

    render() {
        // TODO: How to run this each time the window gets shown?

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
                console.log("sending from miniSettingsWindow to settingsWindow");
                holdWindow.webContents.send('get-app-settings');
            }
        }

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
