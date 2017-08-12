'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';

export default class BubbleView extends Component {
  componentWillMount() {
    ipcRenderer.on('update-shortcuts', (e, shortcuts) => {
      // TODO: Count down in transparency!

      this.setState({
        shortcuts: Object.values(shortcuts.shortcuts),
        currentShortcut: null,
      });
    });
  }

  render() {
    if (!this.state || !this.state.shortcuts) {
      return (
        <div style={{
          backgroundColor: `rgba(255, 255, 255, 0)`
        }}>
          No shortcuts...
        </div>
      );
    }

    console.log('>>>>>>>>>>>>>>> SHORTCUTS: ');
    console.log(this.state.shortcuts);
    console.log(this.state);
    let shortcuts = this.state.shortcuts.filter(s => !s.isHidden);

    if (!this.previousShortcuts || this.previousShortcuts != shortcuts) {
      shortcuts.sort((a, b) => {
        if (a.isFavorite) {
          return -1;
        }

        return 0;
      });
    }

    let randomShortcut = shortcuts[Math.floor(Math.random() * shortcuts.length)];
    console.log('random shortcut is: ', randomShortcut);

    // TODO: Use same color as main window? going for feelings of "bright, easy, fades away into nothing, not interrupting, not disturbing, not sudden, not in the way"

    // TODO: Make not clickable except for button with action or open main window
    return (
      <div style={{
        backgroundColor: `rgba(144, 235, 157, 0.4)`,
        borderRadius: ".35rem",
        borderWidth: ".50rem",
        boxShadow: '#222 0px 0px 15px 5px'
      }}>
        {JSON.stringify(randomShortcut)}
      </div>
    );
  }
}

window.onload = function(){
  ReactDOM.render(<BubbleView />, document.getElementById("bubble-root"));
};
