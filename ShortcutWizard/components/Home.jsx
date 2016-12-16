'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';

var globalState;

const DragHandle = SortableHandle(() => {
    return (
        <b><strong>[::::]   </strong></b>
    );
});

const SortableItem = SortableElement((componentArguments) => {
    if (!globalState) {
        console.log("couldnt find global state");
        return (
            <div></div>
        );
    }
    // let keys = Object.keys(listItem);
    // let displayValue = "";
    // let hasGlyph = false;
    // let hasChar = false;
    // let favorite = false;
    // let hidden = false;
    //
    // // TODO: Can this be simplified to avoid the double loops over and over?
    // for (var i = 0; i < keys.length; i++) {
    //     let key = keys[i];
    //     if (key != "menuName" && key != "position" && key != "name" &&
    //         key != "isFavorite" && key != "isHidden" && key != "isMouseOver") {
    //         displayValue += `${value[key]} `;
    //     }
    //     if (key == "glyph") {
    //         hasGlyph = true;
    //     }
    //     if (key == "char") {
    //         hasChar = true;
    //     }
    //     if (key == "isFavorite") {
    //         favorite = true;
    //     }
    //     if (key == "isHidden") {
    //         hidden = true;
    //     }
    //
    //     // TODO: Handle isMouseOver here?
    // }
    //
    // // This whole thing is stupid, fix by pulling out all values and organising
    // if (keys.length == 4 && hasChar && !hasGlyph && !favorite && !hidden) {
    //     displayValue = "⌘" + displayValue;
    // } else if (keys.length == 5 && hasChar && !hasGlyph && ((!favorite && hidden) || (favorite && !hidden))) { // either fav or hidden exists to add up to 5
    //     displayValue = "⌘" + displayValue;
    // } else if (keys.length == 6 && hasChar && !hasGlyph && favorite && hidden) { // both fav and hidden exist to make up 6
    //     displayValue = "⌘" + displayValue;
    // }
    // displayValue = value["name"] + ": " + displayValue;


    let listItem = componentArguments.listItem;
    let doc = componentArguments.contentWindow.document;

    let topSection = (
        <h3 style={{
            color: globalState.textColor,
            flex: 4,
            marginRight: '4px',
        }}>{listItem.name}</h3>
    );

    let bottomSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 2
        }}>
            <p style={{
                flex: 2,
                marginRight: '5px',
                marginLeft: '5px',
                color: globalState.textColor,
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid ${globalState.itemColor}`,
                backgroundColor: globalState.itemColor,
            }}>{
                // Always show ⌘ if there are no mods or glyphs
                (listItem["mod"]) ? listItem["mod"] :
                    (listItem["glyph"] && !listItem["char"]) ? "⌘" :
                        (!listItem["glyph"] && listItem["char"]) ? "⌘" : ""
            }</p>

            {(listItem["glyph"]) ? (
                <p style={{
                    flex: 2,
                    marginRight: '5px',
                    marginLeft: '5px',
                    color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid ${globalState.itemColor}`,
                    backgroundColor: globalState.itemColor,
                }}>{listItem["glyph"]}</p>
            ): ""}

            {(listItem["char"]) ? (
                <p style={{
                    flex: 2,
                    marginRight: '5px',
                    marginLeft: '5px',
                    color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid ${globalState.itemColor}`,
                    backgroundColor: globalState.itemColor,
                }}>{listItem["char"]}</p>
            ): ""}

            <p style={{
                flex: 2,
                marginRight: '5px',
                marginLeft: '5px',
                color: globalState.textColor,
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid ${globalState.itemColor}`,
                backgroundColor: globalState.itemColor,
            }}>{listItem.menuName}</p>
        </div>
    );

    var mouseOverButtonsSection = (
        <div id={`buttonSection-${componentArguments.index}`} style={{
            display: 'none'
        }}>
            <button style={{
                color: "green",
                display: 'none',
                flexGrow: 2,
                flexBasis: '50%',
                backgroundColor: "transparent",
            }} onClick={() => {
                console.log("clicked execute-list-item with ", listItem.value.name, listItem.value.menuName);
                ipcRenderer.send('execute-list-item', listItem.value.name, listItem.value.menuName);
            }}>
                <i className="fa fa-2x fa-play"></i>
                <br />
                Do
            </button>

            <div style={{
                flex: 2,
                flexDirection: 'column',
            }}>
                <button style={{
                    color: "gold",
                    width: '100%',
                    backgroundColor: "transparent",
                    // display: (listItem.isFavorite) ? 'block' : 'none',
                    // Specifically make favorite bigger if it is shown alone
                    flex: 2,
                }} onClick={() => {
                    ipcRenderer.send('toggle-favorite-list-item', listItem.value.name);
                }}>
                    {
                        (listItem.isFavorite) ? (
                            <div>
                                <i className="fa fa-2x fa-star"></i>
                                <br />
                                Remove
                            </div>
                        ) : (
                            <div>
                                <i className="fa fa-2x fa-star-o"></i>
                                <br />
                                Add
                            </div>
                        )
                    }
                </button>

                <button style={{
                    color: (listItem.isHidden) ? "grey" : "red",
                    width: '100%',
                    backgroundColor: "transparent",
                    // display: (listItem.isHidden) ? 'block' : 'none',
                    flex: 2,
                }} onClick={() => {
                    ipcRenderer.send('toggle-hide-list-item', listItem.value.name);
                }}>
                    <i className="fa fa-2x fa-remove"></i>
                    <br />
                    { (listItem.isHidden) ? "Show" : "Hide" }
                </button>
            </div>
        </div>
    );

    // todo add these:
    // - text size
    // - general list item size

    // TOD: Use this to fill list item correctly?

    // add back in:
    // margin: 'auto'

    // TODO: Change for a more robust system:
    // The value and index here belongs to the list passed into the component,
    // which makes the link follow all the way back to the sorted array
    console.log("rendered with listItem isMouseOver", listItem.isMouseOver);

    return (
        <div style={{
            // borderRadius: ".25rem",
            // borderWidth: ".50rem",
            // border: `2px solid ${listItem.itemColor}`,
            // backgroundColor: listItem.itemColor,
            width: "100%",
            margin: "4px",
            display: 'flex',
            flexDirection: 'column',
        }} onMouseEnter={(e) => {

            // render: function() {
            //
            //     <a data-tag={i} style={showStyle} onClick={this.removeTag(i)}></a>
            //
            // },
            // removeTag: function (i) {
            //     return function (e) {
            //         // and you get both `i` and the event `e`
            //     }.bind(this) //important to bind function
            // }
            let ourselves = doc.getElementById(`buttonSection-${componentArguments.index}`);
            if (!ourselves) {
                console.log("could not find button section in list of shortcuts");
                return;
            }

            ourselves.style.display = "block";

        }} onMouseLeave={(e) => {
            let ourselves = doc.getElementById(`buttonSection-${componentArguments.index}`);
            if (!ourselves) {
                console.log("could not find button section in list of shortcuts");
                return;
            }

            ourselves.style.display = "none";

            // render: function() {
            //
            //     <a data-tag={i} style={showStyle} onClick={this.removeTag(i)}></a>
            //
            // },
            // removeTag: function (i) {
            //     return function (e) {
            //         // and you get both `i` and the event `e`
            //     }.bind(this) //important to bind function
            // }
            //
        }}>
            {topSection}
            {bottomSection}
            {mouseOverButtonsSection}
        </div>
    );
});



