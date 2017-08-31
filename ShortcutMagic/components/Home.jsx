'use babel';
import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactTooltip from 'react-tooltip'
import ReactDOM from 'react-dom';


let globalState;
// From http://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
let beautifulColors = ["#2c7bb6",  "#00a6ca", "#00ccbc", "#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"];

let tooltipEffect = {
    place: "bottom",
    type: "light",
    effect: "solid",
};

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
            backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
            textAlign: 'center',
        }}>{listItem.name}</p>
    );

    let bottomSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 2,
            fontWeight: globalState.listItemFontWeight,
        }}>
            {(globalState.focused && componentArguments.index < 5) ? (
                <p style={{
                    // color: globalState.textColor,
                    flex: 1,
                    paddingLeft: "5px",
                    paddingRight: "5px",
                    paddingBottom: "5px",
                    // borderRadius: ".25rem",
                    // borderWidth: ".50rem",
                    // border: `2px solid #ddd`,
                    // backgroundColor: '#1e2430',
                    backgroundColor: "transparent", color: "#eedba5", 
                    textAlign: 'left',
                    fontSize: globalState.listTitleFontSize,
                }}>⌘ {componentArguments.index + 1}</p>
            ) : ""}

            <p style={{
                flex: 2,
                marginRight: '5px',
                marginLeft: '5px',
                // color: globalState.textColor,
                // borderRadius: ".25rem",
                // borderWidth: ".50rem",
                // border: `2px solid #ddd`,
                backgroundColor: "transparent", color: "#eedba5", 
                textAlign: 'left',
                fontSize: globalState.listTitleFontSize,
            }}>
                {
                    // Always show ⌘ if there are no mods or glyphs
                    (listItem["mod"]) ? listItem["mod"] :
                        (listItem["glyph"] && !listItem["char"]) ? "⌘" :
                            (!listItem["glyph"] && listItem["char"]) ? "⌘" : ""
                }
                {
                    (listItem["glyph"]) ? ( listItem["glyph"] ) : ""
                }

                {
                    (listItem["char"]) ? ( listItem["char"]): ""
                }
            </p>

            {(globalState.showMenuNames) ? (
                <p style={{
                    flex: 2,
                    marginRight: '5px',
                    marginLeft: '5px',
                    // color: globalState.textColor,
                    // borderRadius: ".25rem",
                    // borderWidth: ".50rem",
                    // border: `2px solid #ddd`,
                    // backgroundColor: '#1e2430',
                    backgroundColor: "transparent", color: "#eedba5", 
                    textAlign: 'center',
                }}>{listItem.menuName}</p>
            ) : ""}
        </div>
    );

                // <li><span classname="fa fa-film" style={{
                //     backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, border: '2px solid rgb(37, 50, 70)', boxshadow: 'rgb(73, 91, 113) 0px 1px 0px inset',
                //     // color: this.state.textcolor,
                //     // backgroundcolor: 'transparent',
                //     // flex: 2,
                //     // margin: 0,
                //     // flex: 4,
                // }} onclick={() => {
                //     console.log("clicked execute-list-item with ", listitem);
                //     ipcrenderer.send('execute-list-item', listitem);
                // }}>
                // </span></li>


    let mouseOverButtonsSection = (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            marginBottom: '2px',
            // marginTop: '2px',
            justifyContent: 'flex-end',
            alignContent: 'stretch',
            textAlign: 'center',
            height: '100%',
            backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
        }}>

            <ul name={`buttonSection-${componentArguments.index}`} className="wrapper-2" style={{
                display: 'none',
                flex: 4,
                textAlign: 'right',
            }}>

                <div data-for='upvote-tooltip' data-iscapture="true" data-tip="Vote upwards, see it more">
                    <span style={{
                        color: listItem.score > -1 ? 'green' : 'red',
                        fontWeight: 800,
                        // backgroundColor: 'transparent',
                        flex: 1,
                        margin: '4px',
                        padding: '4px',
                        // flex: 4,
                    }}>{listItem.score ? listItem.score : 0}</span>

                </div>

                <li onClick={() => {
                    console.log("clicked execute-list-item with ", listItem);
                    ipcRenderer.send('execute-list-item', listItem);
                }} data-for='execute-tooltip'
                data-iscapture="true"
                data-tip="Run this shortcut">

                    <span className="fa fa-1x fa-play" style={{
                        // color: this.state.textColor,
                        // backgroundColor: 'transparent',
                        // flex: 2,
                        // margin: 0,
                        // flex: 4,
                    }}></span>

                </li>

                <li onClick={() => {
                    listItem.score = listItem.score ? listItem.score + 1 : 1;
                    console.log("clicked upvote-list-item with ", listItem);
                    ipcRenderer.send('update-shortcut-item', listItem);
                }} data-for='upvote-tooltip'
                data-iscapture="true"
                data-tip="Vote upwards, see it more">

                    <span className="fa fa-1x fa-long-arrow-up" style={{
                        color: 'green',
                        // backgroundColor: 'transparent',
                        // flex: 2,
                        // margin: 0,
                        // flex: 4,
                    }}></span>

                </li>


                <li onClick={() => {
                    listItem.score = listItem.score ? listItem.score - 1 : -1;
                    console.log("clicked downvote-list-item with ", listItem);
                    ipcRenderer.send('update-shortcut-item', listItem);
                }} data-for='downvote-tooltip'
                data-iscapture="true"
                data-tip="Vote downwards, see it less">

                    <span className="fa fa-1x fa-long-arrow-down" style={{
                        color: 'red',
                        // backgroundColor: 'transparent',
                        // flex: 2,
                        // margin: 0,
                        // flex: 4,
                    }}></span>

                </li>

            </ul>
        </div>
    );

    // TODO: add in gifs again: 
                // <button className="btn" 
                // onMouseEnter={(e) => {
                //     console.log(`sending show-tooltip-for-list-item with ${componentArguments.listItem}`);
                //     ipcRenderer.send('show-tooltip-for-list-item', componentArguments.listItem);
                // }} onMouseLeave={(e) => {
                //     console.log(`sending hide-tooltip with ${componentArguments.listItem}`);
                //     ipcRenderer.send('hide-tooltip');
                // }} onClick={() => {
                //     console.log(`sending hide-tooltip with ${componentArguments.listItem}`);
                //     ipcRenderer.send('hide-tooltip');
                //     ipcRenderer.send('record-gif', listItem);
                // }}>
                //     <span className="fa fa-2x fa-film" style={{ }}></span>
                //     <br />
                //     GIF
                // </button>

    // todo add these:
    // - general list item size

    return (
        <td style={{
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            // borderLeft: `2px solid #1e2430`,
            // borderRight: `2px solid #1e2430`,
            // borderTop: `2px solid #1e2430`,
            // borderBottom: `2px solid #ddd`,
            backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
            border: '4px solid rgb(37, 50, 70)', boxShadow: '#222 0px 0px 20px 0px',
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

					if (buttonSectionElements[i].name === "enabled-favorite-button" || 
                        buttonSectionElements[i].name === "enabled-hidden-button") {
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
					if (buttonSectionElements[i].name != "enabled-favorite-button" && 
                        buttonSectionElements[i].name != "enabled-hidden-button") {
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
                display: 'flex',
                flexDirection: 'column',
                // borderRadius: ".25rem",
                // borderWidth: ".50rem",
                // border: `2px solid #1e2430`,
                backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
            }}>
                {topSection}{mouseOverButtonsSection}
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
            {items.map((value, index) => {
                return (
                    <SortableItem
                        key={`item-${index}`}
                        index={index}
                        listItem={value}
                        contentWindow={componentArguments.contentWindow}
                    />
                );
            })}
        </div>
    );
});

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

        ipcRenderer.on('focus-search-field', this.focusSearchField);

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

        ipcRenderer.on('set-current-program-name', (event, currentProgramName) => {
          this.setState({
            currentProgramName
          });
        });

        ipcRenderer.on('set-programs', (event, shortcuts) => {
          let shortcutDict = {};
          shortcuts.forEach(s => shortcutDict[s.name] = s);
          this.setState({
            shortcuts: shortcutDict, 
            currentProgramName: shortcuts[0].name,
          });

         //    console.log(newShortcuts);
            // let name = newShortcuts.name;
            // let compare = name.toLowerCase();

        	// if (compare === "electron" ||
         //        compare === "shortcutmagic" ||
         //        compare === "shortcutmagic-mac" ||
         //        compare === "screensaverengine" ||
         //        compare === "loginwindow" ||
         //        compare === "dock" ||
         //        compare === "google software update..." ||
         //        compare === "google software update" ||
         //        compare === "dropbox finder integration" ||
         //        compare === "kap" ||
         //        compare === "securityagent" ||
         //        compare === "airplayuiagent" || 
         //        compare === "evernote helper" ||
         //        compare === "coreservicesuiagent") {
         //        return; // TODO: Could this mess with other electron starter projects?
         //    }

            // let loadingList = null;

            // // Clear out after a few minutes for simplicity
            // setTimeout(() => {
            //     if (loadingList && loadingList.indexOf(name)) {
            //         this.setState({
            //             loading: null,
            //             hiddenLoading: true,
            //         });
            //     }
            // }, 100000);

      // if (this.state && this.state.loading) {
          // loadingList = this.state.loading;
          // let loadingIndex = loadingList.indexOf(name);
          // if (loadingIndex < 0) return; // Stop any new rendering if we are not about to show shortcuts for an app that is loading

          // loadingList.splice(loadingIndex, 1);
          // if (loadingList.length == 0) {
          //     loadingList = null;
          // }
      // } else {
      //     ipcRenderer.send('not-loading');
      // }

			// let listTitleFontWeight = (newShortcuts.listTitleFontWeight) ? newShortcuts.listTitleFontWeight : 400;
			// let listTitleFontSize = (newShortcuts.listTitleFontSize) ? newShortcuts.listTitleFontSize : 16;
			// let listItemFontWeight = (newShortcuts.listItemFontWeight) ? newShortcuts.listItemFontWeight : 200;
			// let listItemFontSize = (newShortcuts.listItemFontSize) ? newShortcuts.listItemFontSize : 14;

    });

    // ipcRenderer.on('set-loading', (event, loading) => {
    //     var alreadyLoading = (this.state) ? this.state.loading : null;
    //     if (!alreadyLoading) alreadyLoading = [];

    //     alreadyLoading.push(loading);
    //     this.setState({
    //         loading: alreadyLoading,
    //         hiddenLoading: false,
    //     });
    // });

    // // Sync function
    // ipcRenderer.on('get-loading', (event) => {
    //     event.returnValue = (this.state && this.state.loading) ? this.state.loading : undefined;
    // });

    ipcRenderer.on('no-shortcuts-visual-notification', (event) => {
        console.log("TODO: Show that the list item execution might not work");
    });

    ipcRenderer.on('force-to-top', (event, shortcut) => {
        this.focusSearchField(null, shortcut.name);
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

        ipcRenderer.send('set-programs-async');
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
    let windows = remote.BrowserWindow.getAllWindows();
    for (let i = 0; i < windows.length; i++) {
      let settingsWindow = windows[i];
      if (settingsWindow) {
        if (settingsWindow.getTitle() == "settingsWindow") {
          if (settingsWindow.isVisible()) {
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
        let windows = remote.BrowserWindow.getAllWindows();
        let mainWindow = null;
        for (let i = 0; i < windows.length; i++) {
            mainWindow = windows[i];
            if (mainWindow && mainWindow.getTitle() == "ShortcutMagic") break;
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
    }

    filterListTrigger(event) {
        this.filterList((event) ? event.target.value : "");
    }
    filterAllListTrigger(event) {
        this.filterAllList((event) ? event.target.value : "");
    }

    filterSpecificList(targetValue, specificList) {
      if (targetValue) {
        updatedList = this.state.shortcuts[specificList].filter((shortcuts) => {

          const innerValues = Object.keys(program).map(key => item[key]);

          for (var i = 0; i < innerValues.length; i++) {
            let innerVal = innerValues[i];

            if (typeof innerVal === 'string' && innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;

            if (innerVal == targetValue) return true;
          }
        });
      }

      this.setState({items: updatedList});
    }

    filterList(targetValue) {
      if (targetValue) {
        updatedList = this.state.shortcuts.filter((program) => {

          const innerValues = Object.keys(program.shortcuts).map(key => item[key]);

          for (var i = 0; i < innerValues.length; i++) {
            let innerVal = innerValues[i];

            if (typeof innerVal === 'string' && innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;

            if (innerVal == targetValue) return true;
          }
        });
      }

      this.setState({items: updatedList});
    }

    filterAllListKeyDown(e) {
        if (e.keyCode === 27) { // key code 27 == escape
            // Clear search field and trigger list filter on empty search filter
            window.document.getElementById("search-field-all").value = '';
            this.filterSpecificList();
        }
    }

    filterListKeyDown(e) {
        if (e.keyCode === 27) { // key code 27 == escape

            // Clear search field and trigger list filter on empty search filter
            window.document.getElementById("search-field").value = '';
            this.filterSpecificList();

            // Reset looks of title/search area
            // TODO: DRY this up in a function
            window.document.getElementById("title").style.display = "block";
            window.document.getElementById("settings-button-group").style.display = "none";
            window.document.getElementById("search-field").style.display = "none";
        }
    }

    focusSearchField(event, searchValue) {
        window.document.getElementById("title").style.display = "none";
        window.document.getElementById("settings-button-group").style.display = "block";
        window.document.getElementById("search-field").style.display = "";

        if (searchValue && typeof searchValue === "string") {
            window.document.getElementById("search-field").value = searchValue;
            this.filterList(searchValue);
        }

        window.document.getElementById("search-field").focus();

        this.setState({
            menuActive: true
        });
    }

    render() {
                // <span className="nav-group-item" onClick={(e) => {
                //   ipcRenderer.send('main-parse-shortcuts');
                // }}>
                //   <span className="icon icon-download"></span>
                //   Re-parse shortcuts
                // </span>


      globalState = this.state;

      let shortcutTableBody;
      let programTitles;

      if (!this.state || !this.state.shortcuts || !this.state.currentProgramName) {
        shortcutTableBody = (
          <tbody style={{
            textAlign: 'center',
            fontSize: 18,
            fontWeight: 600,
          }}>
            <tr className="file_arq">
              <td>
                Click a program to the left to see its shortcuts.
              </td>
            </tr>
          </tbody>
        );
      } else {
        let programs = this.state.shortcuts;
        let sortedShortcuts = Object.values(programs[this.state.currentProgramName].shortcuts);

        if (!sortedShortcuts || !sortedShortcuts.sort) {
          console.log('cant sort sortedShortcuts');
          console.log(sortedShortcuts);
          console.log(sortedShortcuts.sort);
        }

        sortedShortcuts.sort((a, b) => {
          console.log('sorting a b', a.score, b.score);
          if (!a.score) a.score = 0;
          if (!b.score) b.score = 0;

          if (a.score > b.score) return  -1;
          if (a.score < b.score) return  1;
          if (a.score === b.score) return  0;

          return 0;
        });

        shortcutTableBody = (
          <tbody>
            {sortedShortcuts.map((value) => {
              return (
                <tr className="file_arq" key={value.name + value.menuName}>
                  <td className="btn btn-mini" onClick={(e) => {
                    console.log("clicked execute-list-item with ", value);
                    ipcRenderer.send('execute-list-item', value);
                  }}>Run</td>
                  <td>{value.name}</td>
                  <td>
                    {
                      // Always show ⌘ if there are no mods or glyphs
                      (value["mod"]) ? value["mod"] :
                        (value["glyph"] && !value["char"]) ? "⌘" :
                          (!value["glyph"] && value["char"]) ? "⌘" : ""
                    }
                    {
                      (value["glyph"]) ? ( value["glyph"] ) : ""
                    }
                    {
                      (value["char"]) ? ( value["char"]): ""
                    }
                  </td>
                  <td>{value.menuName}</td>
                  <td><span className="icon icon-up-open-big" onClick={e => {
                    value.score = value.score ? value.score + 1 : 1;
                    console.log("clicked upvote-list-item with ", value);
                    ipcRenderer.send('update-shortcut-item', value);
                  }}></span>   <span className="icon icon-down-open-big" onClick={e => {
                    value.score = value.score ? value.score - 1 : -1;
                    console.log("clicked upvote-list-item with ", value);
                    ipcRenderer.send('update-shortcut-item', value);
                  }}></span>   {value.score}</td>
                </tr>
              );
            })}
          </tbody>
        );

        programTitles = (
          <nav className="nav-group">
            <h5 className="nav-group-title">Programs <input id="search-field" style={{
              borderRadius: ".25rem",
              borderWidth: ".25rem",
              border: `1px solid #1a82fb`, // rgba(26, 130, 251, 1.0) is the color from Photon mac css
              // backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`,
            }} type="search" placeholder=" Search" onChange={this.filterListTrigger} onKeyDown={this.filterListKeyDown}/></h5>

            {Object.keys(programs).map(name => {
              const navGroupClass = "nav-group-item" + (name == this.state.currentProgramName ? " active" : "");

              return (
                <span className={navGroupClass} key={name} onClick={(e) => {
                  this.setState({
                    currentProgramName: name,
                  });
                }}>
                  <span className="icon icon-window"></span>
                  {name}
                </span>
              );
            })}
          </nav>
        );
      }

      return (
        <div className="pane-group">
          <div className="pane pane-sm sidebar">
            {programTitles ? programTitles : "Loading..."}
          </div>

          <div className="pane">
            <input id="search-field-all" style={{
              borderRadius: ".25rem",
              borderWidth: ".25rem",
              border: `1px solid #1a82fb`, // rgba(26, 130, 251, 1.0) is the color from Photon mac css
              // backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`,
            }} type="search" placeholder=" Search" onChange={this.filterAlListTrigger} onKeyDown={this.filterAllListKeyDown}/>
            <table className="table-striped">
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Name</th>
                  <th>Shortcut</th>
                  <th>Menu</th>
                  <th>Rating</th>
                </tr>
              </thead>
              {shortcutTableBody}
            </table>
          </div>
        </div>
      );
    }

//     render() {
//         globalState = this.state;
//         console.log('render() called', JSON.stringify(globalState));

//         if (!this.state || this.state.loading) {
//             console.log('rendering transparent window');
//             return <div style={{ backgroundColor: "transparent", }}> </div>
//         } else {
//             ipcRenderer.send("not-loading");
//         }


//         let shortcuts = this.state.items;
//         if (!this.previousShortcuts || this.previousShortcuts != shortcuts) {
//             shortcuts.sort((a, b) => {
//               console.log('sorting a b', a.score, b.score);
//               if (!a.score) a.score = 0;
//               if (!b.score) b.score = 0;

//               if (a.score > b.score) return  -1;
//               if (a.score < b.score) return  1;
//               if (a.score === b.score) return  0;

//               return 0;
//             });

//             this.previousShortcuts = shortcuts;
//         }

// 		let ShortcutList = (
//             <div className="filter-list" style={{WebkitAppRegion: 'no-drag'}}>
//                 <div style={{textAlign: 'left'}}>
//                     <SortableList
//                         items={shortcuts}
//                         onSortEnd={this.onSortEnd}
//                         useDragHandle={true}
//                         lockAxis='y'
//                     />
//                 </div>
//             </div>
// 		);

// // TODO: Re-enable gif community: 
//                     // <li onClick={() => {
//                     //     console.log(`opening community window `);
//                     //     ipcRenderer.send('toggle-gif-community');
//                     // }}><span className="fa fa-2x fa-film" data-for='gifcommunity-tooltip'
//                     // data-iscapture="true"
//                     // data-tip="Open community window <br /> with gif overview">

//                     //     <ReactTooltip id='gifcommunity-tooltip'
//                     //         place='right'
//                     //         type={tooltipEffect.type}
//                     //         effect={tooltipEffect.effect}
//                     //         multiline={true}/>

//                     // </span></li>

// // TODO: Re-enable settings:
//                     // <li onClick={(event) => {
//                     //     event.preventDefault();
//                     //     console.log("clicked settings");
//                     //     this.toggleSettings();
//                     // }} data-for='toggle-settings-tooltip'
//                     // data-iscapture="true"
//                     // data-tip="Settings">
//                     // <span id="settings-button" className="fa fa-2x fa-cog">
//                     // </span>
//                     //     <ReactTooltip id='toggle-settings-tooltip'
//                     //         place={tooltipEffect.place}
//                     //         type={tooltipEffect.type}
//                     //         effect={tooltipEffect.effect}
//                     //         multiline={true}/>
//                     // </li>


//         let SettingsButtons = (
//             <div id="settings-button-group" className="toolbar-actions" style={{
//                 display: 'none',
//                 backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//             }}>

//                 <ul className="wrapper-1" style={{
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignContent: 'center',
//                     textAlign: 'center',
//                 }}>
//                     <li onClick={(event) => {
//                         ipcRenderer.send('open-learn');
//                     }} 
//                     data-for='learn-tooltip'
//                     data-iscapture="true"
//                     data-tip="Learn more about ShortcutMagic">
//                     <span id="learn-button" className="fa fa-2x fa-question">
//                     </span>
//                         <ReactTooltip id='learn-tooltip'
//                             place={tooltipEffect.place}
//                             type={tooltipEffect.type}
//                             effect={tooltipEffect.effect}
//                             multiline={true}/>
//                     </li>

//                     <li onClick={(event) => {
//                         event.preventDefault();
//                         console.log("clicked font size up");
//                         this.changeFontUp();
//                     }} 
//                     data-for='increase-font-size-tooltip'
//                     data-iscapture="true"
//                     data-tip="Increase font size">
//                     <span id="increase-font-size-button" className="fa fa-2x fa-plus">
//                     </span>
//                         <ReactTooltip id='increase-font-size-tooltip'
//                             place={tooltipEffect.place}
//                             type={tooltipEffect.type}
//                             effect={tooltipEffect.effect}
//                             multiline={true}/>
//                     </li>

//                     <li onClick={(event) => {
//                         event.preventDefault();
//                         console.log("clicked font size down");
//                         this.changeFontDown();
//                     }}
//                     data-for='decrease-font-size-tooltip'
//                     data-iscapture="true"
//                     data-tip="Smaller text">
//                     <span id="decrease-font-size-button" className="fa fa-2x fa-minus">
//                     </span>

//                         <ReactTooltip id='decrease-font-size-tooltip'
//                             place={tooltipEffect.place}
//                             type={tooltipEffect.type}
//                             effect={tooltipEffect.effect}
//                             multiline={true}/>

//                     </li>

//                 </ul>
//             </div>
//         );

//         // TODO: Add colors back in at some point: 
//        //          <button id="mini-settings-button" className="btn btn-default" style={{
//              //                // color: this.state.textColor,
//              //                // backgroundColor: 'transparent',
//                             // // flex: 2,
//                             // // margin: 0,
//        //          }} onClick={() => {
//        //              console.log("clicked miniSettings");
//        //              this.toggleMiniSettings();
//        //          }}>
//        //              <ReactTooltip id='toggle-mini-settings-tooltip'
//        //                  place={tooltipEffect.place}
//        //                  type={tooltipEffect.type}
//        //                  effect={tooltipEffect.effect}
//        //                  multiline={true}/>

//        //              <span data-for='toggle-mini-settings-tooltip'
//        //                  data-iscapture="true"
//        //                  data-tip={`Colors and themes.
//        //                      <br />This is where you can customize ShortcutMagic
//        //                      <br />to look exactly like you want.`} className="icon icon-palette">
//        //              </span>
//        //          </button>






//         let Title = (
//             <h2 id="title" style={{
//                 // color: this.state.textColor,
//                 marginTop:'2px',
//                 marginBottom:'2px',
//                 flex: 9,
//                 justifyContent: 'center',
//                 alignContent: 'stretch',
//                 textDecoration: 'underline',
//             }}>{(displaySettings) ? displaySettings : this.state.name}</h2>
//         );

//         let displaySettings = null;
//         let hidingSlowly = false;
//             // }} onMouseEnter={(e) => {
            //     hidingSlowly = true;
            //     window.document.getElementById("settings-button-group").style.display = "block";
            //     window.document.getElementById("search-field").style.display = "";

            //     ipcRenderer.send('show-window');
            //     window.document.getElementById("search-field").focus();
            // }} onMouseLeave={(e) => {
            //     if (hidingSlowly) {
            //         hidingSlowly = false;
            //         setTimeout(() => {
            //             if (!hidingSlowly) {
            //                 window.document.getElementById("settings-button-group").style.display = "none";
            //                 window.document.getElementById("search-field").style.display = "none";
            //             }
            //         }, 400);
            //     } else {
            //         window.document.getElementById("settings-button-group").style.display = "none";
            //         window.document.getElementById("search-field").style.display = "none";
            //     }

//         let ToggleSettings = (
//             <div className= {(this.state.menuActive) ? "hamburger is-active" : "hamburger"} id="hamburger-5" style={{
//                 flex: 1,
//                 marginTop: '5px',
//                 marginBottom: '5px',
//                 width: '100%',
//             }} onClick={() => {
//                 let menu = window.document.getElementById("hamburger-5");
//                 let isActive = !(menu && menu.className.indexOf("is-active") > -1);

//                 if (isActive) {
//                     window.document.getElementById("settings-button-group").style.display = "block";
//                     window.document.getElementById("search-field").style.display = "";
//                     window.document.getElementById("title").style.display = (this.state.mode === "full-mode") ? "block" : "none";

//                     window.document.getElementById("search-field").focus();

//                     this.setState({
//                         menuActive: isActive
//                     });
//                 }
//             }}>
//                 <span className="line"></span>
//                 <span className="line"></span>
//                 <span className="line"></span>
//             </div>
//         );

// 		let TitleAndSettings = (
//             <div id="title-and-settings" style={{
//                 textAlign: 'center',
//                 backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//             }}>
//                 <div style={{
//                     display: 'flex',
//                     flexDirection: 'row',
//                 }}  onClick={() => {
//                     let menu = window.document.getElementById("hamburger-5");
//                     let isActive = !(menu && menu.className.indexOf("is-active") > -1);

//                     if (!isActive) {
//                         window.document.getElementById("settings-button-group").style.display = "none";
//                         window.document.getElementById("search-field").style.display = "none";
//                         console.log('about to set tile with values ', this.state);
//                         window.document.getElementById("title").style.display = (this.state.mode !== "full-mode") ? "block" : "none";

//                         this.setState({
//                             menuActive: isActive
//                         });
//                     }
//                 }}>
//                     {Title}
//                     {ToggleSettings}
//                 </div>
//                 {SettingsButtons}
//                 {SearchField}
//             </div>
// 		);

// 		let HiddenSettings = (
//             <div id="hidden-settings"
//             style={{
//                 height: '20px',
//                 width: '100%',
//                 textAlign: 'center',
//                 backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//             }} onMouseEnter={(e) => {
//                 hidingSlowly = true;
//     			window.document.getElementById("settings-button-group").style.display = "block";
//     			window.document.getElementById("search-field").style.display = "";
//     			window.document.getElementById("hidden-settings").style.height = '60px';

//                 ipcRenderer.send('show-window');
//     			window.document.getElementById("search-field").focus();
//             }} onMouseLeave={(e) => {
//                 if (hidingSlowly) {
//                     hidingSlowly = false;
//                     setTimeout(() => {
//                         if (!hidingSlowly) {
//                 			window.document.getElementById("settings-button-group").style.display = "none";
//                 			window.document.getElementById("search-field").style.display = "none";
//                             window.document.getElementById("hidden-settings").style.height = '20px';
//                         }
//                     }, 400);
//                 } else {
//         			window.document.getElementById("settings-button-group").style.display = "none";
//         			window.document.getElementById("search-field").style.display = "none";
//                     window.document.getElementById("hidden-settings").style.height = '20px';
//                 }
//             }}>
//                 {SearchField}{SettingsButtons}
//             </div>
// 		);


// 		if (this.state.mode == "hidden-mode") {
// 			// Hidden mode:
//             // TODO:
//             // 1) listen to some kind of click on the tray
//             // 2) Show mini window with 1 random favorite
//             // 3) Show search, focused

// 			return (
//                 <div className="window">

//                   <div className="window-content" style={{
//                         backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//                     }}>
//                       <div className="pane">
//                         <table className="table-striped">
//                           <tbody>
//                             <tr className="file_arq">
//                                 <td style={{
//                                     backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//                                 }}>
//                                     {SearchField}
//                                 </td>
//                             </tr>
//                             <tr className="file_arq">
//                               {ShortcutList}
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
            
// 			);
// 		} else if (this.state.mode == "bubble-mode") {
// 			// Bubble mode:
// 			return (
//                 <div className="window">

//                   <div className="window-content" style={{
//                         backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//                     }}>
//                       <div className="pane">
//                         <table className="table-striped">
//                           <tbody>
//                             <tr className="file_arq">
//                                 <td style={{
//                                     backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//                                 }}>
//                                     {HiddenSettings}
//                                 </td>
//                             </tr>
//                             <tr className="file_arq">
//                               {ShortcutList}
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
// 			);
// 		} else {
//             // Full mode:
//             return (
//                 <div className="window">

//                   <div className="window-content" style={{
//                         backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//                     }}>
//                       <div className="pane">
//                         <table className="table-striped">
//                           <tbody>
//                             <tr className="file_arq">
//                                 <td style={{
//                                     backgroundColor: `rgba(50, 63, 83, 1)`, color: `rgba(238, 219, 165, 1)`, 
//                                 }}>{TitleAndSettings}</td>
//                             </tr>
//                             <tr className="file_arq" style={{
//                                 border: '4px solid rgb(37, 50, 70)', boxShadow: 'rgb(73, 91, 113) 0px 2px 0px inset',
//                             }}>
//                               {ShortcutList}
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//             );
// 			// previous sortablelist itemstyle
// 			//   itemStyle={{backgroundColor: (this.state.itemColor) ? this.state.itemColor : '#FFFFFF'}}
// 		}
//     }
}

window.onload = function() {
    ReactDOM.render(<Home />, document.getElementById("app"));
}