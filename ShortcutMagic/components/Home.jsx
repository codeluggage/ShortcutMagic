'use babel';

import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactTooltip from 'react-tooltip'
import ReactDOM from 'react-dom';

const GLOBAL_SETTINGS_KEY = "all programs";


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


export default class Home extends Component {
  componentWillMount() {
    this.onSortEnd = this.onSortEnd.bind(this);
    this.updateItems = this.updateItems.bind(this);
    this.filterListTrigger = this.filterListTrigger.bind(this);
    this.filterList = this.filterList.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.toggleMiniSettings = this.toggleMiniSettings.bind(this);
    this.changeFontUp = this.changeFontUp.bind(this);
    this.changeFontDown = this.changeFontDown.bind(this);
    this.filterListKeyDown = this.filterListKeyDown.bind(this);
    this.focusSearchField = this.focusSearchField.bind(this);
    this.toggleTimeout = this.toggleTimeout.bind(this);

    ipcRenderer.on('focus-search-field', this.focusSearchField);
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
    ipcRenderer.on('set-current-program-name', (event, currentProgramName) => {
      window.document.getElementById("search-field").value = "";
      this.updateItems(currentProgramName);
    });
    ipcRenderer.on('set-programs', (event, programs, currentProgramName) => {
      console.log('set-programs: ', programs, currentProgramName);
      let programDict = {};
      programs.forEach(s => programDict[s.name] = s);
      this.updateItems(currentProgramName, programDict);
    });
    ipcRenderer.on('no-shortcuts-visual-notification', (event) => {
      console.log("TODO: Show that the list item execution might not work");
    });
    ipcRenderer.on('force-to-top', (event, shortcut) => {
      this.focusSearchField(null, shortcut.name);
    });
    ipcRenderer.on('permission-failure', (event) => {
      this.setState({
        error: (
          <div style={{
            textAlign: 'center',
          }}>
            <h2>Permission error.
            <br />
            Please quit ShortcutMagic and 
            <br />
            start again and approve permissions.</h2>
            <br />
            <img src="../assets/admin-access.png" height="236" width="380"></img>
            <br />
            <button className="btn btn-negative" onClick={() => ipcRenderer.send('quit')}>Quit ShortcutMagic</button>
          </div>
        )
      });
    });

    // ipcRenderer.send('set-programs-async');
  }

