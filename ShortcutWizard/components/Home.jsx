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

    let topSection = (
        <p style={{
            color: globalState.textColor,
            flex: 2,
            marginRight: '4px',
			fontSize: globalState.listTitleFontSize,
			fontWeight: globalState.listTitleFontWeight,
        }}>{listItem.name}</p>
    );

    let bottomSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 2,
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

    // 1 big 2 small version:
    // var mouseOverButtonsSection = (
    //     <div style={{
    //         display: 'flex',
    //         flexDirection: 'row',
    //         flex: 2,
    //         marginBottom: '2px',
    //         // marginTop: '2px',
    //         // alignContent: 'stretch',
    //     }}>
    //         <div name={`buttonSection-${componentArguments.index}`} style={{
	// 			display: 'none',
	// 			color: globalState.textColor,
	// 			flex: 3,
    //             // height: '100%',
    //             backgroundColor: globalState.itemColor,
    //             marginRight: '1px',
    //             marginLeft: '1px',
    //             borderRadius: ".25rem",
    //             borderWidth: ".50rem",
    //             border: `2px solid ${globalState.itemColor}`,
	// 			textAlign: 'center',
    //         }} onClick={() => {
    //             console.log("clicked execute-list-item with ", listItem);
    //             ipcRenderer.send('execute-list-item', listItem);
    //         }}>
    //             <i className="fa fa-2x fa-play" style={{
	// 				color: "green",
	// 			}}></i>
    //             <br />
    //             Run
    //         </div>
    //
    //         <div style={{
    //             display: 'flex',
    //             flexDirection: 'column',
    //             flex: 2,
    //             flexWrap: 'nowrap',
    //             // alignContent: 'stretch',
    //         }}>
    //             <div id={(listItem.isFavorite) ? 'enabled-favorite-button' : ''}
    // 			name={`buttonSection-${componentArguments.index}`}
    // 			style={{
    // 				display: (listItem.isFavorite) ? 'block' : 'none',
    // 				color: globalState.textColor,
    //                 backgroundColor: globalState.itemColor,
    // 				flex: 1,
    // 				// height: '100%',
    //                 marginRight: '1px',
    //                 marginLeft: '1px',
    //                 borderRadius: ".25rem",
    //                 borderWidth: ".50rem",
    //                 border: `2px solid ${globalState.itemColor}`,
    // 				textAlign: 'center',
    //             }} onClick={() => {
    //                 listItem.isFavorite = !listItem.isFavorite;
    //                 console.log("Updating shortcut item with toggled isFavorite: ", listItem);
    //                 ipcRenderer.send('update-shortcut-item', listItem);
    //             }}>
    //                 {
    //                     (listItem.isFavorite) ? (
    //                         <i className="fa fa-2x fa-star" style={{
    // 							color: "gold",
    // 						}}></i>
    //                     ) : (
    //                         <i className="fa fa-2x fa-star-o" style={{
    // 							color: "gold",
    // 						}}></i>
    //                     )
    //                 }
    // 				<br />
    // 				Favorite
    //             </div>
    //
    //             <div name={`buttonSection-${componentArguments.index}`} style={{
    // 				display: 'none',
    // 				color: globalState.textColor,
    //                 backgroundColor: globalState.itemColor,
    // 				flex: 1,
    // 				// height: '100%',
    //                 marginRight: '1px',
    //                 marginLeft: '1px',
    //                 borderRadius: ".25rem",
    //                 borderWidth: ".50rem",
    //                 border: `2px solid ${globalState.itemColor}`,
    // 				textAlign: 'center',
    //             }} onClick={() => {
    //                 listItem.isHidden = !listItem.isHidden;
    //                 console.log("Updating shortcut item with toggled isHidden: ", listItem);
    //                 ipcRenderer.send('update-shortcut-item', listItem);
    //             }}>
    //                 <i className="fa fa-2x fa-eye" style={{
    // 					color: (listItem.isHidden) ? "grey" : "red",
    // 				}}></i>
    // 				<br />
    // 				Hide
    //             </div>
    //         </div>
    //     </div>
    // );

    // 3 small ones:
    var mouseOverButtonsSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 2,
            marginBottom: '2px',
            // marginTop: '2px',
            // alignContent: 'stretch',
        }}>
            <div name={`buttonSection-${componentArguments.index}`} style={{
				display: 'none',
				color: globalState.textColor,
				flex: 4,
                // height: '100%',
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

            <div id={(listItem.isFavorite) ? 'enabled-favorite-button' : ''}
			name={`buttonSection-${componentArguments.index}`}
			style={{
				display: (listItem.isFavorite) ? 'block' : 'none',
				color: globalState.textColor,
				backgroundColor: (listItem.isFavorite) ? 'transparent' : globalState.itemColor,
				border: (listItem.isFavorite) ? 'transparent' : `2px solid ${globalState.itemColor}`,
				flex: 2,
				// height: '100%',
                marginRight: '1px',
                marginLeft: '1px',
                borderRadius: ".25rem",
                borderWidth: ".50rem",
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

            <div name={`buttonSection-${componentArguments.index}`} style={{
				display: 'none',
				color: globalState.textColor,
                backgroundColor: globalState.itemColor,
				flex: 2,
				// height: '100%',
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
    // - general list item size

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
			let buttonSectionElements = componentArguments.contentWindow.document.getElementsByName(`buttonSection-${componentArguments.index}`);
            if (buttonSectionElements) {
				for (var i = 0; i < buttonSectionElements.length; i++) {

					buttonSectionElements[i].style.display = "block";

					if (buttonSectionElements[i].id === "enabled-favorite-button") {
                        buttonSectionElements[i].style.backgroundColor = globalState.itemColor;
                        buttonSectionElements[i].style.border = `2px solid ${globalState.itemColor}`;
                    }
				}
			}
        }} onMouseLeave={(e) => {
			let buttonSectionElements = componentArguments.contentWindow.document.getElementsByName(`buttonSection-${componentArguments.index}`);
            if (buttonSectionElements) {
				for (var i = 0; i < buttonSectionElements.length; i++) {
					if (buttonSectionElements[i].id != "enabled-favorite-button") {
						buttonSectionElements[i].style.display = "none";
					} else {
                        buttonSectionElements[i].style.backgroundColor = "transparent";
                        buttonSectionElements[i].style.border = "transparent";
                    }
				}
			}
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
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
        <div style={{margin:'5px'}}>
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


        ipcRenderer.on('temporarily-update-app-settings', (event, newSetting) => {
            let backgroundColor = newSetting["backgroundColor"];
            if (backgroundColor) {
                window.document.documentElement.style.backgroundColor = backgroundColor;
                this.setState({
                    backgroundColor: backgroundColor
                });
            }

            let itemColor = newSetting["itemColor"];
            if (itemColor) {
                this.setState({
                    itemColor: itemColor
                });
            }

            let textColor = newSetting["textColor"];
            if (textColor) {
                this.setState({
                    textColor: textColor
                });
            }

            let itemBackgroundColor = newSetting["itemBackgroundColor"];
            if (itemBackgroundColor) {
                this.setState({
                    itemBackgroundColor: itemBackgroundColor
                });
            }
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
            console.log(newShortcuts);
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
                hiddenLoading: false,
				listTitleFontWeight: listTitleFontWeight,
				listTitleFontSize: listTitleFontSize,
				listItemFontWeight: listItemFontWeight,
				listItemFontSize: listItemFontSize,
            });

            window.document.getElementById("searchField").value = "";
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
        var mainWindow = null;
        for (var i = 0; i < windows.length; i++) {
            mainWindow = windows[i];
            if (mainWindow && mainWindow.getTitle() == "mainWindow") break;
        }

        for (var i = 0; i < windows.length; i++) {
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
            let randomWelcomeText = "Welcome to ShortcutWizard!";

            switch (Math.floor(Math.random() * 8)) {
                case 0:
                    randomWelcomeText = "Did you know ShortcutWizard was created with the dream to help all humans use computers?";
                    break;
                case 1:
                    randomWelcomeText = `Did you know that ShortcutWizard pretends to actually press the keyboard?
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
                    randomWelcomeText = `Did you know that ShortcutWizard will remember where you want it to be?
                    Each program gets its own ShortcutWizard position, color, transparency and size.`;
                    break;
                // case 6:
                //     randomWelcomeText = `Did you know that ShortcutWizard will remember what color and transparency you set for each program?
                //     This way you can make it look exactly the way you want to.`;
                //     break;
                // case 7:
                //     randomWelcomeText = `Did you know that you are helping people in need by becoming a ShortcutWizard member?
                //     Because you contribute with paying for a membership, a person in need will get ShortcutWizard for free.`;
                //     break;
                case 6:
                    randomWelcomeText = `Did you know that ShortcutWizard has its own shortcuts? You can make the window small,
                    hide it completely, or show it like normal. ShortcutWizard remembers how you conifgured each mode, too.`;
                    break;
                case 7:
                    randomWelcomeText = `Did you know that the ShortcutWizard program is actually a local website?
                    That way it will work on as many different computers as possible, so it can help as many as possible.`;
                    break;
                case 8:
                    randomWelcomeText = `Did you know that ShortcutWizard will work for website shortcuts too?
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
                    <h1>ShortcutWizard</h1>
                    <p>{randomWelcomeText}</p>
                </div>
            );
        }

        window.document.documentElement.style.backgroundColor = (this.state.backgroundColor) ?
            this.state.backgroundColor : hexToRgba(beautifulColors[5], 0.5);

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
                        color: this.state.textColor,
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


		var SettingsToggle = (
            <div id="settings-button-group" className="toolbar-actions" style={{
                display: 'none',
            }} onMouseLeave={(e) => {
    			let settingsGroupElement = window.document.getElementById("settings-button-group");
				settingsGroupElement.style.display = "none";
                console.log("set style of settings to none: ", settingsGroupElement.style.display);

    			let titleElement = window.document.getElementById("title");
				titleElement.style.display = "block";
                console.log("set style of title to block: ", titleElement.style.display);
            }}>

                <div className="btn-group">
                    <button id="increase-font-size-button" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    // backgroundColor: 'transparent',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
                        console.log("clicked font size up");
                        this.changeFontUp();
                    }}>
                        <span className="icon icon-plus-circled"></span>
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
                        <span className="icon icon-minus-circled"></span>
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
                        <span className="icon icon-cog"></span>
                    </button>
                    <button id="mini-settings-button" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    // backgroundColor: 'transparent',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
                        console.log("clicked miniSettings");
                        this.toggleMiniSettings();
                    }}>
                        <span className="icon icon-palette"></span>
                    </button>
                    <button id="toggle-bubble-mode" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    backgroundColor: (this.state.windowMode === "bubble") ? '#333' : '#fcfcfc',
    							// flex: 2,
    							// margin: 0,

                    }} onClick={() => {
    					ipcRenderer.send('set-bubble-mode');
                    }}>
                        <span className="icon icon-progress-0"></span>
                    </button>
                    <button id="toggle-full-mode" className="btn btn-default" style={{
    		                    // color: this.state.textColor,
    		                    backgroundColor: (this.state.windowMode === "full") ? '#333' : '#fcfcfc',
    							// flex: 2,
    							// margin: 0,
                    }} onClick={() => {
    					ipcRenderer.send('set-full-view-mode');
                    }}>
                        <span className="icon icon-window"></span>
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
                        <span className="icon icon-publish"></span>
                    </button>
                </div>
            </div>
		);

		var SearchField = (
            <input id="searchField" style={{
				fontSize: 18,
				width: "20%",
				color: this.state.textColor,
				backgroundColor: 'transparent',
				borderColor: 'transparent',
				flex: 2,
			}} type="text"
			placeholder="&#xF002;"
			onChange={this.filterListTrigger}
			onFocus={() => {
				// TODO: Move this down one line so it has the entire width to show search box
				window.document.getElementById("searchField").style.width = "100%";
				window.document.getElementById("searchField").style.flex = 6;
				window.document.getElementById("searchField").style.backgroundColor = "white";
			}} onBlur={() => {
				window.document.getElementById("searchField").style.width = "20%";
				window.document.getElementById("searchField").style.flex = 2;
				window.document.getElementById("searchField").style.backgroundColor = "transparent";
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

		var ShortcutList = (
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

        let displaySettings = null;
		let Title = (
            <h1 id="title" style={{
                color: this.state.textColor,
                marginTop:'2px',
                marginBottom:'2px',
            }} onMouseEnter={(e) => {
    			let settingsGroupElement = window.document.getElementById("settings-button-group");
				settingsGroupElement.style.display = "block";
                console.log("set style of title to block: ", settingsGroupElement.style.display);

    			let titleElement = window.document.getElementById("title");
                titleElement.class = "pull-left";
                displaySettings = "Settings:";
                console.log("set style of title to none: ", titleElement.style.display);
            }} onMouseLeave={(e) => {
    			let titleElement = window.document.getElementById("title");
                titleElement.class = "";
                displaySettings = null;
            }}>{(displaySettings) ? displaySettings : this.state.name}</h1>
		);

		if (this.state.mode == "hidden-mode") {
			// Hidden mode:
            // TODO:
            // 1) listen to some kind of click on the tray
            // 2) Show mini window with 1 random favorite
            // 3) Show search, focused
			return (
				<div>
					{SearchField}
					{SearchResults}
				</div>
			);
		} else if (this.state.mode == "bubble-mode") {
			// Bubble mode:
			return (
				<div>
					{SearchField}
					{ShortcutList}
				</div>
			);
		} else {
			// Full mode:
	        return (
	            <div style={{ textAlign: 'center' }}>
					{Title}{SettingsToggle}
					{SearchField}
					{ShortcutList}
	            </div>
	        );
			// previous sortablelist itemstyle
			//   itemStyle={{backgroundColor: (this.state.itemColor) ? this.state.itemColor : '#FFFFFF'}}
		}
    }
}
