'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';

// TODO: Replace this crappy system with proper state passed down through elements somehow
var sharedGlobalState = {}; // Expose component state to list elements

const DragHandle = SortableHandle(() => {
    return (
        <span>::</span>
    );
});


const SortableItem = SortableElement(({value}) => {

    // todo add these:
    // - text size
    // - general list item size

    // TOD: Use this to fill list item correctly?
    // margin: 'auto'

    var listItem = sharedGlobalState[value];

    return (
        <div style={{
            borderRadius: ".25rem",
            borderWidth: ".50rem",
            border: `2px solid ${sharedGlobalState.itemColor}`,
            backgroundColor: sharedGlobalState.itemColor,
            width: "100%",
            margin: "4px",
            display: 'flex',
            flexDirection: 'row',
        }}>
            <p style={{color: sharedGlobalState.textColor, flex: 6}}><DragHandle /> {value}</p>

            <button style={{
                color: "gold",
                backgroundColor: (listItem.isFavorite) ? "gold" : "transparent",
                flex: 2
            }} onClick={() => {
                ipcRenderer.send('toggle-favorite-list-item', listItem.value.name);
            }}>
                <i className="fa fa-1x fa-star-o"></i>
                <br />
                { (listItem.isFavorite) ? "Remove" : "Add" }
            </button>

            <button style={{
                color: (listItem.isHidden) ? "green" : "red",
                backgroundColor: (listItem.isHidden) ? "red" : "transparent",
                flex: 2
            }} onClick={() => {
                ipcRenderer.send('toggle-hide-list-item', listItem.value.name);
            }}>
                <i className="fa fa-1x fa-remove"></i>
                <br />
                { (listItem.isHidden) ? "Show" : "Hide" }
            </button>

            <button style={{
                color:"green",
                flex: 2,
                backgroundColor: "transparent",
            }} onClick={() => {
                console.log("clicked execute-list-item with ", listItem.value.name, listItem.value.menuName);
                ipcRenderer.send('execute-list-item', listItem.value.name, listItem.value.menuName);
            }}><i className="fa fa-1x fa-play"></i></button>


        </div>
    );
            // <div style={{height: '100%', margin: 'auto', backgroundColor: "red", flex:2}}>Hide</div>
            // <div style={{height: '100%', margin: 'auto', backgroundColor: "yellow", flex:2}}>Favorite</div>
            // <div style={{height: '100%', margin: 'auto', backgroundColor: "green", flex:2}}>Execute</div>
});

const SortableList = SortableContainer(({items}) => {
    return !items ? (<p>No items yet</p>) : (
        <div style={{fontWeight:500, fontSize:18, margin:'15px'}}>
            { items.map((value, index) => {
                let keys = Object.keys(value);
                let displayValue = "";
                let hasGlyph = false;
                let hasChar = false;
                let favorite = false;
                let hidden = false;

                for (var i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if (key != "menuName" && key != "position" && key != "name" && key != "isFavorite" && key != "isHidden") {
                        displayValue += `${value[key]} `;
                    }
                    if (key == "glyph") {
                        hasGlyph = true;
                    }
                    if (key == "char") {
                        hasChar = true;
                    }
                    if (key == "isFavorite") {
                        favorite = true;
                    }
                    if (key == "isHidden") {
                        hidden = true;
                    }
                }

                // This whole thing is stupid, fix by pulling out all values and organising
                if (keys.length == 4 && hasChar && !hasGlyph && !favorite && !hidden) {
                    displayValue = "⌘" + displayValue;
                } else if (keys.length == 5 && hasChar && !hasGlyph && ((!favorite && hidden) || (favorite && !hidden))) { // either fav or hidden exists to add up to 5
                    displayValue = "⌘" + displayValue;
                } else if (keys.length == 6 && hasChar && !hasGlyph && favorite && hidden) { // both fav and hidden exist to make up 6
                    displayValue = "⌘" + displayValue;
                }


                displayValue = value["name"] + ": " + displayValue;
                sharedGlobalState[displayValue] = {
                    value: value,
                    index: index,
                    isFavorite: (favorite) ? value["isFavorite"] : false,
                    isHidden: (hidden) ? value["isHidden"] : false
                };

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
        // ipcRenderer.on('temporarily-update-app-setting', (event, newSetting) => {
        //     if (Object.keys(newSetting)[0] == "backgroundColor") {
        //         window.document.documentElement.style.backgroundColor = newSetting["backgroundColor"];
        //     }
        //
        //     this.setState(newSetting);
        // });

        ipcRenderer.on('start-shortcut-window', (event) => {
            var windows = holdRemote.BrowserWindow.getAllWindows();
            for (var i = 0; i < windows.length; i++) {
                let mainWindow = windows[i];
                if (mainWindow && mainWindow.getTitle() == "mainWindow") {
                    mainWindow.show();
                }
            }
        });


        ipcRenderer.on('set-background-color', (event, backgroundColor) => {
            console.log('inside Home.jsx set-background-color with ', backgroundColor);
            this.setState({
                backgroundColor: backgroundColor
            });
        });

        ipcRenderer.on('set-item-color', (event, itemColor) => {
            console.log('inside Home.jsx set-item-color with ', itemColor);
            this.setState({
                itemColor: itemColor
            });
        });

        ipcRenderer.on('set-text-color', (event, textColor) => {
            console.log('inside Home.jsx set-text-color with ', textColor);
            this.setState({
                textColor: textColor
            });
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
        // TODO: refer directly to the browser window by id instead of grabbing all windows
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let settingsWindow = windows[i];
            if (settingsWindow && settingsWindow.getTitle() == "settingsWindow") {
                settingsWindow.show();
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
        sharedGlobalState = this.state;

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
    	window.document.documentElement.style.backgroundColor = this.state.backgroundColor;

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
                          itemColor={this.state.itemColor}
                          textColor={this.state.textColor}
                          useDragHandle={true}
                          lockAxis='y'
                        />
                    </div>
                </div>
            </div>
        );
                        // previous sortablelist itemstyle
                        //   itemStyle={{backgroundColor: (this.state.itemColor) ? this.state.itemColor : '#FFFFFF'}}
    }
}
