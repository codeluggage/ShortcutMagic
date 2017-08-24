'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';



/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getRandomShortcut(shortcuts, previousShortcuts) {
  let filtered = shortcuts;

  if (shortcuts.length > previousShortcuts.length) {
    let names = previousShortcuts.map(s => s.name);
    filtered = (!names || !names.lenght) ? shortcuts : shortcuts.filter(s => names.indexOf(s.name) === -1);
  }

  return filtered[Math.floor(Math.random() * (filtered.length * 0.5))];
}


let stopFadeOut = false;
const initialFade = 0.0;
const maxFade = 0.8;

export default class BubbleView extends Component {
  componentWillMount() {
    this.updateShortcuts = this.updateShortcuts.bind(this);
    this.fadeOut = this.fadeOut.bind(this);
    this.fadeIn = this.fadeIn.bind(this);

    ipcRenderer.on('update-shortcuts', this.updateShortcuts);

    this.setState({
      fade: initialFade // TODO: DRY
    });
  }

  fadeOut() {
    if (stopFadeOut) {
      console.log('stopping fadeout');
      return;
    }

    if (this.state.fade <= 0.03) {
      this.setState({
        fade: 0,
        fading: false
      });

      ipcRenderer.send('hide-bubble-window');
      return;
    }

    this.setState({
      fade: this.state.fade - 0.01,
      fading: true
    });

    setTimeout(this.fadeOut, 30);
  }

  fadeIn() {
    if (this.state.fade >= maxFade) {
      this.setState({
        fade: maxFade,
        fading: false
      });
      return;
    }

    this.setState({
      fade: this.state.fade + 0.02,
      fading: true
    });

    setTimeout(this.fadeIn, 30);
  }

  updateShortcuts(e, shortcutInfo) {
    stopFadeOut = true;

    let shortcuts = Object.values(shortcutInfo.shortcuts);

    console.log('about to filter shortcuts before/after: ');
    console.log(shortcuts);
    // TODO: Decide what to exclude based on shortcut power level!
    shortcuts = shortcuts.filter(obj => !obj.isHidden && obj.menu != "File");
    console.log(shortcuts);
    shuffleArray(shortcuts);

    shortcuts.sort((a, b) => {
      console.log('sorting a b', a.score, b.score);
      if (!a.score) a.score = 0;
      if (!b.score) b.score = 0;

      if (a.score > b.score) return  -1;
      if (a.score < b.score) return  1;
      if (a.score === b.score) return  0;

      return 0;
    });

    // Random shortcut from top half of the list
    let previousShortcuts = this.state ? (this.state.previousShortcuts ? this.state.previousShortcuts : []) : [];
    let randomShortcut = getRandomShortcut(shortcuts, previousShortcuts);
    console.log('random shortcut is: ', randomShortcut);
    previousShortcuts.push(randomShortcut);

    let newState = {
      shortcuts: shortcuts,
      currentShortcut: randomShortcut,
      previousShortcuts: previousShortcuts,
    };

    if (e) {
      newState.fade = initialFade;
      newState.mouseOver = false;

      setTimeout(() => {
        this.fadeIn();
        setTimeout(() => {
          if (!this.state.mouseOver) {
            stopFadeOut = false;
            this.fadeOut();
          }
        }, 3000);
      }, 500);
    }

    this.setState(newState);
  }

  render() {
    if (!this.state || !this.state.currentShortcut) {
      return (
        <div style={{
          backgroundColor: `rgba(255, 255, 255, 0)`
        }}>
        </div>
      );
    }

    let { fade, currentShortcut } = this.state;

    // console.log('render ', this.state.mouseOver);

    // TODO: Use same color as main window? going for feelings of "bright, easy, fades away into nothing, not interrupting, not disturbing, not sudden, not in the way"

    // TODO: Make not clickable except for button with action or open main window

    const stopFadingWithState = (newState = {}) => {
      stopFadeOut = true;
      newState.fade = maxFade;
      newState.fading = false;
      this.setState(newState);
    };

    const buttonSection = (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        // fontSize: 16,
        padding: '4px',
      }} onMouseEnter={(e) => {
        stopFadingWithState({
          mouseOver: true,
        });
      }} onMouseLeave={(e) => {
        stopFadingWithState({
          mouseOver: false,
        });
      }}>

