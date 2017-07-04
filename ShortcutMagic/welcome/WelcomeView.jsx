'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote, shell } from 'electron';
import ReactDOM from 'react-dom';

var holdRemote = remote;

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

  componentDidMount() {
        const webview = window.document.querySelector('webview');

        // webview.addEventListener('ipc-message', event => {
        //   console.log('got message for ipc-message');
        //   console.log(event.channel)
        // });

        // const loadstart = () => {
        //   console.log('loadstart');
        // }

        // const loadstop = () => {
        //   console.log('loadstop');
        // }

        // webview.addEventListener('did-start-loading', loadstart)
        // webview.addEventListener('did-stop-loading', loadstop)

        webview.addEventListener('did-navigate', (e) => {
            // TODO: regex
            if (e.url === 'http://localhost:3000/welcome-permissions' || e.url === 'https://shortcutmagic.meteorapp.com/welcome-permissions') {
                this.setState({
                    showCloseButton: true
                });
            }
        })
    }

  render() {
    // const remoteUrl = (process.env.NODE_ENV === "development") ? "http://localhost:3000/welcome" : "https://shortcutmagic.meteorapp.com/welcome";
    const remoteUrl = "https://shortcutmagic.meteorapp.com/welcome";

    // autosize minwidth="576" minheight="432"
    // preload="./test.js"

    return (
        <div>
            <webview id="welcome-window" src={remoteUrl} style={{
                display: "inline-flex",
                width: "800px",
                height: "640px",
            }}></webview>

            <br />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                textAlign: 'center',
            }}>
                {(this.state && this.state.showCloseButton) ? 
                    <a id="start" className="btn btn-primary" onClick={e => {
                        const clickedStart = "ShortcutMagic is opening... Click again to hide this welcome window.";
                        if (window.document.getElementById("start").text === clickedStart) {
                            var windows = holdRemote.BrowserWindow.getAllWindows();
                            for (var i = 0; i < windows.length; i++) {
                                const w = windows[i];
                                if (w && w.getTitle() == "welcomeWindow") {
                                    w.close();
                                }
                            }
                            return;
                        }

                        ipcRenderer.send('welcome-window-ready');
                        window.document.getElementById("start").text = clickedStart;
                    }} style={{
                        paddingLeft: '40px',
                        paddingRight: '40px',
                        flex: 1,
                    }}>Start</a> : null
                }

                <br />
                <i>
                Optional (advanced): 
                <br />
                The code for ShortcutMagic is open and freely available. Want to take a look, or maybe even help make it better? 
                <br />
                <a style={{color: 'blue'}} onClick={(event) => {
                    event.preventDefault();
                    shell.openExternal('https://github.com/codeluggage/ShortcutMagic');
                }}>Check out the code for ShortcutMagic!</a>
                </i>
                <br />
            </div>
        </div>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};

// style={{
//     backgroundColor: (this.state.backgroundColor) ? this.state.backgroundColor : '#3a9ad9'
// }}>