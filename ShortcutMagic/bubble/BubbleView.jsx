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
    let randomShortcut = shortcuts[Math.floor(Math.random() * (shortcuts.length * 0.5))];
    console.log('random shortcut is: ', randomShortcut);

    this.setState({
      shortcuts: shortcuts,
      currentShortcut: randomShortcut,
      fade: initialFade,
      mouseOver: false,
    });

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

    let bottomSection = null;

    const stopFadingWithState = (newState = {}) => {
      stopFadeOut = true;
      newState.fade = maxFade;
      newState.fading = false;
      this.setState(newState);
    };

    if (this.state.mouseOver) {
      const borderRemove = this.state.mouseOver == "downvote" ? '1px solid rgba(50, 63, 83, 1)' : '';
      const borderFavorite = this.state.mouseOver == "upvote" ? '1px solid rgba(50, 63, 83, 1)' : '';
      const borderRun = this.state.mouseOver == "run" ? '1px solid rgba(50, 63, 83, 1)' : '';
      const borderNext = this.state.mouseOver == "next" ? '1px solid rgba(50, 63, 83, 1)' : '';
      const borderPrevious = this.state.mouseOver == "previous" ? '1px solid rgba(50, 63, 83, 1)' : '';
      const borderHighlight = this.state.mouseOver == "highlight" ? '1px solid rgba(50, 63, 83, 1)' : '';

      bottomSection = 
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 16,
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

          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
          }}>

            <div style={{
              backgroundColor: `rgba(255, 255, 255, 0)`,
              color: `rgba(0, 0, 0, ${this.state.fade})`, 
              border: borderRemove,
              borderRadius: ".35rem",
              borderWidth: ".50rem",
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
              ipcRenderer.send('update-shortcut-item', currentShortcut);
            }}>downvote</div>

            <div style={{
              backgroundColor: `rgba(255, 255, 255, 0)`,
              color: `rgba(0, 0, 0, ${this.state.fade})`, 
              border: borderFavorite,
              borderRadius: ".35rem",
              borderWidth: ".50rem",
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
              ipcRenderer.send('update-shortcut-item', currentShortcut);
            }}>upvote</div>

            <div style={{
              backgroundColor: `rgba(255, 255, 255, 0)`,
              color: `rgba(0, 0, 0, ${this.state.fade})`, 
              border: borderRun,
              borderRadius: ".35rem",
              borderWidth: ".50rem",
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
              console.log('BEFORE EXECUTE >>>>>>>>>>>>>>>>>>>>>>.');
              ipcRenderer.send('execute-list-item', currentShortcut);
              console.log('AFTER EXECUTE >>>>>>>>>>>>>>>>>>>>>>.');
            }}>Run</div>

          </div>

          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
          }}>

            <div style={{
              backgroundColor: `rgba(255, 255, 255, 0)`,
              color: `rgba(0, 0, 0, ${this.state.fade})`, 
              border: borderPrevious,
              borderRadius: ".35rem",
              borderWidth: ".50rem",
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

            }}>Previous</div>
            
            <div style={{
              backgroundColor: `rgba(255, 255, 255, 0)`,
              color: `rgba(0, 0, 0, ${this.state.fade})`, 
              border: borderNext,
              borderRadius: ".35rem",
              borderWidth: ".50rem",
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
              this.updateShortcuts(null, {
                shortcuts: this.state.shortcuts
              });
            }}>Next</div>


            <div style={{
              backgroundColor: `rgba(255, 255, 255, 0)`,
              color: `rgba(0, 0, 0, ${this.state.fade})`, 
              border: borderHighlight,
              borderRadius: ".35rem",
              borderWidth: ".50rem",
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
              ipcRenderer.send('toggle-window');
              ipcRenderer.send('force-to-top', currentShortcut);
            }}>Highlight</div>

          </div>

        </div>
    } else {
      bottomSection = 
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
    }


    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: `rgba(238, 219, 165, ${this.state.fade})`,
        color: `rgba(0, 0, 0, ${this.state.fade})`, 
        borderRadius: ".35rem",
        borderWidth: ".50rem",
        boxShadow: 'rgba(34, 34, 34, ${this.state.fade}) 0px 0px 10px 0px',
        textAlign: 'center',
      }} onMouseEnter={(e) => {
        stopFadingWithState(this.state.mouseOver ? undefined : {
          mouseOver: true
        });
      }}>
        <b style={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'stretch',
          marginBottom: '1px',
          fontSize: 16,
          fontWeight: 500,
        }}>{currentShortcut.name}</b>
        <b style={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'stretch',
          marginTop: '1px',
          fontSize: 22,
          fontWeight: 600,
        }}>
          {bottomSection}
        </b>
      </div>
    );
  }
}

window.onload = function(){
  ReactDOM.render(<BubbleView />, document.getElementById("bubble-root"));
};