const SortableList = SortableContainer((componentArguments) => {
    // console.log("entered SortableContainer with props: ", this.props);

    var items = componentArguments.items;

    return (!items) ? (
        <p>No items yet</p>
    ) : (
        <div style={{fontWeight:500, fontSize:18, margin:'15px'}}>
            {
                items.map((value, index) => {
                    return (
                        <SortableItem
                            key={`item-${index}`}
                            index={index}
                            listItem={value}
                            contentWindow={componentArguments.contentWindow}
                        />
                    );
                })
            }
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
            // todo:
            // - randomize the items?

            console.log('entered update-shortcuts in Home');
            let name = newShortcuts.name;
            if (name == "Electron" || name == "ShortcutWizard") return;

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

        // updatedList.sort((a, b) => {
        //     if (a.isHidden) {
        //         if (b.isHidden) return 0; // a <> b
        //
        //         return 1; // b > a
        //     }
        //     if (a.isFavorite) {
        //         if (b.isFavorite) return 0; // a <> b
        //
        //         return -1; // a > b
        //     }
        //
        //     return 0; // a <> b
        // });

        this.setState({items: updatedList});
    }

    render() {
        globalState = this.state;
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

        var shortcuts = this.state.items;
        if (!this.previousShortcuts || this.previousShortcuts != shortcuts) {
            shortcuts.sort((a, b) => {
                if (a.isHidden) {
                    if (b.isHidden) return 0; // a <> b

                    return 1; // b > a
                }
                if (a.isFavorite) {
                    if (b.isFavorite) return 0; // a <> b

                    return -1; // a > b
                }

                return 0; // a <> b
            });

            this.previousShortcuts = shortcuts;
        }


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
                            items={shortcuts}
                            onSortEnd={this.onSortEnd}
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