        <div className="toolbar-actions btn-group" style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
        }}>

          <div className="btn" style={{
            flex: 2,
          }} onMouseLeave={(e) => {
            this.setState({
              mouseOver: true,
            });
          }} onMouseEnter={(e) => {
            stopFadingWithState({
              mouseOver: "next"
            });
          }} onClick={() => {
            this.setState({
              currentShortcut: getRandomShortcut(this.state.shortcuts, this.state.previousShortcuts),
            });
          }}>Next</div>

          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderUpvote,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
          }} onMouseLeave={(e) => {
            this.setState({
              mouseOver: true,
            });
          }} onMouseEnter={(e) => {
            stopFadingWithState({
              mouseOver: "upvote"
            });
          }} onClick={() => {
            currentShortcut.score = currentShortcut.score ? currentShortcut.score + 1 : 1;
            ipcRenderer.send('update-current-app-value', {
              shortcuts: [currentShortcut]
            });

            console.log('>>>> UPVOTE: ');
            console.log(currentShortcut.score);
            console.log(previousShortcuts);

          }}>Upvote</div>

          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderRun,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
          }} onMouseLeave={(e) => {
            this.setState({
              mouseOver: true,
            });
          }} onMouseEnter={(e) => {
            stopFadingWithState({
              mouseOver: "run"
            });
          }} onClick={() => {
            ipcRenderer.send('execute-list-item', currentShortcut);
          }}>Run</div>
        </div>

        <div className="toolbar-actions btn-group" style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
        }}>
          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderPrevious,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
          }} onMouseLeave={(e) => {
            this.setState({
              mouseOver: true,
            });
          }} onMouseEnter={(e) => {
            stopFadingWithState({
              mouseOver: "previous"
            });
          }} onClick={() => {
            let lastShortcut; 
            if (this.state.previousShortcuts) {
              lastShortcut = this.state.previousShortcuts.pop();
            }
            if (!lastShortcut) {
              lastShortcut = getRandomShortcut(this.state.shortcuts, undefined);
            }

            this.setState({
              currentShortcut: lastShortcut,
            });
          }}>Previous</div>
          
          
          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderDownvote,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
          }} onMouseLeave={(e) => {
            this.setState({
              mouseOver: true,
            });
          }} onMouseEnter={(e) => {
            stopFadingWithState({
              mouseOver: "downvote"
            });
          }} onClick={() => {
            currentShortcut.score = currentShortcut.score ? currentShortcut.score - 1 : -1;
            ipcRenderer.send('update-current-app-value', {
              shortcuts: [currentShortcut]
            });

            console.log('>>>> DOWNVOTE: ');
            console.log(currentShortcut.score);
            console.log(previousShortcuts);

          }}>Downvote</div>

          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderHighlight,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
          }} onMouseLeave={(e) => {
            this.setState({
              mouseOver: true,
            });
          }} onMouseEnter={(e) => {
            stopFadingWithState({
              mouseOver: "highlight"
            });
          }} onClick={() => {
            ipcRenderer.send('show-shortcut-windows');
            ipcRenderer.send('force-to-top', currentShortcut);
          }}>Highlight</div>

        </div>

      </div>
    );

    const shortcutSection = (
      <div>
        {
          (currentShortcut["mod"]) ? currentShortcut["mod"] :
            (currentShortcut["glyph"] && !currentShortcut["char"]) ? "⌘" :
              (!currentShortcut["glyph"] && currentShortcut["char"]) ? "⌘" : ""
        }
        {
          (currentShortcut["glyph"]) ? ( currentShortcut["glyph"] ) : ""
        }
        {
          (currentShortcut["char"]) ? ( currentShortcut["char"]): ""
        }
      </div>
    );


    return (
      <div className="window" style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
      }}>
          <header className="toolbar toolbar-header" style={{
            backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
            // flex: 1,
            // textAlign: 'center',
            // justifyContent: 'center',
            // alignContent: 'stretch',
            // marginBottom: '2px',
            // fontSize: 16,
            // fontWeight: 500,
          }}>
            <div className="title" style={{
              backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
            }}>
              {currentShortcut.name}{currentShortcut.score ? ` (score: ${currentShortcut.score})` : ""}
            </div>
          </header>

        <div className="window-content">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            // boxShadow: 'rgba(34, 34, 34, ${this.state.fade}) 0px 0px 10px 0px',
            // textAlign: 'center',
          }} onMouseEnter={(e) => {
            stopFadingWithState(this.state.mouseOver ? undefined : {
              mouseOver: true
            });
          }}>
            <div className="title" style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'stretch',
              textAlign: 'center',
              marginBottom: '2px',
              fontSize: 16,
              // fontWeight: 500,
              fontWeight: 600,
            }}>
              {shortcutSection}
            </div>
            <div style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'stretch',
            }}>
              {buttonSection}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

window.onload = function(){
  ReactDOM.render(<BubbleView />, document.getElementById("bubble-root"));
};
