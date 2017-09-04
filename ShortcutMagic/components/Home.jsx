'use babel';

import React, { Component } from 'react';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactTooltip from 'react-tooltip'
import ReactDOM from 'react-dom';


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
      this.filterListTrigger = this.filterListTrigger.bind(this);
      this.filterList = this.filterList.bind(this);
      this.toggleSettings = this.toggleSettings.bind(this);
      this.toggleMiniSettings = this.toggleMiniSettings.bind(this);
      this.changeFontUp = this.changeFontUp.bind(this);
      this.changeFontDown = this.changeFontDown.bind(this);
      this.setCurrentProgramName = this.setCurrentProgramName.bind(this);

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

      ipcRenderer.on('set-current-program-name', this.setCurrentProgramName);

      ipcRenderer.on('set-programs', (event, programs) => {
        let shortcutDict = {};
        programs.forEach(s => shortcutDict[s.name] = s);
        this.setState({
          programs: shortcutDict, 
        });
      });


    ipcRenderer.on('no-shortcuts-visual-notification', (event) => {
        console.log("TODO: Show that the list item execution might not work");
    });

    ipcRenderer.on('force-to-top', (event, shortcut) => {
        this.focusSearchField(null, shortcut.name);
    });

    console.log('home constructor called');

    ipcRenderer.send('set-programs-async');
  }

  setCurrentProgramName(event, currentProgramName) {
    if (!this || !currentProgramName) {
      return;
    }

    if (!this.state) {
      this.setState({
        currentProgramName
      });

      return;
    }

    let program = this.state.programs[currentProgramName];

    if (!program) {
      program = this.state.programs[this.state.currentProgramName];
    }

    if (!program) {
      // Call once more after delay
      if (event !== null) { 
        setTimeout(() => setCurrentProgramName(null, currentProgramName), 250);
      }
      return;
    }

    let items = Object.values(this.state.programs[currentProgramName].shortcuts);

    items.sort((a, b) => {
      console.log('sorting a b', a.score, b.score);
      if (!a.score) a.score = 0;
      if (!b.score) b.score = 0;

      if (a.score > b.score) return  -1;
      if (a.score < b.score) return  1;
      if (a.score === b.score) return  0;

      return 0;
    });

    this.setState({
      currentProgramName,
      items,
    });
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
    if (targetValue && targetValue.length) {
      updatedList = this.state.programs.filter((program) => {

        const innerValues = Object.keys(program.shortcuts).map(key => item[key]);

        for (var i = 0; i < innerValues.length; i++) {
          let innerVal = innerValues[i];

          if (typeof innerVal === 'string' && innerVal.toLowerCase().indexOf(targetValue.toLowerCase()) !== -1) return true;

          if (innerVal == targetValue) return true;
        }
      });

      this.setState({
        items: updatedList
      });
    } else {
      this.setCurrentProgramName(this.state.currentProgramName);
    }
  }

  filterListKeyDown(e) {
    if (e.keyCode === 27) { // key code 27 == escape
      // Clear search field and trigger list filter on empty search filter
      window.document.getElementById("search-field").value = '';
    }

    this.filterList(document.getElementById("search-field").value);
  }

  focusSearchField(event, searchValue) {
    if (searchValue && typeof searchValue === "string") {
      window.document.getElementById("search-field").value = searchValue;
      this.filterList(searchValue);
    }

    window.document.getElementById("search-field").focus();
  }

  render() {
    let shortcutTableBody;
    let programTitles;

    if (!this.state || !this.state.programs || !this.state.currentProgramName) {
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
      shortcutTableBody = (
        <tbody>
          {this.state.items.map((value) => {
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
          <h5 className="nav-group-title">Programs</h5>

          {Object.keys(this.state.programs).map(name => {
            let navGroupClass = "nav-group-item"; 
            if (name == this.state.currentProgramName) {
              navGroupClass +=  " active";
            }

            let formattedName = name;
            let query = window.document.getElementById("search-field").value;
            if (query && query.length && formattedName.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
              formattedName = <u>{name}</u>;
            }

            return (
              <span className={navGroupClass} key={name} onClick={(e) => {
                this.setCurrentProgramName(null, name);
              }}>
                <span className="icon icon-window"></span>
                {formattedName}
              </span>
            );
          })}
        </nav>
      );
    }

    return (
      <div className="window">
        <header className="toolbar toolbar-header">
          <div className="toolbar-actions">
            <input className="form-control" type="text" id="search-field" placeholder="Search"
              onChange={this.filterListTrigger} onKeyDown={this.filterListKeyDown}/>
          </div>
        </header>

        <div className="window-content">
          <div className="pane-group">
            <div className="pane pane-sm sidebar">
              {programTitles ? programTitles : "Loading..."}
            </div>
            <div className="pane">
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
        </div>
      </div>
    );
  }
}

window.onload = function() {
    ReactDOM.render(<Home />, document.getElementById("app"));
}