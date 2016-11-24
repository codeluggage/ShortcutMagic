'use babel';
import React, { Component } from 'react';
import { Tabs, Tab } from 'react-tab-view'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { ipcRenderer } from 'electron';
import settings from '../settings/settings';

function createListItem(value, index) {
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
}

const SortableItem = SortableElement(({value}) => <li>{value}</li>);

const SimpleList = SortableContainer(({items}) => {
    var listLimit = 1;
    var i = 0;

    return !items ? (<p>No items yet</p>) : (
        <div style={{fontWeight:600, fontSize:24, margin:'10px'}}>
            { items.map((value, index) => {
                console.log('looping inside simple list with i and index and value', i, index, value);
                if (i < listLimit) {
                    i++;
                    return createListItem(value, index);
                }
            })}
        </div>
    );
});

const SortableList = SortableContainer(({items}) => {
    return !items ? (<p>No items yet</p>) : (
        <div style={{fontWeight:500, fontSize:18, margin:'15px'}}>
            { items.map((value, index) => {
                return createListItem(value, index);
            })}
        </div>
    );
});

export default class Home extends Component {
    componentWillMount() {
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

        ipcRenderer.on('update-shortcuts', (event, newShortcuts) => {
            console.log('entered update-shortcuts in Home', newShortcuts);
            let name = newShortcuts.name;
            if (name == "Electron") return;

            let shortcuts = newShortcuts.shortcuts;
            const shortcutsArray = Object.keys(shortcuts).map(key => shortcuts[key]);
            console.log('ipcrenderer callback, raw, name, new array: ', newShortcuts, name, shortcutsArray);

            this.setState({
                name: name,
                initialItems: shortcutsArray,
                items: shortcutsArray
            });
        });

        ipcRenderer.on('set-background', (event, background) => {
            console.log('enetered set-background in Home', background);
            this.setState({
                background: background
            });
        });

        ipcRenderer.on('stealth-mode', (event) => {
            this.setState({
                fullMode: false,
                stealthMode: true
            });
        });

        ipcRenderer.on('full-mode', (event) => {
            this.setState({
                fullMode: true,
                stealthMode: false
            });
        });



        // Binding functions because local this doesn't work with this babel for some reason
        this.onSortEnd = this.onSortEnd.bind(this);
        this.filterListTrigger = this.filterListTrigger.bind(this);
        this.filterList = this.filterList.bind(this);
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
        console.log('render() called, ', this.state);
        if (!this.state || !this.state.items) {
            console.log('rendering without state');
            return (
                <div>
                    <Tabs headers={headers}>
                        <Tab>
                            <div><p>This is the first tab</p></div>
                            <div><p>with some content</p></div>
                        </Tab>
                        <Tab>
                            <p>This is the second tabs content</p>
                        </Tab>
                    </Tabs>
                </div>
            );
        }
/*
                <div style={{textAlign: 'center'}}>
                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-refresh"></i></button>

                    <button style={{color:"white"}} id="toggle-window-mode-button" className="simple-button" onClick={() => {
                        ipcRenderer.send('change-window-mode');
                    }}><i className="fa fa-1x fa-compress"></i></button>

                    <button style={{color:"white", float:'right'}} id="settings-button" className="simple-button" onClick={() => {
                        ipcRenderer.send('open-settings', null);
                    }}><i className="fa fa-1x fa-cog"></i></button>
                    <h1 style={{color:"white"}}>ShortcutWizard</h1>
                    <p style={{color:'white'}}>When you focus another application, this area will show you shortcuts</p>
                </div>
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
        if (this.state.stealthMode) {
            console.log('rendering for stealth mode: ', this.state);
            return (
                <div style={{textAlign: 'center', backgroundColor: this.state.background ? this.state.background : '#000000'}}>
                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-rotate-right"></i></button>

                    <button style={{color:"white"}} id="toggle-window-mode-button" className="simple-button" onClick={() => {
                        ipcrenderer.send('change-window-mode');
                    }}><i classname="fa fa-1x fa-compress"></i></button>

                    <button style={{color:"white", float:'right'}} id="settings-button" classname="simple-button" onclick={() => {
                        ipcrenderer.send('open-settings');
                    }}><i className="fa fa-1x fa-cog"></i></button>

                    <h1 style={{color:"white", marginTop:'5px'}}>{this.state.name}</h1>


                    <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
                        <input style={{fontSize: 18}} type="text" placeholder="&#xF002;" onChange={this.filterListTrigger}/>

                        <div style={{textAlign: 'left'}}>
                            <SimpleList
                              items={this.state.items}
                              onSortEnd={this.onSortEnd}
                              lockAxis='y'
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (this.state.fullMode) {
            console.log('trying to render for fullstate', this.state);
            return (
                <div style={{textAlign: 'center', backgroundColor: this.state.background ? this.state.background : '#000000'}}>
                        <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                            console.log('sending reloadShortcuts from ipcRenderer');
                            ipcRenderer.send('main-parse-shortcuts');
                        }}><i className="fa fa-1x fa-rotate-right"></i></button>

                        <button style={{color:"white"}} id="toggle-window-mode-button" className="simple-button" onClick={() => {
                            ipcRenderer.send('change-window-mode');
                        }}><i className="fa fa-1x fa-compress"></i></button>

                        <button style={{color:"white", float:'right'}} id="settings-button" className="simple-button" onClick={() => {
                            ipcRenderer.send('open-settings');
                        }}><i className="fa fa-1x fa-cog"></i></button>
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
}
