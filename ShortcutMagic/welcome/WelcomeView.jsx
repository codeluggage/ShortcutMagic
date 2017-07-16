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
            if (e.url === 'http://localhost:3000/welcome' || e.url === 'https://shortcutmagic.meteorapp.com/welcome') {
                this.setState({
                    showCloseButton: true
                });
            }
        })
    }

  render() {
    let remoteUrl = (process.env.NODE_ENV === "development") ? "http://localhost:3000/welcome" : "https://shortcutmagic.meteorapp.com/welcome";
    // const remoteUrl = "https://shortcutmagic.meteorapp.com/welcome";

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
                flexDirection: 'row',
                alignContent: 'center',
                textAlign: 'center',
            }}>
                <a id="learn" className="btn btn-positive" onClick={e => {
                    var windows = holdRemote.BrowserWindow.getAllWindows();
                    for (var i = 0; i < windows.length; i++) {
                        const w = windows[i];
                        if (w && w.getTitle() == "learnWindow") {
                            w.show();
                            return;
                        }
                    }
                }} style={{
                    flex: 1,
                    display: 'none',
                }}>Learn ShortcutMagic</a>

                <a id="start" className="btn btn-primary" onClick={e => {
                    let alreadyClicked = "Close window";
                    if (window.document.getElementById("start").text != alreadyClicked) {
                        window.document.getElementById("start").text = alreadyClicked;
                        window.document.getElementById("learn").style.display = 'block';
                        ipcRenderer.send('welcome-window-ready');
                    } else {
                        var windows = holdRemote.BrowserWindow.getAllWindows();
                        for (var i = 0; i < windows.length; i++) {
                            const w = windows[i];
                            if (w && w.getTitle() == "welcomeWindow") {
                                w.close();
                                return;
                            }
                        }
                    }
                }} style={{
                    flex: 1,
                }}>Start</a>

                <br />
                <br />
            </div>

            <div style={{
                textAlign: 'center',
            }}>
                <i>
                    Optional (advanced): 
                    <br />
                    The code for ShortcutMagic is open and freely available.
                    <br />
                    Want to check out the code? Something missing? A cool idea? Clik one of these!
                    <br />
                    <br />
                    <p>
                    <a style={{color: 'blue'}} onClick={(event) => {
                        shell.openExternal('https://github.com/codeluggage/ShortcutMagic');
                    }}>Code</a>
                    </p>
                    <p>
                    <a style={{color: 'blue'}} onClick={(event) => {
                        shell.openExternal('https://github.com/codeluggage/ShortcutMagic/issues');
                    }}>Report problems and share ideas</a>
                    </p>
                    <p>
                    <a style={{color: 'blue'}} onClick={(event) => {
                        shell.openExternal('https://github.com/codeluggage/ShortcutMagic/blob/master/CONTRIBUTING.md');
                    }}>Help the ShortcutMagic community</a>
                    </p>
                    <br />
                </i>
            </div>
        </div>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};
