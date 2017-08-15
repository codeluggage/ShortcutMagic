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
const initialFade = 0.6;

export default class BubbleView extends Component {
  componentWillMount() {
    const fadeOut = () => {
        console.log('in fadeout ', this.state.fade);
        if (stopFadeOut) {
          console.log('stopping fadeout');
          return;
        }

        if (this.state.fade <= 0.01) {
          this.setState({
            fade: 0,
            fading: false
          });
          return;
        }

        this.setState({
          fade: this.state.fade - 0.01,
          fading: true
        });

        setTimeout(fadeOut, 30);
    };
    

    ipcRenderer.on('update-shortcuts', (e, shortcutInfo) => {
      stopFadeOut = true;

      let shortcuts = Object.values(shortcutInfo.shortcuts);

      console.log('about to filter shortcuts before/after: ');
      console.log(shortcuts);
      shortcuts = shortcuts.filter(obj => !obj.isHidden)
      console.log(shortcuts);
      shuffleArray(shortcuts);

      shortcuts.sort((a, b) => {
        if (a.isFavorite && b.isFavorite) {
          return 0;
        } else if (a.isFavorite) {
          return -1;
        } else if (b.isFavorite) {
          return 1;
        }

        return 0;
      });

      // Random shortcut from top half of the list
      let randomShortcut = shortcuts[Math.floor(Math.random() * (shortcuts.length * 0.5))];
      console.log('random shortcut is: ', randomShortcut);

      this.setState({
        shortcuts: shortcuts,
        currentShortcut: randomShortcut,
        fade: initialFade, // TODO: DRY
      });

      setTimeout(() => {
        stopFadeOut = false;
        fadeOut();
      }, 2000);
    });


    this.setState({
      fade: initialFade // TODO: DRY
    });
  }

  render() {
    if (!this.state || !this.state.currentShortcut) {
      return (
        <div style={{
          backgroundColor: `rgba(255, 255, 255, 0)`
        }}>
          No shortcuts...
        </div>
      );
    }

    let { fade, currentShortcut } = this.state;

    if (fade <= 0.01) {
      ipcRenderer.send('hide-bubble-window');
    }

    console.log('render ');
    console.log(fade);
    console.log(currentShortcut);

    // TODO: Use same color as main window? going for feelings of "bright, easy, fades away into nothing, not interrupting, not disturbing, not sudden, not in the way"

    // TODO: Make not clickable except for button with action or open main window

    let bottomSection = null;

    if (this.state.mouseOver) {
      bottomSection = 
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          fontSize: 16,
        }} onMouseEnter={(e) => {
          stopFadeOut = true;
        }}>
          <div style={{
            backgroundColor: `rgba(255, 255, 255, 0)`,
            color: `rgba(0, 0, 0, ${this.state.fade})`, 
            border: '4px solid rgba(0, 0, 0, ${this.state.fade})',
            borderRadius: ".35rem",
            borderWidth: ".50rem",
            flex: 2,
          }} onMouseEnter={(e) => {
            stopFadeOut = true;
          }} onClick={() => {
            currentShortcut.isHidden = true;
            ipcRenderer.send('update-shortcut-item', currentShortcut);
          }}>Not interested</div>
          <div style={{
            backgroundColor: `rgba(255, 255, 255, 0)`,
            color: `rgba(0, 0, 0, ${this.state.fade})`, 
            border: '4px solid rgba(0, 0, 0, ${this.state.fade})',
            borderRadius: ".35rem",
            borderWidth: ".50rem",
            flex: 2,
          }} onMouseEnter={(e) => {
            stopFadeOut = true;
          }} onClick={() => {
            ipcRenderer.send('execute-list-item', currentShortcut);
          }}>Run</div>
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
        stopFadeOut = true;
        this.setState({
          fade: initialFade, //TODO: DRY
          fading: false,
          mouseOver: true,
        });
      }} onMouseLeave={(e) => {
        this.setState({
          mouseOver: false,
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
