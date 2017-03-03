'use babel';
import React, { Component } from 'react';
import { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';
var Datastore = require('nedb');
const path = require('path');

let holdRemote = remote;
let cachedStyles = [];
let GLOBAL_SETTINGS = "all programs";
// From http://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
let beautifulColors = ["#ffffff", "#000000", "#2c7bb6",  "#00a6ca", "#00ccbc",
	"#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];
let defaultSettings = {
	name: GLOBAL_SETTINGS,
	backgroundColor: beautifulColors[5],
	itemColor: beautifulColors[2],
	textColor: beautifulColors[1],
	itemBackgroundColor: beautifulColors[4],
};
let styleDb = new Datastore({
	filename: `${__dirname}/../db/styles.db`,
	autoload: true,
});



// The field for "name" is the one we want to keep unique, so anything we write to the db for another running program is
// updated, and not duplicated.
// TODO: this is not always been unique and needs to be improved
styleDb.ensureIndex({
	fieldName: 'name',
	unique: true // Setting unique value constraint on name
}, function (err) {
	if (err) {
		console.log('ERROR: ensureIndex failed to set unique constraint for style db', err);
	}
});

// TODO: send to worker?
styleDb.find({
	name: GLOBAL_SETTINGS
}, function(err, doc) {
	if (err) {
		console.log('Tried to find default style, got error: ', err);
		return;
	}

	if (!doc || (doc == [] || doc.length == 0)) {
		styleDb.insert(defaultSettings, function(err, doc) {
			if (err) {
				console.log('ERROR: inserting default settings into styles db failed with err', err);
			}
		});
	} else {
		cachedStyles[GLOBAL_SETTINGS] = defaultSettings = doc[0];
	}
});


function makeColorString(color) {
	return `rgba(${ color.rgb.r }, ${ color.rgb.g }, ${ color.rgb.b }, ${ color.rgb.a })`;
}


export default class MiniSettingsView extends Component {
    componentWillMount() {
        this.setState(cachedStyles);

		ipcRenderer.on('app-changed', (event, newName) => {
            let newStyles = cachedStyles[newName];
            if (newStyles) {
                this.applyAllStyles(newStyles);
            } else {
                styleDb.find({
                	name: newName
                }, (err, doc) => {
                	if (err) {
                		console.log('Tried to find default style, got error: ', err);
                		return;
                	}

                	if (!doc || (doc == [] || doc.length == 0)) {
                		console.log(`Tried to find styles for name ${newName}, got error ${err}`);
                		return;
                	}

            		cachedStyles[newName] = doc[0];
                    this.applyAllStyles(cachedStyles[newName]);
                });
            }
        });

        this.handleBackgroundColorChange = this.handleBackgroundColorChange.bind(this);
        this.handleItemColorChange = this.handleItemColorChange.bind(this);
        this.handleTextColorChange = this.handleTextColorChange.bind(this);
        this.handleItemBackgroundColorChange = this.handleItemBackgroundColorChange.bind(this);
        this.save = this.save.bind(this);
    }

    applyAllStyles(newStyles) {
		var windows = holdRemote.BrowserWindow.getAllWindows();
		for (var i = 0; i < windows.length; i++) {
			let holdWindow = windows[i];
			if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				// TODO: Perform more updates based on the settings...?
				holdWindow.webContents.send('set-background-color', newStyles["backgroundColor"]);
				holdWindow.webContents.send('set-text-color', newStyles["textColor"]);
				holdWindow.webContents.send('set-item-color', newStyles["itemColor"]);
				holdWindow.webContents.send('set-item-background-color', newStyles["itemBackgroundColor"]);
			}
		}
    }

    save() {
        if (!this.state) {
            console.log("could not save without state");
            return;
        }

        let currentAppName = ipcRenderer.sendSync('get-app-name-sync');

		styleDb.update({
			name: currentAppName
		}, {
			$set: this.state
		}, {
			upsert: true
		}, function(err, doc) {
			if (err) {
				console.log("Error upserting in minisettingsview set", err, this.state);
			} else {
				console.log("Succeeded in saving minisettingsview style to db: ", this.state);
			}
		});
    }

    handleBackgroundColorChange(color) {
    	var colorString = makeColorString(color);
    	this.setState({
			backgroundColor: colorString
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-background-color', colorString);
            }
        }

        this.save();
    }

	handleItemBackgroundColorChange(color) {
    	var colorString = makeColorString(color);
    	this.setState({
			itemBackgroundColor: colorString
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-item-background-color', colorString);
            }
        }

        this.save();
	}

    handleTextColorChange(color) {
    	var colorString = makeColorString(color);
    	this.setState({
			textColor: colorString
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-text-color', colorString);
            }
        }

        this.save();
    }

    handleItemColorChange(color) {
    	var colorString = makeColorString(color);
    	this.setState({
            itemColor: colorString
		});

        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let holdWindow = windows[i];
            if (holdWindow && holdWindow.getTitle() == "mainWindow") {
				holdWindow.webContents.send('set-item-color', colorString);
            }
        }

        this.save();
    }

    render() {
        if (!this.state) {
            return (
                <div style={{
                    backgroundColor: 'white'
                }}>
                    Could not find app settings
                </div>
            );
        }

		return (
			<div style={{
				display: 'flex',
				flexDirection: 'row',
				margin: 0,
				border: 0,
				padding: 0,
                backgroundColor: this.state.backgroundColor,
                color: this.state.textColor,
                textAlign: 'center',
			}}>
    			<div style={{
    				display: 'flex',
    				flexDirection: 'column',
                    flex: 1,
    			}}>
            		<h3>Background color</h3>
        			<SketchPicker
        				color={this.state.backgroundColor}
    	    			onChangeComplete={this.handleBackgroundColorChange}
    					presetColors={beautifulColors}
        			/>
            		<h3>Item color</h3>
    				<SketchPicker
    					color={this.state.itemColor}
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
    					color={this.state.itemBackgroundColor}
    					onChangeComplete={this.handleItemBackgroundColorChange}
    					presetColors={beautifulColors}
    				/>
            		<h3>Text color</h3>
    				<SketchPicker
    					color={this.state.textColor}
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
