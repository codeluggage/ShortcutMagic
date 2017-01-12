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
        this.handleBackgroundColorChange = this.handleBackgroundColorChange.bind(this);
        this.handleItemColorChange = this.handleItemColorChange.bind(this);
        this.handleTextColorChange = this.handleTextColorChange.bind(this);
    }

    handleBackgroundColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-background-color', color);
            }
        }
    }

    handleTextColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-text-color', color);
            }
        }
    }

    handleItemColorChange(color) {
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				holdWindow.webContents.send('set-item-color', color);
            }
        }
    }

    render() {
        var appSettings = undefined;
        var windows = holdRemote.BrowserWindow.getAllWindows();

        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "settingsWindow") {
				appSettings = holdWindow.webContents.send('get-app-settings');
            }
        }

        console.log("about to render minisettings: ", appSettings);

        if (!appSettings) {
            return (
                <div>
                    Could not find app settings
                </div>
            );
        }

		return (
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				margin: 0,
                color: 'white',
			}}>
	        		<p>Background color</p>
	    			<SketchPicker
	    				color={appSettings.backgroundColor}
		    			onChangeComplete={this.handleBackgroundColorChange}
						presetColors={beautifulColors}
	    			/>
                    <br />

	        		<p>Item color</p>
					<SketchPicker
						color={appSettings.itemColor}
						onChangeComplete={this.handleItemColorChange}
						presetColors={beautifulColors}
					/>
                    <br />

	        		<p>Text color</p>
					<SketchPicker
						color={appSettings.textColor}
						onChangeComplete={this.handleTextColorChange}
						presetColors={beautifulColors}
					/>
			</div>
		);
	}
}

window.onload = function(){
	ReactDOM.render(<MiniSettingsView />, document.getElementById("mini-settings-root"));
};
