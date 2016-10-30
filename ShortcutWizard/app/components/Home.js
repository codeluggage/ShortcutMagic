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
    state = {
        initialItems: [{
                name: "About PomoDoneApp",
                menuName: "PomoDoneApp",
            }, {
                name: "Check for Updates…",
                menuName: "PomoDoneApp",
            }, {
                name: "Preferences…",
                menuName: "PomoDoneApp",
                cmd: ","  
            }, {
                name: "Services",
                menuName: "PomoDoneApp",
            }, {
                name: "Hide PomoDoneApp",
                menuName: "PomoDoneApp",
                cmd: "H"  
            }, {
                name: "Hide Others",
                menuName: "PomoDoneApp",
                cmd: "H",
                mods: 2  
            }, {
                name: "Show All",
                menuName: "PomoDoneApp",
            }, {
                name: "Quit",
                menuName: "PomoDoneApp",
                cmd: "Q"   
            }, {
                name: "Create new task",
                menuName: "File",
                cmd: "N"  
            }, {
                name: "Sync all",
                menuName: "File",
                cmd: "S",
            }, {
               name: "Sync active service",
               menuName: "File",
               cmd: "R"   
            }, {
                name: "Undo",
                menuName: "Edit",
                cmd: "Z"
            }, {
                name: "Redo",
                menuName: "Edit" ,
                cmd: "Z",
                mods: 1  
            }, {
                name: "Cut",
                menuName: "Edit" ,
                cmd: "X", 
            }, {
                name:  "Copy",
                menuName: "Edit" ,
                cmd: "C", 
            }, {
                name:  "Paste",
                menuName: "Edit",
                cmd: "V",
            }, {
                name:  "Select All",
                menuName: "Edit",
                cmd: "A",
            }, {
                name:  "Start Dictation…",
                menuName: "Edit",
                mods: 8, 
            }, {
                name:  "Emoji & Symbols",
                menuName: "Edit",
                mods: 4, 
                glyph: "9", 
            }, {
                name:  "Minimize",
                menuName: "Window",
                cmd:  "M", 
            }, {
                name:  "Minimize All",
                menuName: "Window",
                cmd:  "M", 
                mods:  2, 
            }, {
                name:  "Bring All to Front",
                menuName: "Window",
            }, {
                name:  "Arrange in Front",
                menuName: "Window",
                mods:  10, 
            }, {
                name:  "PomoDoneApp",
                menuName: "Window",
            }, {
            name:  "FAQ",
            menuName: "Help"
        }],
        items: []
    }

      onSortEnd = ({oldIndex, newIndex}) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex)
        });
      }

    filterListTrigger = (event) => {
        this.filterList(event.target.value);
    }

    filterList = (targetValue) => {
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

    componentWillMount = () => {
        this.setState({items: this.state.initialItems})

        ipcRenderer.on('shortcutsReloaded', (event, args) => {
          console.log('callback triggered for shortcutsReloaded');
          this.initialItems = args;
          this.setState({items: this.state.initialItems})
      });
    }

    render = () => {
        return (
            <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
                <button id="settings-button" className="simple-button" onClick={() => {
                    ipcRenderer.send('openSettingsPage', null);
                }}>Open settings</button>

                <button id="reload-button" className="simple-button" onClick={() => {
                    ipcRenderer.send('reloadShortcuts', null);
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

