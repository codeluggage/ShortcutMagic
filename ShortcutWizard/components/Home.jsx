// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { ipcRenderer } from 'electron';


const SortableItem = SortableElement(({value}) => <li>{value}</li>);

const SortableList = SortableContainer(({items}) => {
    return !items ? (<p>No items yet</p>) : (
        <p>
            { items.map((value, index) => {
                let keys = Object.keys(value);
                let displayValue = "";
                for (var i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    displayValue += `${key}: ${JSON.stringify(value[key])} `;
                }

                return (<SortableItem
                  key={`item-${index}`}
                  index={index}
                  value={displayValue}
                />);
            })}
        </p>
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

        ipcRenderer.on('update-shortcuts', (event, shortcuts) => {
            let result = shortcuts.result;
            const shortcutsArray = Object.keys(result).map(key => result[key]);
            console.log('ipcrenderer callback, new array: ', shortcutsArray);

            this.setState({
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
                let innerValues = Object.values(item);
                
                for (var i = 0; i < innerValues.length; i++) {
                    let innerVal = innerValues[i];

                    if (typeof innerVal === 'string' && innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;
                    if (innerVal == targetValue) return true;
                }

                let innerKeys = Object.keys(item);
                for (var i = 0; i < innerKeys.length; i++) {
                    let innerVal = "" + innerKeys[i];
                    if (innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;
                }
            });
        }

        this.setState({items: updatedList});
    }

    render() {
        console.log('>>>>>>>>>> RENDER');
        return (
            <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
                <button id="settings-button" className="simple-button" onClick={() => {
                    ipcRenderer.send('openSettingsPage', null);
                }}>Open settings</button>

                <button id="reload-button" className="simple-button" onClick={() => {
                    console.log('sending reloadShortcuts from ipcRenderer');
                    var reloadShortcutsForName = null; // TODO: replace with "currentName" 
                    ipcRenderer.send('main-parse-shortcuts', (reloadShortcutsForName) ? reloadShortcutsForName : "PomoDoneApp");
                }}>Reload shortcuts</button>

                <input type="text" placeholder="Search" onChange={this.filterListTrigger}/>
                <SortableList
                  items={this.state.items}
                  onSortEnd={this.onSortEnd}
                  lockAxis='y'
                />
            </div>
        );
    }
}
