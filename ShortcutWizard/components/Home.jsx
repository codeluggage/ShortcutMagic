'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { ipcRenderer } from 'electron';

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

export default class Home extends Component {
    componentWillMount() {

        ipcRenderer.on('update-shortcuts', (event, newShortcuts) => {
            console.log('entered update-shortcuts in Home');
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
                        // 1 - get all window ids
                        // 2 - get remote browserwindow static, call getWindow with id
                        // 3 - send open/show to the webContents of the window
                        ipcRenderer.send('openSettingsPage', null);
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
                    <button style={{color:"white", float:'right'}} id="settings-button" className="simple-button" onClick={this.toggleSettings}>
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
            <div style={{textAlign: 'center'}}>
                    <button style={{color:"white", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-rotate-right"></i></button>

                    <button style={{color:"white", float:'right'}} id="settings-button" className="simple-button" onClick={() => {
                        ipcRenderer.send('openSettingsPage', null);
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
