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

        ipcRenderer.send('rendering-ready');

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
            });
        }

        this.setState({items: updatedList});
    }

    render() {
        console.log('render() called');
        if (!this.state) {
            return ( <h1 style={{color:"white"}}>Loading...</h1> );
        }

        return (
            <div style={{textAlign: 'center'}}>
                <h1 style={{color:"white"}}>{this.state.name}</h1>
                <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
                    <button style={{color:"white"}} id="settings-button" className="simple-button" onClick={() => {
                        ipcRenderer.send('openSettingsPage', null);
                    }}>Settings</button>

                    <button style={{color:"white"}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}>Reload</button>

                    <input type="text" placeholder="Search" onChange={this.filterListTrigger}/>
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
