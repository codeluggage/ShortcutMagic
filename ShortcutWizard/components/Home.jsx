'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';

var globalState;
// From http://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
var beautifulColors = ["#ffffff", "#000000", "#2c7bb6",  "#00a6ca", "#00ccbc",
	"#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];

function hexToRgba(hex, alpha) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return;
	return `rgba(${ parseInt(result[1], 16) }, ${ parseInt(result[2], 16) }, ${ parseInt(result[3], 16) }, ${ alpha })`;
}

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

    let listItem = componentArguments.listItem;
    let doc = componentArguments.contentWindow.document;

    let topSection = (
        <p style={{
            color: globalState.textColor,
            flex: 4,
            marginRight: '4px',
			fontSize: globalState.listTitleFontSize,
			fontWeight: globalState.listTitleFontWeight,
        }}>{listItem.name}</p>
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
				marginTop: 0,
				marginBottom: 0,
                color: globalState.textColor,
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid ${globalState.itemColor}`,
                backgroundColor: globalState.itemColor,
				fontWeight: globalState.listItemFontWeight,
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
					marginTop: 0,
					marginBottom: 0,
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
					marginTop: 0,
					marginBottom: 0,
                    color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid ${globalState.itemColor}`,
                    backgroundColor: globalState.itemColor,
                }}>{listItem["char"]}</p>
            ): ""}

            { (globalState.showMenuNames) ? (
                <p style={{
                    flex: 2,
                    marginRight: '5px',
                    marginLeft: '5px',
                    color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid ${globalState.itemColor}`,
                    // backgroundColor: globalState.itemColor,
                }}>{listItem.menuName}</p>
            ) : ""}
        </div>
    );

    var mouseOverButtonsSection = (
        <div id={`buttonSection-${componentArguments.index}`} style={{
            display: 'none',
            flexDirection: 'row',
            flex: 2,
            flexWrap: 'nowrap',
            alignContent: 'stretch',
        }}>
            <div style={{
				color: globalState.textColor,
				flex: 1,
                height: '100%',
                backgroundColor: globalState.itemColor,
                marginRight: '1px',
                marginLeft: '1px',
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid ${globalState.itemColor}`,
				textAlign: 'center',
            }} onClick={() => {
                console.log("clicked execute-list-item with ", listItem);
                ipcRenderer.send('execute-list-item', listItem);
            }}>
                <i className="fa fa-2x fa-play" style={{
					color: "green",
				}}></i>
                <br />
                Run
            </div>

            <div style={{
				color: globalState.textColor,
                backgroundColor: globalState.itemColor,
                // display: (listItem.isFavorite) ? 'block' : 'none',
                // Specifically make favorite bigger if it is shown alone
				flex: 1,
				height: '100%',
                marginRight: '1px',
                marginLeft: '1px',
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid ${globalState.itemColor}`,
				textAlign: 'center',
            }} onClick={() => {
                listItem.isFavorite = !listItem.isFavorite;
                console.log("Updating shortcut item with toggled isFavorite: ", listItem);
                ipcRenderer.send('update-shortcut-item', listItem);
            }}>
                {
                    (listItem.isFavorite) ? (
                        <i className="fa fa-2x fa-star" style={{
							color: "gold",
						}}></i>
                    ) : (
                        <i className="fa fa-2x fa-star-o" style={{
							color: "gold",
						}}></i>
                    )
                }
				<br />
				Favorite
            </div>

            <div style={{
				color: globalState.textColor,
                backgroundColor: globalState.itemColor,
				flex: 1,
				height: '100%',
                marginRight: '1px',
                marginLeft: '1px',
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid ${globalState.itemColor}`,
				textAlign: 'center',
            }} onClick={() => {
                listItem.isHidden = !listItem.isHidden;
                console.log("Updating shortcut item with toggled isHidden: ", listItem);
                ipcRenderer.send('update-shortcut-item', listItem);
            }}>
                <i className="fa fa-2x fa-eye" style={{
					color: (listItem.isHidden) ? "grey" : "red",
				}}></i>
				<br />
				Hide
            </div>
        </div>
    );

    // todo add these:
    // - text size
    // - general list item size

    // TOD: Use this to fill list item correctly?

    // add back in:
    // margin: 'auto'

    let buttonSectionElement = doc.getElementById(`buttonSection-${componentArguments.index}`);
    if (!buttonSectionElement) {
        console.log("could not find button section in list of shortcuts");
    }

    return (
        <div style={{
            borderRadius: ".25rem",
            borderWidth: ".50rem",
            border: `2px solid ${globalState.itemBackgroundColor}`,
            backgroundColor: globalState.itemBackgroundColor,
            marginBottom: "8px",
            display: 'flex',
            // justifyContent: 'space-between',
            flexDirection: 'column',
        }} onMouseEnter={(e) => {
            if (buttonSectionElement) buttonSectionElement.style.display = "flex";
        }} onMouseLeave={(e) => {
            if (buttonSectionElement) buttonSectionElement.style.display = "none";
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flex: 2,
            }}>
                {topSection}
                {mouseOverButtonsSection}
            </div>

            {bottomSection}
        </div>
    );
});



