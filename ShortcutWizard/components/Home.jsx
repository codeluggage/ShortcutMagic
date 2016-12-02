'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';

const SortableItem = SortableElement(({value}) => <li>{value}</li>);

const SortableList = SortableContainer(({items}) => {
    return !items ? (<p>No items yet</p>) : (
        <div style={{fontWeight:500, fontSize:18, margin:'15px'}}>
            { items.map((value, index) => {
                let keys = Object.keys(value);
                let displayValue = "";
                let hasGlyph = false;
                let hasChar = false;

                for (var i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if (key != "menuName" && key != "position" && key != "name") {
                        displayValue += `${value[key]} `;
                    }
                    if (key == "glyph") {
                        hasGlyph = true;
                    }
                    if (key == "char") {
                        hasChar = true;
                    }
                }

                if (keys.length == 4 && hasChar && !hasGlyph) {
                    displayValue = "⌘" + displayValue;
                }

                displayValue = value["name"] + ": " + displayValue;

                return (
                    <SortableItem
                      key={`item-${index}`}
                      index={index}
                      value={displayValue}
                    />
                );
            })}
        </div>
    );
});

var holdRemote = remote;

export default class Home extends Component {
    componentWillMount() {
        ipcRenderer.on('temporarily-update-app-setting', (event, newSetting) => {
            if (Object.keys(newSetting)[0] == "backgroundColor") {
                window.document.documentElement.style.backgroundColor = newSetting["backgroundColor"];
            }

            this.setState(newSetting);
        });

        ipcRenderer.on('update-shortcuts', (event, newShortcuts) => {
            console.log('entered update-shortcuts in Home');
            let name = newShortcuts.name;
            if (name == "Electron") return;

            let shortcuts = newShortcuts.shortcuts;
            const shortcutsArray = Object.keys(shortcuts).map(key => shortcuts[key]);
            console.log('ipcRenderer callback, raw, name, new array: ', newShortcuts, name, shortcutsArray);

            this.setState({
                name: name,
                initialItems: shortcutsArray,
                items: shortcutsArray
            });
        });

        ipcRenderer.on('update-window-ids', (event, windowIds) => {
            console.log("inside Home update-window-ids with ids ", windowIds);
            this.windowIds = windowIds;
        });

        console.log('home constructor called');
        // this.setState({
        //     name: "ShortcutWizard",
        //     initialItems: [{
        //         name: "",
        //         menuName: "" ,
        //         cmd: "",
        //     }],
        //     items: [{
        //         name: "",
        //         menuName: "" ,
        //         cmd: "",
        //     }]
        // });

        // Binding functions because local this doesn't work with this babel for some reason
        this.onSortEnd = this.onSortEnd.bind(this);
        this.filterListTrigger = this.filterListTrigger.bind(this);
        this.filterList = this.filterList.bind(this);
        this.toggleSettings = this.toggleSettings.bind(this);
    }

    toggleSettings() {
        if (!this.windowIds) {
            console.log("cant toggle settings without settings window id");
            return;
        }

        // TODO: refer directly to the browser window by id instead of grabbing all windows
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let settingsWindow = windows[i];
            if (settingsWindow && settingsWindow.id == this.windowIds["settingsWindow"]) {
                if (settingsWindow.isVisible()) {
                    settingsWindow.hide();
                } else {
                    settingsWindow.show();
                }
            }
        }
    }

    onSortEnd({oldIndex, newIndex}) {
        console.log('onsortend, updating order of shortcuts');
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex)
        });

        ipcRenderer.send('update-shortcut-order', this.state.name, this.state.items);
    }

    filterListTrigger(event) {
        console.log('fileterlisttrigger - this', this);
        this.filterList(event.target.value);
    }

    filterList(targetValue) {
        var updatedList = this.state.initialItems;

        if (targetValue) {
            updatedList = updatedList.filter(function(item){
                const innerValues = Object.keys(item).map(key => item[key]);

                for (var i = 0; i < innerValues.length; i++) {
                    let innerVal = innerValues[i];

                    if (typeof innerVal === 'string' && innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;
                    if (innerVal == targetValue) return true;
                }
            });
        }

        this.setState({items: updatedList});
    }

    render() {
        console.log('render() called');
        if (!this.state) {
            return (
                <div style={{textAlign: 'center'}}>
                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-rotate-right"></i></button>

                    <button style={{color:"white", float:'right'}} id="settings-button" className="simple-button" onClick={() => {
                        console.log("clicked settings");
                        this.toggleSettings();
                    }}>
                        <i className="fa fa-1x fa-cog"></i>
                    </button>

                    <h1 style={{color:"white"}}>ShortcutWizard</h1>
                    <p style={{color:'white'}}>When you focus another application, this area will show you shortcuts</p>
                </div>
            );
        }
/*
                sort-up
                sort-down
                star-o
                star
                chevron-up
                chevron-down
                check-square
                check-square-o
                square
                question-circle

*/
        return (
            <div style={{ textAlign: 'center' }}>
                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-rotate-right"></i></button>

                    <button style={{color:"white", float:'right'}} id="settings-button" className="simple-button" onClick={() => {
                        console.log("clicked settings");
                        this.toggleSettings();
                    }}>
                        <i className="fa fa-1x fa-cog"></i>
                    </button>
                <h1 style={{color:"white", marginTop:'5px'}}>{this.state.name}</h1>


                <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
                    <input style={{fontSize: 18}} type="text" placeholder="&#xF002;" onChange={this.filterListTrigger}/>

                    <div style={{textAlign: 'left'}}>
                        <SortableList
                          items={this.state.items}
                          onSortEnd={this.onSortEnd}
                          lockAxis='y'
                        />
                    </div>
                </div>
            </div>
        );
    }
}
