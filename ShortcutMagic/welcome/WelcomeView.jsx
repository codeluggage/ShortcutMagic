'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote, shell } from 'electron';
import ReactDOM from 'react-dom';

export default class WelcomeView extends Component {
  componentWillMount() {
    this.setState({
      accessGranted: false
    });

    // window.document.documentElement.style.backgroundColor = '#3a9ad9';

    ipcRenderer.on('set-background-color', (event, backgroundColor) => {
      window.document.documentElement.style.backgroundColor = backgroundColor;
    });

    ipcRenderer.on('set-div-color', (event, backgroundColor) => {
      this.setState({
        backgroundColor: backgroundColor
      });

      window.document.documentElement.style.backgroundColor = backgroundColor;
    });
  }

  componentDidMount() {}

  render() {
    return (
        <div style={{
            display: 'flex',
            flex: 9,
            flexDirection: 'column',
            alignContent: 'center',
            alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            <img src="../assets/wizard.png" height="128" width="128"></img>
            <h1>Running ShortcutMagic</h1>

            To run ShortcutMagic, it needs administrative access which is unlocked with your computer password. 
            <br />
            <br />
            The password is not used for anything, it only unlocks administrative access.
            <br />
            <br />
            It will look like this: 

            <img src="../assets/admin-access.png" height="236" width="380"></img>

          </div>

          <div style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
          }}>
            <div id="learn" className="btn btn-positive" onClick={e => {
                let windows = remote.BrowserWindow.getAllWindows();
                let closeAfter; 
                for (let i = 0; i < windows.length; i++) {
                    const w = windows[i];
                    if (w) {
                        if (w.getTitle() === "learnWindow") {
                            w.show();
                        } else if (w.getTitle() === "welcomeWindow") {
                            closeAfter = w;
                        }
                    }
                }

                closeAfter.close();
            }} style={{
                flex: 1,
                display: 'none',
                paddingLeft: '40px',
                paddingRight: '40px',
                fontSize: 28,
                margin: '20px',
            }}>Tutorial</div>

            <div id="start" className="btn btn-primary" onClick={e => {
                let alreadyClicked = "No tutorial";
                if (window.document.getElementById("start").innerText != alreadyClicked) {
                    window.document.getElementById("start").innerText = alreadyClicked;
                    window.document.getElementById("learn").style.display = 'block';
                    ipcRenderer.send('welcome-window-ready');
                } else {
                    let windows = remote.BrowserWindow.getAllWindows();
                    for (let i = 0; i < windows.length; i++) {
                        const w = windows[i];
                        if (w && w.getTitle() === "welcomeWindow") {
                            w.close();
                            return;
                        }
                    }
                }
            }} style={{
                flex: 1,
                paddingRight: '40px',
                paddingLeft: '40px',
                fontSize: 28,
                margin: '20px',
            }}>Start</div>

            <br />
        </div>

        <br />

        <div style={{
            textAlign: 'center',
            flex: 1,
        }}>
            ShortcutMagic is an open project. You can contribute! 
            <br />
            Want to check out the <a style={{color: 'blue'}} onClick={(event) => {
                shell.openExternal('https://github.com/codeluggage/ShortcutMagic');
            }}>code</a>? Something <a style={{color: 'blue'}} onClick={(event) => {
                shell.openExternal('https://github.com/codeluggage/ShortcutMagic/issues');
            }}>missing or not working</a>? Do you have a <a style={{color: 'blue'}} onClick={(event) => {
                shell.openExternal('https://github.com/codeluggage/ShortcutMagic/blob/master/CONTRIBUTING.md');
            }}>cool idea or request</a>? We'd love to hear about it! 
            <br />
        </div>
    </div>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};