const SortableList = SortableContainer((componentArguments) => {
    // console.log("entered SortableContainer with props: ", this.props);

    var items = componentArguments.items;

    return (!items) ? (
        <p>No items yet</p>
    ) : (
        <div style={{margin:'15px'}}>
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
		//
		// // TODO: Save properly
		// this.state = {
		// 	listTitleFontSize: 24,
		// 	listTitleFontWeight: 600,
		// 	listItemFontSize: 20,
		// 	listItemFontWeight: 500,
		// };
		//


        ipcRenderer.on('temporarily-update-app-setting', (event, newSetting) => {
            if (Object.keys(newSetting)[0] == "backgroundColor") {
                window.document.documentElement.style.backgroundColor = newSetting["backgroundColor"];
            }

            this.setState(newSetting);
        });

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

            window.document.documentElement.style.backgroundColor = backgroundColor;
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

        ipcRenderer.on('set-item-background-color', (event, itemBackgroundColor) => {
            console.log('inside Home.jsx set-item-background-color with ', itemBackgroundColor);
            this.setState({
                itemBackgroundColor: itemBackgroundColor
            });
        });

        ipcRenderer.on('set-all-colors', (event, colors) => {
            console.log('inside Home.jsx set-all-colors with ', colors);
            this.setState({
                backgroundColor: colors.backgroundColor,
                itemColor: colors.itemColor,
                textColor: colors.textColor,
                itemBackgroundColor: colors.itemBackgroundColor,
            });
        });

        ipcRenderer.on('update-shortcuts', (event, newShortcuts) => {
            // todo:
            // - randomize the items?

            console.log('entered update-shortcuts in Home');
            let name = newShortcuts.name;
            if (name == "Electron" || name == "ShortcutWizard" ||
                name == "ScreenSaverEngine" || name == "loginwindow") {
                return; // TODO: Could this mess with other electron starter projects?
            }

            let loadingList = null;
            if (this.state && this.state.loading) {
                loadingList = this.state.loading;
                var loadingIndex = loadingList.indexOf(name);
                if (loadingIndex < 0) return; // Stop any new rendering if we are not about to show shortcuts for an app that is loading

                loadingList.splice(loadingIndex, 1);
                if (loadingList.length == 0) {
                    loadingList = null;
                }
            }

            let shortcuts = newShortcuts.shortcuts;
            const shortcutsArray = Object.keys(shortcuts).map(key => shortcuts[key]);
            console.log('ipcRenderer callback, raw, name, new array: ', newShortcuts, name, shortcutsArray);

			var listTitleFontWeight = (newShortcuts.listTitleFontWeight) ? newShortcuts.listTitleFontWeight : 800;
			var listTitleFontSize = (newShortcuts.listTitleFontSize) ? newShortcuts.listTitleFontSize : 24;
			var listItemFontWeight = (newShortcuts.listItemFontWeight) ? newShortcuts.listItemFontWeight : 600;
			var listItemFontSize = (newShortcuts.listItemFontSize) ? newShortcuts.listItemFontSize : 14;

            this.setState({
                name: name,
                initialItems: shortcutsArray,
                items: shortcutsArray,
                loading: loadingList,
				listTitleFontWeight: listTitleFontWeight,
				listTitleFontSize: listTitleFontSize,
				listItemFontWeight: listItemFontWeight,
				listItemFontSize: listItemFontSize,
            });

            window.document.getElementById("searchField").value = "";
        });

        ipcRenderer.on('set-loading', (event, loading) => {
            var alreadyLoading = (this.state) ? this.state.loading : null;
            if (!alreadyLoading) alreadyLoading = [];

            alreadyLoading.push(loading);
            this.setState({
                loading: alreadyLoading
            });
        });

        // Sync function
        ipcRenderer.on('get-loading', (event) => {
            event.returnValue = (this.state && this.state.loading) ? this.state.loading : undefined;
        });

        ipcRenderer.on('no-shortcuts-visual-notification', (event) => {
            console.log("TODO: Show that the list item execution might not work");
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
        this.toggleMiniSettings = this.toggleMiniSettings.bind(this);
        this.changeFontUp = this.changeFontUp.bind(this);
        this.changeFontDown = this.changeFontDown.bind(this);
    }

    changeFontUp() {
		console.log("font up");
		console.log(this.state.listTitleFontSize);
		console.log(this.state.listTitleFontWeight);
		console.log(this.state.listItemFontSize);
		console.log(this.state.listItemFontWeight);

		var newFontValues = {
			listTitleFontSize: this.state.listTitleFontSize + 2,
			listTitleFontWeight: this.state.listTitleFontWeight + 100,
			listItemFontSize: this.state.listItemFontSize + 2,
			listItemFontWeight: this.state.listItemFontWeight + 100,
		};

		ipcRenderer.send('update-current-app-value', newFontValues);

		this.setState(newFontValues);
	}

    changeFontDown() {
		console.log("font down");
		console.log(this.state.listTitleFontSize);
		console.log(this.state.listTitleFontWeight);
		console.log(this.state.listItemFontSize);
		console.log(this.state.listItemFontWeight);

		var newFontValues = {
			listTitleFontSize: this.state.listTitleFontSize - 2,
			listTitleFontWeight: this.state.listTitleFontWeight - 100,
			listItemFontSize: this.state.listItemFontSize - 2,
			listItemFontWeight: this.state.listItemFontWeight - 100,
		};

		ipcRenderer.send('update-current-app-value', newFontValues);

		this.setState(newFontValues);
	}

    toggleSettings() {
        // TODO: refer directly to the browser window by id instead of grabbing all windows
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let settingsWindow = windows[i];
            if (settingsWindow) {
				if (settingsWindow.getTitle() == "settingsWindow") {
					// TODO: Listen for escape once window is visible, to hide window again
					if (settingsWindow.isVisible()) {
						// TODO: Save changes when window is hidden again
		                settingsWindow.hide();
					} else {
		                settingsWindow.show();
					}
	            } else if (settingsWindow.getTitle() == "miniSettingsWindow") {
					if (settingsWindow.isVisible()) {
		                settingsWindow.hide();
					}
	            }
			}
        }
    }

    toggleMiniSettings() {
        // TODO: refer directly to the browser window by id instead of grabbing all windows
        var windows = holdRemote.BrowserWindow.getAllWindows();
        for (var i = 0; i < windows.length; i++) {
            let settingsWindow = windows[i];
            if (settingsWindow) {
				if (settingsWindow.getTitle() == "miniSettingsWindow") {
					// TODO: Listen for escape once window is visible, to hide window again
					if (settingsWindow.isVisible()) {
						// TODO: Save changes when window is hidden again
		                settingsWindow.hide();
					} else {
		                settingsWindow.show();
					}
	            } else if (settingsWindow.getTitle() == "settingsWindow") {
					// Hide main settings window if we clicked eyedropper settings window
					if (settingsWindow.isVisible()) {
						settingsWindow.hide();
					}
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
		// itemColor:hexToRgba(beautifulColors[2], 100),
		// textColor:hexToRgba(beautifulColors[0], 100),

        globalState = this.state;
        console.log('render() called');
        if (!this.state) {

            window.document.documentElement.style.backgroundColor = hexToRgba(beautifulColors[5], 0.5);

            return (
                <div style={{textAlign: 'center'}}>
                    <button style={{color:"white", backgroundColor:"transparent", float:'left'}} id="reload-button" className="simple-button" onClick={() => {
                        console.log('sending reloadShortcuts from ipcRenderer');
                        ipcRenderer.send('main-parse-shortcuts');
                    }}><i className="fa fa-1x fa-rotate-right"></i></button>

                    <button style={{color:"white", backgroundColor:"transparent", float:'right'}} id="settings-button" className="simple-button" onClick={() => {
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

        window.document.documentElement.style.backgroundColor = (this.state.backgroundColor) ?
            this.state.backgroundColor : hexToRgba(beautifulColors[5], 0.5);

        // TODO: check for length here instead of nulling it out above?
        if (this.state.loading) {
            var loadingLength = this.state.loading.length - 1;
            return (
                <div>
                    <h1>Loading shortcuts for {
                        this.state.loading.map((obj, index) => (index == loadingLength) ? obj : obj + ", ")
                    }...</h1>

                    <i className="fa fa-3x fa-spin fa-fw"></i>
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

				<button style={{
                    color: this.state.textColor,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
					float: 'right',
					margin: 0,
                }} id="toggle-main-buttons" className="simple-button" onClick={() => {
					var visible = window.document.getElementById('main-buttons').style.display;
					window.document.getElementById('main-buttons').style.display = (visible == 'flex') ? 'none' : 'flex';
                }}>
                    <i className="fa fa-1x fa-cog"></i>
                </button>

				<div id='main-buttons' style={{
					display: 'none',
					flexDirection: 'row',
				}}>
					<i className="fa fa-1x fa-text-height" style={{
						flex: 1,
	                    marginTop:'7px',
						color: this.state.textColor,
					}}></i>

					<div style={{
						display: 'flex',
						flex: 2,
						flexDirection: 'column'
					}}>
						<button style={{
		                    color: this.state.textColor,
		                    backgroundColor: 'transparent',
							flex: 2,
							margin: 0,
		                }} id="increase-font-size-button" className="simple-button" onClick={() => {
		                    console.log("clicked font size up");
		                    this.changeFontUp();
		                }}>
		                    <i className="fa fa-1x fa-plus"></i>
		                </button>

		                <button style={{
		                    color: this.state.textColor,
		                    backgroundColor: 'transparent',
							flex: 2,
							margin: 0,
		                }} id="decrease-font-size-button" className="simple-button" onClick={() => {
		                    console.log("clicked font size down");
		                    this.changeFontDown();
		                }}>
		                    <i className="fa fa-1x fa-minus"></i>
		                </button>
					</div>

					<i className="fa fa-1x fa-cog" style={{
						flex: 1,
	                    marginTop:'7px',
						color: this.state.textColor,
					}}></i>

					<div style={{
						display: 'flex',
						flex: 2,
						flexDirection: 'column'
					}}>
		                <button style={{
		                    color: this.state.textColor,
		                    backgroundColor: 'transparent',
							flex: 2,
							margin: 0,
		                }} id="settings-button" className="simple-button" onClick={() => {
		                    console.log("clicked settings");
		                    this.toggleSettings();
		                }}>
		                    <i className="fa fa-1x fa-sliders"></i>
		                </button>

		                <button style={{
		                    color: this.state.textColor,
		                    backgroundColor: 'transparent',
							flex: 2,
							margin: 0,
		                }} id="mini-settings-button" className="simple-button" onClick={() => {
		                    console.log("clicked miniSettings");
		                    this.toggleMiniSettings();
		                }}>
		                    <i className="fa fa-1x fa-eyedropper"></i>
		                </button>
					</div>

					<button	id="sw_full_view_icon" className="simple-button" onClick{() => {
						ipcRenderer.send('set-full_view-mode');
						console.log("clicked sw_full_view_icon");
					}}>
						<i source="../assets/sw_full_view_icon.png"></i>
					</button>

					<button id="sw_bubble_icon" className="simple-button" onClick{() => {
						ipcRenderer.send('set-bubble-mode');
						console.log("clicked sw_bubble_icon");
					}}>
						<i source="../assets/sw_bubble_icon.png"></i>
					</button>

					<button id="sw_hidden_icon" className="simple-button" onClick{() => {
						ipcRenderer.send('set-hidden-mode');
						console.log("clicked sw_hidden_icon");
					}}>
						<i source="../assets/sw_hidden_icon.png"></i>
					</button>



	                <input id="searchField" style={{
						fontSize: 18,
						width: "20%",
						color: this.state.textColor,
						backgroundColor: 'transparent',
						borderColor: 'transparent',
						flex: 2,
					}} type="text" placeholder="&#xF002;" onChange={this.filterListTrigger} onFocus={() => {
						// TODO: Move this down one line so it has the entire width to show search box
						window.document.getElementById("searchField").style.width = "100%";
						window.document.getElementById("searchField").style.flex = 6;
						window.document.getElementById("searchField").style.backgroundColor = "white";
					}} onBlur={() => {
						window.document.getElementById("searchField").style.width = "20%";
						window.document.getElementById("searchField").style.flex = 2;
						window.document.getElementById("searchField").style.backgroundColor = "transparent";
					}}/>
				</div>

                <h1 style={{
                    color: this.state.textColor,
                    marginTop:'2px',
                    marginBottom:'2px',
                }}>{this.state.name}</h1>


                <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
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
