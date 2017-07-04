'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactTooltip from 'react-tooltip'
import ReactDOM from 'react-dom';


let globalState;
// From http://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
let beautifulColors = ["#2c7bb6",  "#00a6ca", "#00ccbc", "#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];

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

    let topSection = (
        <p style={{
            // color: globalState.textColor,
            flex: 2,
            marginRight: '4px',
            marginLeft: '10px',
			fontSize: globalState.listTitleFontSize,
			fontWeight: globalState.listTitleFontWeight,
        }}>{listItem.name}</p>
    );

    let bottomSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 2,
            fontWeight: globalState.listItemFontWeight,
        }}>
            <p style={{
                flex: 2,
                marginRight: '5px',
                marginLeft: '5px',
                // color: globalState.textColor,
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid #ddd`,
                backgroundColor: '#f5f5f4',
                textAlign: 'center',
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
                    // color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid #ddd`,
                    backgroundColor: '#f5f5f4',
                    textAlign: 'center',
                }}>{listItem["glyph"]}</p>
            ): ""}

            {(listItem["char"]) ? (
                <p style={{
                    flex: 2,
                    marginRight: '5px',
                    marginLeft: '5px',
                    // color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid #ddd`,
                    backgroundColor: '#f5f5f4',
                    textAlign: 'center',
                }}>{listItem["char"]}</p>
            ): ""}

            { (globalState.showMenuNames) ? (
                <p style={{
                    flex: 2,
                    marginRight: '5px',
                    marginLeft: '5px',
                    // color: globalState.textColor,
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid #ddd`,
                    backgroundColor: '#f5f5f4',
                    textAlign: 'center',
                }}>{listItem.menuName}</p>
            ) : ""}

            {(globalState.focused && componentArguments.index < 5) ? (
                <p style={{
                    // color: globalState.textColor,
                    flex: 1,
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    borderRadius: ".25rem",
                    borderWidth: ".50rem",
                    border: `2px solid #ddd`,
                    backgroundColor: '#f5f5f4',
                    textAlign: 'center',
                }}>⌘ {componentArguments.index + 1}</p>
            ) : ""}
        </div>
    );

    let mouseOverButtonsSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            marginBottom: '2px',
            // marginTop: '2px',
            justifyContent: 'center',
            alignContent: 'stretch',
            textAlign: 'center',
            height: '100%',
        }}>
            <div name={`buttonSection-${componentArguments.index}`} className="btn-group toolbar-actions" style={{
                display: 'none',
            }}>
                <button className="btn btn-default" style={{
                    // color: this.state.textColor,
                    // backgroundColor: 'transparent',
                    // flex: 2,
                    // margin: 0,
                    // flex: 4,
                }} onClick={() => {
                    console.log("clicked execute-list-item with ", listItem);
                    ipcRenderer.send('execute-list-item', listItem);
                }}>
                    <span className="fa fa-3x fa-play"style={{
                        color: "green",
                    }}></span>
                    <br />
                    Execute
                </button>

                <button id={(listItem.isFavorite) ? 'enabled-favorite-button' : ''} className="btn btn-default" style={{
                    // color: this.state.textColor,
                    // backgroundColor: 'transparent',
                    // flex: 2,
                    // margin: 0,
                    // flex: 4,
                    // display: (listItem.isFavorite) ? 'block' : 'none',
                    // color: globalState.textColor,
                    backgroundColor: (listItem.isFavorite) ? 'transparent' : globalState.itemColor,
                }} onClick={() => {
                    listItem.isFavorite = !listItem.isFavorite;
                    console.log("Updating shortcut item with toggled isFavorite: ", listItem);
                    ipcRenderer.send('update-shortcut-item', listItem);
                }}>
                    {
                        (listItem.isFavorite) ? (
                            <span className="fa fa-3x fa-star" style={{
                                color: "gold",
                            }}></span>
                        ) : (
                            <span className="fa fa-3x fa-star-o" style={{
                                color: "gold",
                            }}></span>
                        )
                    }
                    <br />
                    Favorite
                </button>

                <button id={(listItem.isHidden) ? 'enabled-hidden-button' : ''} className="btn btn-default" style={{
                    // color: this.state.textColor,
                    // backgroundColor: 'transparent',
                    // flex: 2,
                    // margin: 0,
                    // flex: 4,
                    backgroundColor: (listItem.isHidden) ? 'transparent' : globalState.itemColor,
                }} onClick={() => {
                    listItem.isHidden = !listItem.isHidden;
                    console.log("Updating shortcut item with toggled isHidden: ", listItem);
                    ipcRenderer.send('update-shortcut-item', listItem);
                }}>
                    <span className="fa fa-3x fa-eye" style={{
                        color: (listItem.isHidden) ? "grey" : "red",
                    }}></span>
                    <br />
                    Hide
                </button>

                <button className="btn btn-default"
                onMouseEnter={(e) => {
                    console.log(`sending show-tooltip-for-list-item with ${componentArguments.listItem}`);
                    ipcRenderer.send('show-tooltip-for-list-item', componentArguments.listItem);
                }} onMouseLeave={(e) => {
                    console.log(`sending hide-tooltip with ${componentArguments.listItem}`);
                    ipcRenderer.send('hide-tooltip');
                }} onClick={() => {
                    console.log(`sending hide-tooltip with ${componentArguments.listItem}`);
                    ipcRenderer.send('hide-tooltip');
                    ipcRenderer.send('record-gif', listItem);
                }}>
                    <span className="fa fa-3x fa-film" style={{ }}></span>
                    <br />
                    GIF
                </button>
            </div>
        </div>
    );

    // todo add these:
    // - general list item size

    return (
        <td style={{
            borderRadius: ".35rem",
            borderWidth: ".50rem",
            borderLeft: `2px solid #f5f5f4`,
            borderRight: `2px solid #f5f5f4`,
            borderTop: `2px solid #f5f5f4`,
            borderBottom: `2px solid #ddd`,
            // backgroundColor: globalState.itemBackgroundColor,
            // marginBottom: "8px",
            display: 'flex',
            // justifyContent: 'space-between',
            flexDirection: 'column',
            padding: 0,
        }} onMouseEnter={(e) => {
			let buttonSectionElements = componentArguments.contentWindow.document.getElementsByName(`buttonSection-${componentArguments.index}`);
            if (buttonSectionElements) {
				for (var i = 0; i < buttonSectionElements.length; i++) {

					buttonSectionElements[i].style.display = "block";

					if (buttonSectionElements[i].id === "enabled-favorite-button" || 
                        buttonSectionElements[i].id === "enabled-hidden-button") {
                        buttonSectionElements[i].style.backgroundColor = globalState.itemColor;
                        buttonSectionElements[i].style.border = `2px solid ${globalState.itemColor}`;
                    }
				}
			}
        }} onMouseLeave={(e) => {
            // Call this to be doubly sure tooltip is hidden
            ipcRenderer.send('hide-tooltip');

			let buttonSectionElements = componentArguments.contentWindow.document.getElementsByName(`buttonSection-${componentArguments.index}`);
            if (buttonSectionElements) {
				for (var i = 0; i < buttonSectionElements.length; i++) {
					if (buttonSectionElements[i].id != "enabled-favorite-button" && 
                        buttonSectionElements[i].id != "enabled-hidden-button") {
						buttonSectionElements[i].style.display = "none";
					} else {
                        buttonSectionElements[i].style.backgroundColor = "transparent";
                        buttonSectionElements[i].style.border = "transparent";
                    }
				}
			}
        }}>
            <div style={{
                flex: 3,
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid #f5f5f4`,
            }}>
                {topSection}
                {mouseOverButtonsSection}
            </div>

            {bottomSection}
        </td>
    );
});



