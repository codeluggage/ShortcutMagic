// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { ipcRenderer } from 'electron';


const SortableItem = SortableElement(({value}) => <li>{value}</li>);

const SortableList = SortableContainer(({items}) => {
    return (
        <p>
            {items.map((value, index) => {
                let keys = Object.keys(value);
                let displayValue = "";

                for (var i = 0; i < keys.length; i++) {
                    displayValue += `${keys[i]}: ${value[keys[i]]} `;
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

        ipcRenderer.on('shortcutsReloaded', (event, args) => {
          console.log('callback triggered for shortcutsReloaded');
          this.initialItems = args;
          this.setState({items: this.state.initialItems})
      });
    }

    onSortEnd({oldIndex, newIndex}) {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex)
        });
    }

    filterListTrigger(event) {
        this.filterList(event.target.value);
    }

    filterList(targetValue) {
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

    // componentWillMount() {
    //     this.setState({items: 
    //         initialItems: [{
    //             name: "Redo",
    //             menuName: "Edit" ,
    //             cmd: "Z",
    //             mods: 1
    //         }],
    //         items: [{
    //             name: "Cut",
    //             menuName: "Edit" ,
    //             cmd: "X"
    //         }]
    //     });

    //     ipcRenderer.on('shortcutsReloaded', (event, args) => {
    //       console.log('callback triggered for shortcutsReloaded');
    //       this.initialItems = args;
    //       this.setState({items: this.state.initialItems})
    //   });
    // }

    render() {
        ipcRenderer.on('main-parse-shortcuts-callback', (shortcuts) => {
            this.setState({
                items: shortcuts
            })
        });

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
