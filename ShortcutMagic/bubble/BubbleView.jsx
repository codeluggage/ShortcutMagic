'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';

const GLOBAL_SETTINGS_KEY = "all programs";
const RANDOM_SHORTCUT_PERCENTAGE = 0.25;

// TODO: Remove all checks for this.state and replace all initial state with props passed from parent


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

// const randomNumber = (length, percentage) =>  {
//   // why is length 1??????
//   // console.log('=======================')
//   // const a = (length * percentage)
//   // console.log(a)
//   // const b = Math.random() * a
//   // console.log(b)
//   // const c = Math.floor(b)
//   // console.log(c)
//   // return c
//   // console.log('=======================')

//   return Math.floor(Math.random() * length)
// }

// function getRandomShortcut(shortcuts, previousShortcuts = []) {
//   console.log('entering getRandomShortcut with number of shortcuts: ', shortcuts.length)

//   let names = previousShortcuts.filter(s => s && s.name).map(s => s.name);
//   shortcuts = (!names || !names.length) ? shortcuts : shortcuts.filter(s => names.indexOf(s.name) !== -1);

//   shortcuts.filter(s => !s.isHidden && s.name !== "File").sort((a, b) => {
//     if (a.score > b.score) return 1;
//     if (b.score > a.score) return -1;

//     return 0;
//   });

//   let randomShortcut = shortcuts[randomNumber(shortcuts.length, RANDOM_SHORTCUT_PERCENTAGE)];

//   console.log('which gave this new random shortcut: ')
//   console.log(JSON.stringify(randomShortcut))

//   return randomShortcut

//   // return shortcuts[Math.floor(Math.random() * (shortcuts.length * RANDOM_SHORTCUT_PERCENTAGE))];
// }


let stopFadeOut = false;
const initialFade = 0.0;
const maxFade = 0.8;

export default class BubbleView extends Component {
  componentWillMount() {
    this.fadeOut = this.fadeOut.bind(this)
    this.fadeIn = this.fadeIn.bind(this)
    this.fadeInAndOut = this.fadeInAndOut.bind(this)
    this.setPrograms = this.setPrograms.bind(this)
    // this.setCurrentProgramName = this.setCurrentProgramName.bind(this)
    this.stopFadingWithState = this.stopFadingWithState.bind(this)
    // this.promptToHide = this.promptToHide.bind(this)

    ipcRenderer.on('set-programs', this.setPrograms)
    // ipcRenderer.on('set-current-program-name', this.setCurrentProgramName)
    ipcRenderer.on('fade-in-and-out', this.fadeInAndOut)
    // ipcRenderer.on('prompt-to-hide', this.promptToHide)

    this. state = {
      fade: initialFade
    }
  }

  fadeOut() {
    if (stopFadeOut) {
      console.log('stopping fadeout');
      return;
    }

    if (!this.state || !this.state.fade || this.state.fade <= 0.015) {
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
      fade: this.state.fade + 0.05,
      fading: true
    });