  updateItems(currentProgramName, programs) {
    console.log(programs);

    if (!currentProgramName || currentProgramName == "") {
      if (!this.state || !this.state.currentProgramName) {
        return;
      }

      currentProgramName = this.state.currentProgramName;
    }

    let newState = {
      currentProgramName,
      settingsPaneActive: false,
    };

    if (programs) {
      newState.programs = programs;
      newState.settings = programs[GLOBAL_SETTINGS_KEY];
    }

    let program = programs ? programs[currentProgramName] : null;

    if (!program) {
      if (this.state && this.state.programs) {
        program = this.state.programs[currentProgramName];
        if (program) {
          let items = Object.values(program.shortcuts);
          items.sort((a, b) => {
            if (a.score > 0 && !b.score) return 1;
            if (b.score > 0 && !a.score) return -1;

            return `${b.score ? b.score : b.name}`.localeCompare(`${a.score ? a.score : a.name}`);
          });

          newState.items = items;
        }
      }
    }

    this.setState(newState);
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

  filterList(targetValue) {
    let items = Object.values(this.state.programs[this.state.currentProgramName].shortcuts);
    if (targetValue && targetValue.length) {
      targetValue.toLowerCase();
      let filteredItems = items.filter((shortcut) => {
          if (shortcut.menuName.toLowerCase().indexOf(targetValue) !== -1) return true;
          if (shortcut.name.toLowerCase().indexOf(targetValue) !== -1) return true;
          if (shortcut.glyph && shortcut.glyph.toLowerCase().indexOf(targetValue) !== -1) return true;
          if (shortcut.mod && shortcut.mod.toLowerCase().indexOf(targetValue) !== -1) return true;
          if (shortcut.char && shortcut.char.toLowerCase().indexOf(targetValue) !== -1) return true;
      });

      this.setState({
        items: filteredItems,
      });
    } else {
      this.setState({
        items: items,
      });
    }
  }

  filterListKeyDown(e) {
    if (e.keyCode === 27) { // key code 27 == escape
      // Clear search field and trigger list filter on empty search filter
      window.document.getElementById("search-field").value = '';
    }

    const searchField = document.getElementById("search-field");
    this.filterList(searchField && searchField.value ? searchField.value : '');
  }

  focusSearchField(event, searchValue) {
    window.document.getElementById("search-field").focus();

    if (searchValue && typeof searchValue === "string") {
      window.document.getElementById("search-field").value = searchValue;
      this.filterList(searchValue);
    }
  }

  toggleTimeout(activate) {
    this.setState({
      timeoutRepeat: (activate) ? window.document.getElementById('timeoutRepeatMinutes').value : undefined
    });
    ipcRenderer.send('set-timeout-repeat', this.state.timeoutRepeat);
  }

  render() {
    console.log('inside render');
    if (this.state && this.state.programs) {
      console.log('pomodone: ', this.state.programs["System Preferences"]);
    } else {
      console.log('no state or programs available');
    }

    let shortcutTableBody;
    let programTitles;

    if (this.state && this.state.error) {
      shortcutTableBody = this.state.error;
    } else if (this.state && this.state.currentProgramName && this.state.items) {
      shortcutTableBody = (
        <tbody>
          {this.state.items.map((value) => {
            return (
              <tr className="file_arq" key={value.name + value.menuName}>

                <td style={{
                }}>
                  <button className="btn" style={{
                    padding: '2px 4px',
                  }} onClick={(e) => {
                    console.log("clicked execute-list-item with ", value);
                    ipcRenderer.send('execute-list-item', value, this.state.currentProgramName);
                  }}>
                    {value.name}
                  </button> 
                </td>
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
                <td onClick={e => {



                  value.score = value.score ? value.score + 1 : 1;
                  console.log("clicked upvote-list-item with ", value);

                  ipcRenderer.send('update-shortcut-item', value);
                  let newItems = this.state.items.map(item => item.name === value.name ? value : item);

                  this.setState({
                    items: newItems,
                  });

                }}><span className="icon icon-up-open-big"></span></td>
                <td onClick={e => {


                  value.score = value.score ? value.score - 1 : -1;
                  console.log("clicked upvote-list-item with ", value);
                  
                  ipcRenderer.send('update-shortcut-item', value);
                  let newItems = this.state.items.map(item => item.name === value.name ? value : item);

                  this.setState({
                    items: newItems,
                  });

                }}><span className="icon icon-down-open-big"></span></td>
                <td>{value.score ? value.score : 0}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    if (this.state && this.state.programs) {
      const titles = Object.keys(this.state.programs).map(name => {
        if (name === GLOBAL_SETTINGS_KEY) {
          return;
        }

        let navGroupClass = "nav-group-item"; 
        if (this.state.items && name === this.state.currentProgramName) {
          navGroupClass +=  " active";
        }

        let formattedName = name;
        let query = window.document.getElementById("search-field").value;
        if (query && query.length && formattedName.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
          formattedName = <u><b>{name}</b></u>;
        }

        return (
          <span className={navGroupClass} key={name} onClick={(e) => {
            this.updateItems(name);
          }}>
            <span className="icon icon-window"></span>
            {formattedName}
          </span>
        );
      });

      titles.sort((a, b) => {
        if (a.key > b.key) return 1;
        if (a.key < b.key) return -1;
        return 0;
      });

      programTitles = (
        <nav className="nav-group">  
          <h5 className="nav-group-title">Programs</h5>

          {titles}
        </nav>
      );
    }


    const iconComponent = (
        <div style={{
            position: 'relative',
        }}>
            <img src="../assets/wizard.png" style={{
                right: '2px',
                top: '24px',
                height: '20px',
                transform: 'rotate(25deg)',
                transformOrigin: '0% %0',
                position: 'absolute',
            }}></img>
        </div>
    );

    const settingsComponent = !this.state || !this.state.settingsPaneActive ? undefined : (
      <div>
        <ReactTooltip id='neverShowTooltip'
          place='bottom'
          type={tooltipEffect.type}
          effect={tooltipEffect.effect}
          multiline={true}/>

        <ReactTooltip id='timeoutRepeatTooltip'
          place='bottom'
          type={tooltipEffect.type}
          effect={tooltipEffect.effect}
          multiline={true}/>

        <ReactTooltip id='appSwitchTooltip'
          place='bottom'
          type={tooltipEffect.type}
          effect={tooltipEffect.effect}
          multiline={true}/>

        <h3>Continually Learn With Suggestions</h3>
        <br />
        <i>Suggestions look like this:</i>
        <br />
        <br />
        <img src="../assets/bubble-window.png" style={{
          width: 'auto',
          height: 'auto',
        }}></img>
        <br />

          {this.state && this.state.settings && this.state.settings.neverShowBubbleWindow ? (
            <div style={{
              padding: '25px',
              textAlign: 'left',
            }}>
              <div className="checkbox">
                <label>
                  <input id="alwaysHideCheckbox" type="checkbox" defaultChecked onChange={e => {

                    console.log('inside alwaysHideCheckbox');
                    console.log(e.targetValue);
                    console.log(e.currentTarget);
                    console.log(e.target);
                    const newState = {
                      neverShowBubbleWindow: false,
                    };

                    ipcRenderer.send('save-app-settings', newState);
                    this.setState({
                      settings: Object.assign(this.state.settings, newState)
                    });
                  }}/> Never show random shortcuts <span className="icon icon-help-circled" data-for='neverShowTooltip' data-iscapture="true" 
                  data-tip='Completely hide this suggestion window and never show it.'></span>
                </label> 
              </div>
            </div>
          ) : (
            <div style={{
              padding: '25px',
              textAlign: 'left',
            }}>
              <div className="checkbox">
                <label>
                  <input id="alwaysHideCheckbox" type="checkbox" onChange={e => {

                    console.log('inside alwaysHideCheckbox');
                    
                    console.log(e.targetValue);
                    console.log(e.currentTarget);
                    console.log(e.target);

                    const newState = {
                      neverShowBubbleWindow: true,
                    };

                    ipcRenderer.send('save-app-settings', newState);
                    this.setState({
                      settings: Object.assign(this.state.settings, newState)
                    });
                  }}/> Never show random shortcuts <span className="icon icon-help-circled" data-for='neverShowTooltip' data-iscapture="true" 
                  data-tip='Completely hide this suggestion window and never show it.'></span>
                </label>
              </div>
              <div className="checkbox">
                <label>
                  {this.state && this.state.settings && this.state.settings.showOnAppSwitch ? (

                    <input id="appSwitchCheckbox" type="checkbox" defaultChecked onChange={e => {

                      console.log('inside appSwitchCheckbox');
                      console.log(e.targetValue);
                      console.log(e.currentTarget);
                      console.log(e.target);
                      const newState = {
                        showOnAppSwitch: false,
                      };

                      ipcRenderer.send('save-app-settings', newState);
                      this.setState({
                        settings: Object.assign(this.state.settings, newState)
                      });
                    }}/>
                  ) : (
                    <input id="appSwitchCheckbox" type="checkbox" onChange={e => {
                      console.log('inside appSwitchCheckbox');
                      console.log(e.targetValue);
                      console.log(e.currentTarget);
                      console.log(e.target);

                      const newState = {
                        showOnAppSwitch: true,
                      };

                      ipcRenderer.send('save-app-settings', newState);
                      this.setState({
                        settings: Object.assign(this.state.settings, newState)
                      });
                    }}/>

                  )}
                  Show when app switches <span className="icon icon-help-circled" data-for='appSwitchTooltip' data-iscapture="true" 
                    data-tip='Each time you change the active program, the suggestion window will show.'></span>
                </label>
              </div>

              <div className="checkbox">
                <label>
                  {this.state.settings.timeoutRepeat ? (
                    <input id="timeoutRepeatCheckbox" type="checkbox" defaultChecked onChange={e => {
                      const newState = {
                        timeoutRepeat: false,
                      };

                      ipcRenderer.send('save-app-settings', newState);
                      this.setState({
                        settings: Object.assign(this.state.settings, newState)
                      });
                    }}/>
                  ) : (
                    <input id="timeoutRepeatCheckbox" type="checkbox" onChange={e => {
                      const val = document.getElementById('timeoutRepeatMinutes').value;
                      const newState = {
                        timeoutRepeat: val && val != "?" ? Number(val) : false,
                      };

                      ipcRenderer.send('save-app-settings', newState);
                      this.setState({
                        settings: Object.assign(this.state.settings, newState)
                      });
                    }}/>
                  )} 
                  Show on repeat <input id="timeoutRepeatMinutes" type="number" step="0.20" style={{
                    width: '40px',
                  }} placeholder={this.state.settings.timeoutRepeat ? this.state.settings.timeoutRepeat : "0"} onChange={e => {
                      console.log('inside this.state.timeoutRepeat');
                      
                      console.log(e.targetValue);
                      console.log(e.currentTarget);
                      console.log(e.target);

                      const val = document.getElementById('timeoutRepeatMinutes').value;
                      const newState = {
                        timeoutRepeat: val ? Number(val) : false,
                      };

                      ipcRenderer.send('save-app-settings', newState);
                      this.setState({
                        settings: Object.assign(this.state.settings, newState)
                      });
                    }}/> <span className="icon icon-help-circled" data-for='timeoutRepeatTooltip' data-iscapture="true" data-tip="How often to show this window"></span>
                </label>
              </div>
            </div>
          )}
        <button id="reload-button" className="btn btn-negative" onClick={() => {
          console.log('sending reloadShortcuts from ipcRenderer');
          ipcRenderer.send('main-parse-shortcuts', this.state.currentProgramName);
        }}>Re-parse {this.state.currentProgramName}</button> <span className="icon icon-help-circled" data-for='neverShowTooltip' data-iscapture="true" 
          data-tip={`Delete the shortcuts from ${this.state.currentProgramName} and parse them again.`}></span>
      </div>
    );

    console.log('rendering...');

    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <div className="pane pane-sm sidebar">
            <header className="toolbar toolbar-header">
              <div className="toolbar-actions" style={{
                display: 'flex',
                flexDirection: 'row',
              }}>
                <input className="form-control" type="text" id="search-field" placeholder="Search" style={{
                  marginTop: '6px',
                  marginLeft: '6px',
                  flex: 4,
                }} onChange={this.filterListTrigger} onKeyDown={this.filterListKeyDown}/>

                <button className="btn btn-default" type="button" onClick={e => {
                  ipcRenderer.send('open-about');
                }}>
                  <span style={{
                    flex: 1,
                  }} className="icon icon-help-circled"></span>
                </button>

                <button className="btn btn-default" type="button" onClick={e => {
                  this.setState({
                    settingsPaneActive: !(this.state && this.state.settingsPaneActive),
                    settings: this.state && this.state.programs && this.state.programs[GLOBAL_SETTINGS_KEY] ? this.state.programs[GLOBAL_SETTINGS_KEY] : {},
                  });
                }}>
                  <span style={{
                    flex: 1,
                  }} className="icon icon-cog"></span>
                </button>
              </div>
            </header>
              {programTitles ? programTitles : ""}
            </div>
            <div className="pane" style={{
              textAlign: 'center',
            }}>
              {settingsComponent ? settingsComponent : (
                <table className="table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Shortcut</th>
                      <th>Menu</th>
                      <th>Up</th>
                      <th>Down</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  {shortcutTableBody ? shortcutTableBody : ""}
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

window.onload = function() {
    ReactDOM.render(<Home />, document.getElementById("app"));
}