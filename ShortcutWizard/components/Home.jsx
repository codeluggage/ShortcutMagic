'use babel';
import React, { Component } from 'react';
import { Link } from 'react-router';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { ipcRenderer } from 'electron';


const SortableItem = SortableElement(({value}) => <li>{value}</li>);

const SortableList = SortableContainer(({items}) => {
    return !items ? (<p>No items yet</p>) : (
        <div style={{color:"white", fontWeight:500}}>
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
                        console.log("l: glyph", keys.length, value[key]);
                        hasGlyph = true;
                    }
                    if (key == "char") {
                        console.log("l: char", keys.length, value[key]);
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
                      container={value["menuName"]}
                    />
                );
            })}
        </div>
    );
});

export default class Home extends Component {
    // getInitialState() {
    //     console.log('home getInitialState called');
    //     return {
    //         initialItems: [{
    //             name: "Redo",
    //             menuName: "Edit" ,
    //             cmd: "Z",
    //             mods: 1
    //         }, {
    //             name: "Cut",
    //             menuName: "Edit" ,
    //             cmd: "X"
    //         }]
    //     };
    // }

    componentWillMount() {
        console.log('home constructor called');
        this.setState({
            name: "ShortcutWizard",
            initialItems: [{
                name: "Redo",
                menuName: "Edit" ,
                cmd: "Z",
                mods: 1
            }],
            items: [{
                name: "Cut",
                menuName: "Edit" ,
                cmd: "X"
            }]
        });

        ipcRenderer.on('update-shortcuts', (event, newShortcuts) => {
            console.log('entered update-shortcuts in Home', newShortcuts);
            let name = newShortcuts.name;
            let shortcuts = newShortcuts.shortcuts;
            const shortcutsArray = Object.keys(shortcuts).map(key => shortcuts[key]);
            console.log('ipcrenderer callback, raw, name, new array: ', newShortcuts, name, shortcutsArray);

            this.setState({
                name: name,
                initialItems: shortcutsArray,
                items: shortcutsArray
            });
        });

        // Binding functions because local this doesn't work with this babel for some reason
        this.onSortEnd = this.onSortEnd.bind(this);
        this.filterListTrigger = this.filterListTrigger.bind(this);
        this.filterList = this.filterList.bind(this);
    }

    onSortEnd({oldIndex, newIndex}) {
        console.log('onsortend - this', this);
        this.setState({
            initialItems: arrayMove(this.state.items, oldIndex, newIndex)
        });
    }

    filterListTrigger(event) {
        console.log('fileterlisttrigger - this', this);
        this.filterList(event.target.value);
    }

    filterList(targetValue) {
        console.log('filterlist - this', this);
        var updatedList = this.state.initialItems;

        if (targetValue) {
            updatedList = updatedList.filter(function(item){
                console.log('looping in updatedList, ', item);
                const innerValues = Object.keys(item).map(key => item[key]);
                
                for (var i = 0; i < innerValues.length; i++) {
                    let innerVal = innerValues[i];

                    if (typeof innerVal === 'string' && innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;
                    if (innerVal == targetValue) return true;
                }

                // let innerKeys = Object.keys(item);
                // for (var i = 0; i < innerKeys.length; i++) {
                //     let innerVal = "" + innerKeys[i];
                //     if (innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;
                // }
            });
        }

        this.setState({items: updatedList});
    }

    render() {
        console.log('render() called');
        console.log('with name', this.state.name);

        return (
            <div>
                <h1 style={{color:"white"}}>{this.state.name}</h1>
                <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
                    <button style={{color:"white"}} id="settings-button" className="simple-button" onClick={() => {
                        ipcRenderer.send('openSettingsPage', null);
                    }}>Open settings</button>

                    <button style={{color:"white"}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}>Reload shortcuts</button>

                    <input type="text" placeholder="Search" onChange={this.filterListTrigger}/>
                    <SortableList
                      items={this.state.items}
                      onSortEnd={this.onSortEnd}
                      lockAxis='y'
                    />
                </div>
            </div>
        );
    }
}