    setTimeout(this.fadeIn, 30);
  }

  fadeInAndOut(e, fadeOutTime = 3000) {
    this.fadeIn()

    setTimeout(() => {
      if (!this.state.mouseOver) {
        stopFadeOut = false
        this.fadeOut()
      }
    }, fadeOutTime)
  }


  setPrograms(e, programs, currentProgramName) {
    console.log('setPrograms > ', currentProgramName)
    console.log(programs)

    let shortcuts = Object.values(programs[currentProgramName].shortcuts);
    const randomShortcut = shortcuts[Math.floor(Math.random() * shortcuts.length)]

    setTimeout(() => {
      this.fadeIn();
      setTimeout(() => {
        if (!this.state.mouseOver) {
          stopFadeOut = false
          this.fadeOut()
        }
      }, 3000)
    }, 500)

    let newState = {
      programs,
      shortcuts,
      currentProgramName,
      settings: programs[GLOBAL_SETTINGS_KEY],
      currentShortcut: randomShortcut,
      fade: initialFade,
      mouseOver: false,
    }

    console.log('setting new state: ', randomShortcut.name)
    console.log(newState)

    this.stopFadingWithState(newState)
  }

  // setCurrentProgramName(e, newProgramName) {
  //   console.log('setCurrentProgramName > ');
  //   console.log(newProgramName);
  //   console.log(this.state);
  //   console.log(this.state.programs);

  //   if (!this.state || !this.state.programs) {
  //     console.log('cancelling setting program name because of state: ', this.state)
  //     return;
  //   }
    
  //   const program = this.state.programs[newProgramName]
  //   if (!program) {
  //     console.log('cancelling setting program name because of program: ', this.state.programs)
  //     return
  //   }

  //   let shortcuts = Object.values(program.shortcuts);
  //   if (!shortcuts || shortcuts.length < 1) {
  //     console.log('cancelling setting program name because of shortcut length: ', shortcuts)
  //     return;
  //   }

  //   console.log('about to filter shortcuts before/after: ');
  //   console.log(shortcuts);
  //   // TODO: Decide what to exclude based on shortcut power level!
  //   shortcuts = shortcuts.filter(obj => !obj.isHidden && obj.menu !== "File");
  //   console.log(shortcuts);
  //   // shuffleArray(shortcuts);

  //   // shortcuts.sort((a, b) => {
  //   //   console.log('sorting a b', a.score, b.score);
  //   //   if (!a.score) a.score = 0;
  //   //   if (!b.score) b.score = 0;

  //   //   if (a.score > b.score) return -1;
  //   //   if (a.score < b.score) return 1;

  //   //   return 0;
  //   // });

  //   // Pick a random shortcut from top half of the list
  //   let previousShortcuts = [];
  //   if (this.state && this.state.previousShortcuts) previousShortcuts = this.state.previousShortcuts

  //   let randomShortcut = getRandomShortcut(shortcuts, previousShortcuts)

  //   console.log('random shortcut is: ', randomShortcut)
  //   ipcRenderer.send('suggested-shortcut', randomShortcut)
  //   previousShortcuts.push(randomShortcut)

  //   setTimeout(() => {
  //     this.fadeIn();
  //     setTimeout(() => {
  //       if (!this.state.mouseOver) {
  //         stopFadeOut = false;
  //         this.fadeOut();
  //       }
  //     }, 3000);
  //   }, 500);

  //   let newState = {
  //     shortcuts,
  //     previousShortcuts,
  //     currentShortcut: randomShortcut,
  //     fade: initialFade,
  //     mouseOver: false,
  //     currentProgramName: newProgramName
  //   }

  //   this.stopFadingWithState(newState);
  // }

  stopFadingWithState(newState = {}) {
    stopFadeOut = true;
    newState.fade = maxFade;
    newState.fading = false;
    this.setState(newState);
  }

  // promptToHide() {
  //   this.setState({
  //     promptToHide: true,
  //   });
  // }

  render() {
    if (!this.state || !this.state.currentShortcut) {
      return (
        <div style={{
          backgroundColor: `rgba(255, 255, 255, 0)`
        }}>
        </div>
      );
    }

    let { fade, currentShortcut, currentProgramName } = this.state;

    // console.log('render ', this.state.mouseOver);

    // TODO: Use same color as main window? going for feelings of "bright, easy, fades away into nothing, not interrupting, not disturbing, not sudden, not in the way"

    // TODO: Make not clickable except for button with action or open main window

    const buttonSection = (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        // fontSize: 16,
        padding: '4px',
        backgroundColor: `transparent`,
      }} onMouseEnter={(e) => {
        this.stopFadingWithState({
          mouseOver: true,
        });
      }} onMouseLeave={(e) => {
        this.stopFadingWithState({
          mouseOver: false,
        });
      }}>

        <div className="toolbar-actions btn-group" style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
        }}>

          <div className="btn" style={{
            flex: 2,
            borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
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
            borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
          }} onClick={() => {
            currentShortcut.score = currentShortcut.score ? currentShortcut.score + 1 : 1;
            this.setState({
              currentShortcut
            });

            let shortcuts = {};
            shortcuts[`shortcuts.${currentShortcut.name}`] = currentShortcut;

            ipcRenderer.send('update-current-app-value', shortcuts);

            console.log('>>>> UPVOTE: ');
            console.log(currentShortcut.score);
            console.log(previousShortcuts);

          }}>See More</div>

          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderRun,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
            borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
          }} onClick={() => {
            ipcRenderer.send('execute-list-item', currentShortcut, currentProgramName);
          }}>Run</div>
        </div>

        <div className="toolbar-actions btn-group" style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
        }}>
          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderPrevious,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
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
            borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
          }} onClick={() => {
            currentShortcut.score = currentShortcut.score ? currentShortcut.score - 1 : -1;
            this.setState({
              currentShortcut
            });

            let shortcuts = {};
            shortcuts[`shortcuts.${currentShortcut.name}`] = currentShortcut;

            ipcRenderer.send('update-current-app-value', shortcuts);

            console.log('>>>> DOWNVOTE: ');
            console.log(currentShortcut.score);
            console.log(previousShortcuts);

          }}>See Less</div>

          <div className="btn" style={{
            // backgroundColor: `rgba(255, 255, 255, 0)`,
            // color: `rgba(0, 0, 0, ${this.state.fade})`, 
            // border: borderHighlight,
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            flex: 2,
            borderLeft: `1px solid rgba(194, 192, 194, ${this.state.fade})`,
          }} onClick={() => {
            ipcRenderer.send('force-to-top', currentShortcut);
          }}>Highlight</div>

        </div>

      </div>
    );

    const shortcutSection = (
      <div style={{
        backgroundColor: `transparent`,
      }}>
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

    const score = (
      <span className="icon icon-trophy" style={{
          left: '2px',
          top: '4px',
          fontSize: '16px',
          position: 'absolute',
          opacity: this.state.fade,
      }}>{currentShortcut.score}</span>
    );

    const headerComponent = (
      <header style={{
        borderBottom: '1px solid #c2c0c2',
        minHeight: '22px',
        boxShadow: 'inset 0 1px 0 rgba(245, 244, 245, ${this.state.fade})',
        backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
        backgroundImage: '-webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(232, 230, 232, ${this.state.fade})), color-stop(100%, rgba(209, 207, 209, ${this.state.fade})))',
        backgroundImage: '-webkit-linear-gradient(top, rgba(232, 230, 232, ${this.state.fade}) 0%, rgba(209, 207, 209, ${this.state.fade}) 100%)',
        backgroundImage: 'linear-gradient(to bottom, rgba(232, 230, 232, ${this.state.fade}) 0%, rgba(209, 207, 209, ${this.state.fade}) 100%)',
      }}>
        <div className="title" style={{
          // backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
          color: `rgba(85, 85, 85, ${this.state.fade})`, 
          fontSize: 14,
        }}>
          {currentShortcut.name}
        </div>
      </header>
    );

    const closeWindowComponent = (
      <div style={{
          position: 'relative',
      }} onClick={(e) => {
        ipcRenderer.send('hide-bubble-window', true);
      }}>
        <span className="icon icon-cancel" style={{
          right: '3px',
          left: '3px',
          margin: '3px',
          height: '6px',
          position: 'absolute',
          opacity: this.state.fade,
        }}></span>
      </div>
    );

    const iconComponent = (
        <div style={{
            position: 'relative',
        }} onClick={(e) => {
          ipcRenderer.send('show-window');
        }}>
            <img src="../assets/wizard.png" style={{
                right: '1px',
                top: '1px',
                height: '20px',
                transform: 'rotate(25deg)',
                transformOrigin: '0% %0',
                position: 'absolute',
                opacity: this.state.fade,
            }}></img>
        </div>
    );

    return (
      <div className="window" style={{
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
        color: `rgba(85, 85, 85, ${this.state.fade})`, 
      }}>
        {closeWindowComponent}
        {iconComponent}
        {headerComponent}
        <div className="window-content">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: `transparent`,
            // backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
            // color: `rgba(85, 85, 85, ${this.state.fade})`, 
            // backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
            // color: `rgba(85, 85, 85, ${this.state.fade})`, 
            // borderRadius: ".35rem",
            // borderWidth: ".50rem",
            // boxShadow: 'rgba(34, 34, 34, ${this.state.fade}) 0px 0px 10px 0px',
            // textAlign: 'center',
          }} onMouseEnter={(e) => {
            this.stopFadingWithState(this.state.mouseOver ? undefined : {
              mouseOver: true
            });
          }}>
            <div className="title" style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'stretch',
              textAlign: 'center',
              marginBottom: '4px',
              fontSize: 16,
              // fontWeight: 500,
              fontWeight: 600,
              backgroundColor: `transparent`,
              // backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
              color: `rgba(85, 85, 85, ${this.state.fade})`, 
            }}>
              {shortcutSection}
            </div>
            <div style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'stretch',
              backgroundColor: `transparent`,
              // backgroundColor: `rgba(232, 230, 232, ${this.state.fade})`,
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