const SortableList = SortableContainer((componentArguments) => {
    // console.log("entered SortableContainer with props: ", this.props);

    let items = componentArguments.items;

    return (!items) ? (
        <p>No items yet</p>
    ) : (
        <div>
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

        ipcRenderer.on('focus', (event, focus) => {
            this.setState({
                focused: focus,
            });
        });

        ipcRenderer.on('execute-list-item', (event, itemNumber) => {
            if (this.state && this.state.items && this.state.items.length >= itemNumber) {
                ipcRenderer.send('execute-list-item', this.state.items[itemNumber]);
            }
        });

        ipcRenderer.on('focus-search-field', (event) => {
            window.document.getElementById("title").style.display = "none";
            window.document.getElementById("settings-button-group").style.display = "block";
            window.document.getElementById("search-field").style.display = "";

            ipcRenderer.send('show-window');
            window.document.getElementById("search-field").focus();
        });

        ipcRenderer.on('temporarily-update-app-settings', (event, newSetting) => {
            // let backgroundColor = newSetting["backgroundColor"];
            // if (backgroundColor) {
            //     window.document.documentElement.style.backgroundColor = backgroundColor;
            //     this.setState({
            //         backgroundColor: backgroundColor
            //     });
            // }

            // let itemColor = newSetting["itemColor"];
            // if (itemColor) {
            //     this.setState({
            //         itemColor: itemColor
            //     });
            // }

            // let textColor = newSetting["textColor"];
            // if (textColor) {
            //     this.setState({
            //         textColor: textColor
            //     });
            // }

            // let itemBackgroundColor = newSetting["itemBackgroundColor"];
            // if (itemBackgroundColor) {
            //     this.setState({
            //         itemBackgroundColor: itemBackgroundColor
            //     });
            // }
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
            // console.log('inside Home.jsx set-background-color with ', backgroundColor);

            // window.document.documentElement.style.backgroundColor = backgroundColor;
            // this.setState({
            //     backgroundColor: backgroundColor
            // });
        });

        ipcRenderer.on('set-item-color', (event, itemColor) => {
            // console.log('inside Home.jsx set-item-color with ', itemColor);
            // this.setState({
            //     itemColor: itemColor
            // });
        });

        ipcRenderer.on('set-text-color', (event, textColor) => {
            // console.log('inside Home.jsx set-text-color with ', textColor);
            // this.setState({
            //     textColor: textColor
            // });
        });

        ipcRenderer.on('set-item-background-color', (event, itemBackgroundColor) => {
            // console.log('inside Home.jsx set-item-background-color with ', itemBackgroundColor);
            // this.setState({
            //     itemBackgroundColor: itemBackgroundColor
            // });
        });

        ipcRenderer.on('set-all-colors', (event, colors) => {
            // console.log('inside Home.jsx set-all-colors with ', colors);
            // this.setState({
            //     backgroundColor: colors.backgroundColor,
            //     itemColor: colors.itemColor,
            //     textColor: colors.textColor,
            //     itemBackgroundColor: colors.itemBackgroundColor,
            // });
        });

        ipcRenderer.on('update-shortcuts', (event, newShortcuts) => {
            // todo:
            // - randomize the items?

            console.log('entered update-shortcuts in Home');
            console.log(newShortcuts);
            let name = newShortcuts.name;

        	if (name === "Electron" ||
                name === "ShortcutMagic" ||
                name === "ShortcutMagic-mac" ||
                name === "ScreenSaverEngine" ||
                name === "loginwindow" ||
                name === "Dock" ||
                name === "Google Software Update..." ||
                name === "Google Software Update" ||
                name === "Dropbox Finder Integration" ||
                name === "Kap" ||
                name === "SecurityAgent" ||
                name === "AirPlayUIAgent") {
                return; // TODO: Could this mess with other electron starter projects?
            }

            let loadingList = null;
            if (this.state && this.state.loading) {
                loadingList = this.state.loading;
                let loadingIndex = loadingList.indexOf(name);
                if (loadingIndex < 0) return; // Stop any new rendering if we are not about to show shortcuts for an app that is loading

                loadingList.splice(loadingIndex, 1);
                if (loadingList.length == 0) {
                    loadingList = null;
                }
            }

            let shortcuts = newShortcuts.shortcuts;
            const shortcutsArray = Object.keys(shortcuts).map(key => shortcuts[key]);
            console.log('ipcRenderer callback, raw, name, new array: ', newShortcuts, name, shortcutsArray);

			let listTitleFontWeight = (newShortcuts.listTitleFontWeight) ? newShortcuts.listTitleFontWeight : 400;
			let listTitleFontSize = (newShortcuts.listTitleFontSize) ? newShortcuts.listTitleFontSize : 16;
			let listItemFontWeight = (newShortcuts.listItemFontWeight) ? newShortcuts.listItemFontWeight : 200;
			let listItemFontSize = (newShortcuts.listItemFontSize) ? newShortcuts.listItemFontSize : 14;

            this.setState({
                name: name,
                initialItems: shortcutsArray,
                items: shortcutsArray,
                loading: loadingList,
                hiddenLoading: false,
				listTitleFontWeight: listTitleFontWeight,
				listTitleFontSize: listTitleFontSize,
				listItemFontWeight: listItemFontWeight,
				listItemFontSize: listItemFontSize,
            });

            window.document.getElementById("search-field").value = "";
            // TODO: Scroll to top here
        });

        ipcRenderer.on('set-loading', (event, loading) => {
            var alreadyLoading = (this.state) ? this.state.loading : null;
            if (!alreadyLoading) alreadyLoading = [];

            alreadyLoading.push(loading);
            this.setState({
                loading: alreadyLoading,
                hiddenLoading: false,
            });
        });

        // Sync function
        ipcRenderer.on('get-loading', (event) => {
            event.returnValue = (this.state && this.state.loading) ? this.state.loading : undefined;
        });

        ipcRenderer.on('no-shortcuts-visual-notification', (event) => {
            console.log("TODO: Show that the list item execution might not work");
        });

		ipcRenderer.on('hidden-mode', (event) => {
			this.setState({
				mode: "hidden-mode"
			})
		});

		ipcRenderer.on('bubble-mode', (event) => {

			this.setState({
				mode: "bubble-mode"
			})
		});

		ipcRenderer.on('full-mode', (event) => {
			this.setState({
				mode: "full-mode"
			})
		});

        console.log('home constructor called');
        // this.setState({
        //     name: "ShortcutMagic",
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

		let newFontValues = {
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
        let windows = holdRemote.BrowserWindow.getAllWindows();
        for (let i = 0; i < windows.length; i++) {
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
        let windows = holdRemote.BrowserWindow.getAllWindows();
        let mainWindow = null;
        for (let i = 0; i < windows.length; i++) {
            mainWindow = windows[i];
            if (mainWindow && mainWindow.getTitle() == "mainWindow") break;
        }

        for (let i = 0; i < windows.length; i++) {
            let settingsWindow = windows[i];
            if (settingsWindow) {
				if (settingsWindow.getTitle() == "miniSettingsWindow") {
					// TODO: Listen for escape once window is visible, to hide window again
					if (settingsWindow.isVisible()) {
						// TODO: Save changes when window is hidden again
		                settingsWindow.hide();
					} else {
                        let originalBounds = settingsWindow.getBounds();
                        let mainBounds = mainWindow.getBounds();
                        // Show window left or right of main window depending on screen position:
                        if (mainBounds.x > 600) {
                            originalBounds.x = mainBounds.x - originalBounds.width;
                        } else {
                            originalBounds.x = mainBounds.x + mainBounds.width;
                        }

                        settingsWindow.webContents.send('set-style', this.state);
                        settingsWindow.setBounds(originalBounds);
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
        this.filterList((event) ? event.target.value : "");
    }

    filterList(targetValue) {
        let updatedList = this.state.initialItems;

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
            // window.document.documentElement.style.backgroundColor = hexToRgba(beautifulColors[Math.floor(Math.random() * beautifulColors.length)], 0.5);
            let randomWelcomeText = "Welcome to ShortcutMagic!";

            switch (Math.floor(Math.random() * 8)) {
                case 0:
                    randomWelcomeText = "Did you know ShortcutMagic was created with the dream to help all humans use computers?";
                    break;
                case 1:
                    randomWelcomeText = `Did you know that ShortcutMagic pretends to actually press the keyboard?
                    It is done to make the computer understand us the best.`;
                    break;
                case 2:
                    randomWelcomeText = "Did you know that using shortcuts prevents carpal tunnel and other computer related injuries?";
                    break;
                case 3:
                    randomWelcomeText = `Did you know that using a shortcut over and over will make it "muscle memory".
                    At some point you remember it automatically, so the more you use it, the easier it gets.`;
                    break;
                case 4:
                    randomWelcomeText = `Did you know that shortcuts are identical in many different programs?
                    "Copy", "Paste" and "New file" are the most common ones.`;
                    break;
                case 5:
                    randomWelcomeText = `Did you know that ShortcutMagic will remember where you want it to be?
                    Each program gets its own ShortcutMagic position, color, transparency and size.`;
                    break;
                // case 6:
                //     randomWelcomeText = `Did you know that ShortcutMagic will remember what color and transparency you set for each program?
                //     This way you can make it look exactly the way you want to.`;
                //     break;
                // case 7:
                //     randomWelcomeText = `Did you know that you are helping people in need by becoming a ShortcutMagic member?
                //     Because you contribute with paying for a membership, a person in need will get ShortcutMagic for free.`;
                //     break;
                case 6:
                    randomWelcomeText = `Did you know that ShortcutMagic has its own shortcuts? You can make the window small,
                    hide it completely, or show it like normal. ShortcutMagic remembers how you conifgured each mode, too.`;
                    break;
                case 7:
                    randomWelcomeText = `Did you know that the ShortcutMagic program is actually a local website?
                    That way it will work on as many different computers as possible, so it can help as many as possible.`;
                    break;
                case 8:
                    randomWelcomeText = `Did you know that ShortcutMagic will work for website shortcuts too?
                    This is more difficult than program shortcuts, because websites don't follow a standard for
                    making shortcuts, so it has to be added individually for each one.`;
                    break;
            }

            return (
                <div style={{
                    color: 'white',
                    padding: '40px',
                    textAlign: 'center',
                }}>
                    <h1>ShortcutMagic</h1>
                    <p>{randomWelcomeText}</p>
                </div>
            );
        }

        // window.document.documentElement.style.backgroundColor = (this.state.backgroundColor) ?
        //     this.state.backgroundColor : hexToRgba(beautifulColors[Math.floor(Math.random() * beautifulColors.length)], 0.5);

        // TODO: check for length here instead of nulling it out above?
        if (this.state.loading && !this.state.hiddenLoading) {
            let loadingLength = this.state.loading.length - 1;
            return (
                <div>
                    <h1>Loading shortcuts for {
                        this.state.loading.map((obj, index) => (index == loadingLength) ? obj : obj + ", ")
                    }...</h1>

                    <i className="fa fa-3x fa-spin fa-spinner"></i>

                    <button style={{
                        // color: this.state.textColor,
                        borderColor: 'transparent',
                        margin: 0,
                    }} id="toggle-main-buttons" className="simple-button" onClick={() => {
                        this.setState({
                            hiddenLoading: true
                        });
                    }}>
                        Hide
                    </button>
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


		let SearchField = (
            <input id="search-field" className="form-control" type="text" placeholder="Search actions and shortcuts"
            style={{
                display: 'none',
                borderRadius: ".25rem",
                borderWidth: ".50rem",
                border: `2px solid #737475`, // #737475 is the color from Photon mac css
            }} onChange={this.filterListTrigger}
            onKeyDown={(e) => {
                if (e.keyCode === 27) { // key code 27 == escape
                    ipcRenderer.send('unfocus-main-window');

                    // Clear search field and trigger list filter on empty search filter
                    window.document.getElementById("search-field").value = '';
                    this.filterListTrigger();

                    // Reset looks of title/search area
                    // TODO: DRY this up in a function
                    window.document.getElementById("title").style.display = "block";
                    window.document.getElementById("settings-button-group").style.display = "none";
                    window.document.getElementById("search-field").style.display = "none";
                }
            }}/>
		);

        let shortcuts = this.state.items;
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

		let ShortcutList = (
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
		);

        let tooltipEffect = {
            place: "bottom",
            type: "light",
            effect: "solid",
        };

        let SettingsButtons = (
            <div id="settings-button-group" className="toolbar-actions" style={{
                display: 'none',
            }}>
                <div className="btn-group">
                    <button className="btn btn-default"
                    onClick={() => {
                        console.log(`opening community window `);
                        ipcRenderer.send('toggle-gif-community');
                    }}>
                        <ReactTooltip id='gifcommunity-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='gifcommunity-tooltip'
                            data-iscapture="true"
                            data-tip={`Open community window
                                \nwith gif overview`} className="fa fa-film" style={{}}>
                        </span>
                    </button>

                    <button id="increase-font-size-button" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    // backgroundColor: 'transparent',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
                        console.log("clicked font size up");
                        this.changeFontUp();
                    }}>
                        <ReactTooltip id='increase-font-size-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='increase-font-size-tooltip'
                            data-iscapture="true"
                            data-tip="Open community window<br />with gif overview" className="icon icon-plus-circled">
                        </span>
                    </button>
                    <button id="decrease-font-size-button" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    // backgroundColor: 'transparent',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
                        console.log("clicked font size down");
                        this.changeFontDown();
                    }}>
                        <ReactTooltip id='decrease-font-size-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='decrease-font-size-tooltip'
                            data-iscapture="true"
                            data-tip="Smaller text" className="icon icon-minus-circled">
                        </span>
                    </button>
                    <button id="settings-button" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    // backgroundColor: 'transparent',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
                        console.log("clicked settings");
                        this.toggleSettings();
                    }}>
                        <ReactTooltip id='toggle-settings-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='toggle-settings-tooltip'
                            data-iscapture="true"
                            data-tip="Settings" className="icon icon-cog">
                        </span>
                    </button>
                    <button id="toggle-bubble-mode" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    backgroundColor: (this.state.windowMode === "bubble") ? '#333' : '#fcfcfc',
    							// flex: 2,
    							// margin: 0,

                    }} onClick={() => {
    					ipcRenderer.send('set-bubble-mode');
                    }}>
                        <ReactTooltip id='toggle-bubble-mode-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='toggle-bubble-mode-tooltip'
                            data-iscapture="true"
                            data-tip={`Mini mode
                            \n\nUse this mode when you want
                            \nas much space as possible for other things.
                            \nThe mode will be remembered and stay the same
                            \neach time {this.state.name} is focused.`} className="icon icon-progress-0">
                        </span>
                    </button>
                    <button id="toggle-full-mode" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    backgroundColor: (this.state.windowMode === "full") ? '#333' : '#fcfcfc',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
    					ipcRenderer.send('set-full-view-mode');
                    }}>
                        <ReactTooltip id='toggle-full-mode-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='toggle-full-mode-tooltip'
                            data-iscapture="true"
                            data-tip={`Regular mode
                                \n\nThis mode is good for learning and
                                \nexploring a program. Drag the edges of
                                \nthe windows to resize.`} className="icon icon-window">
                        </span>
                    </button>
                    <button id="toggle-hidden-mode" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    backgroundColor: (this.state.windowMode === "hidden") ? '#333' : '#fcfcfc',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
                        // TODO: Manage state ourselves here? messy..
    					ipcRenderer.send('set-hidden-mode');
                    }}>
                        <ReactTooltip id='toggle-hidden-mode-tooltip'
                            place={tooltipEffect.place}
                            type={tooltipEffect.type}
                            effect={tooltipEffect.effect}
                            multiline={true}/>

                        <span data-for='toggle-hidden-mode-tooltip'
                            data-iscapture="true"
                            data-tip={`Hide
                                \n\nThis hides the window completely
                                \nfor ${this.state.name}. You have to click the hat
                                \nicon to show it again.`} className="icon icon-publish">
                        </span>
                    </button>
                </div>
            </div>
        );

        // TODO: Add colors back in at some point: 
       //          <button id="mini-settings-button" className="btn btn-default" style={{
             //                // color: this.state.textColor,
             //                // backgroundColor: 'transparent',
                            // // flex: 2,
                            // // margin: 0,
       //          }} onClick={() => {
       //              console.log("clicked miniSettings");
       //              this.toggleMiniSettings();
       //          }}>
       //              <ReactTooltip id='toggle-mini-settings-tooltip'
       //                  place={tooltipEffect.place}
       //                  type={tooltipEffect.type}
       //                  effect={tooltipEffect.effect}
       //                  multiline={true}/>

       //              <span data-for='toggle-mini-settings-tooltip'
       //                  data-iscapture="true"
       //                  data-tip={`Colors and themes.
       //                      \n\nThis is where you can customize ShortcutMagic
       //                      \nto look exactly like you want.`} className="icon icon-palette">
       //              </span>
       //          </button>






        let Title = (
            <h1 id="title" style={{
                // color: this.state.textColor,
                marginTop:'2px',
                marginBottom:'2px',
            }}>{(displaySettings) ? displaySettings : this.state.name}</h1>
        );

        let displaySettings = null;
        let hidingSlowly = false;
		let TitleAndSettings = (
            <div id="title-and-settings"
            style={{
                textAlign: 'center',
            }} onMouseEnter={(e) => {
                hidingSlowly = true;
    			window.document.getElementById("settings-button-group").style.display = "block";
    			window.document.getElementById("search-field").style.display = "";

                ipcRenderer.send('show-window');
    			window.document.getElementById("search-field").focus();
            }} onMouseLeave={(e) => {
                if (hidingSlowly) {
                    hidingSlowly = false;
                    setTimeout(() => {
                        if (!hidingSlowly) {
                			window.document.getElementById("settings-button-group").style.display = "none";
                			window.document.getElementById("search-field").style.display = "none";
                        }
                    }, 400);
                } else {
        			window.document.getElementById("settings-button-group").style.display = "none";
        			window.document.getElementById("search-field").style.display = "none";
                }
            }}>
                {Title}
                {SettingsButtons}
                {SearchField}
            </div>
		);

		let HiddenSettings = (
            <div id="hidden-settings"
            style={{
                height: '20px',
                width: '100%',
                textAlign: 'center',
            }} onMouseEnter={(e) => {
                hidingSlowly = true;
    			window.document.getElementById("settings-button-group").style.display = "block";
    			window.document.getElementById("search-field").style.display = "";
    			window.document.getElementById("hidden-settings").style.height = '60px';

                ipcRenderer.send('show-window');
    			window.document.getElementById("search-field").focus();
            }} onMouseLeave={(e) => {
                if (hidingSlowly) {
                    hidingSlowly = false;
                    setTimeout(() => {
                        if (!hidingSlowly) {
                			window.document.getElementById("settings-button-group").style.display = "none";
                			window.document.getElementById("search-field").style.display = "none";
                            window.document.getElementById("hidden-settings").style.height = '20px';
                        }
                    }, 400);
                } else {
        			window.document.getElementById("settings-button-group").style.display = "none";
        			window.document.getElementById("search-field").style.display = "none";
                    window.document.getElementById("hidden-settings").style.height = '20px';
                }
            }}>
                {SearchField}{SettingsButtons}
            </div>
		);


		if (this.state.mode == "hidden-mode") {
			// Hidden mode:
            // TODO:
            // 1) listen to some kind of click on the tray
            // 2) Show mini window with 1 random favorite
            // 3) Show search, focused

			return (
                <div className="window">
                  <div className="window-content">
                      <div className="pane">
                        <table className="table-striped">
                          <tbody>
                            <tr className="file_arq">
                              <td>{SearchField}</td>
                            </tr>
                            <tr className="file_arq">
                              <td>{SearchResults}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
			);
		} else if (this.state.mode == "bubble-mode") {
			// Bubble mode:
			return (
                <div className="window">

                  <div className="window-content">
                      <div className="pane">
                        <table className="table-striped">
                          <tbody>
                            <tr className="file_arq">
                                <td>{HiddenSettings}</td>
                            </tr>
                            <tr className="file_arq">
                              {ShortcutList}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
			);
		} else {
            // Full mode:
            return (
                <div className="window">

                  <div className="window-content">
                        <table className="table-striped">
                          <thead>
                            <tr>
                              <th>{TitleAndSettings}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ShortcutList}
                          </tbody>
                        </table>
                    </div>
                    
                  </div>
	        );
			// previous sortablelist itemstyle
			//   itemStyle={{backgroundColor: (this.state.itemColor) ? this.state.itemColor : '#FFFFFF'}}
		}
    }
}

window.onload = function(){
    ReactDOM.render(<Home />, document.getElementById("app"));
}