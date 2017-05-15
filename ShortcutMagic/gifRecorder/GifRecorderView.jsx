'use babel';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer, remote } from 'electron';

let holdRemote = remote;

export default class GifRecorderView extends Component {
    componentWillMount() {
        ipcRenderer.on('recording-for-shortcut-in-path', (event, listItem, gifPath, appName) => {
            this.setState({
                appName: appName,
                listItem: listItem,
                shortcut: listItem.name,
                recordPath: gifPath,
                gif: null,
            });
        });

        ipcRenderer.on('file-detected', (event, path) => {
            this.setState({
                gif: path
            });
        });
    }

    render() {
        if (!this.state) {
            return (
                <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%',
                }}>
                    <h2>Opening Kap - a neat gif recording app</h2>
                </div>
            );
        }

        if (!this.state.gif) {
            return (
                <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%',
                }}>
                    <h2>Waiting for new {this.state.shortcut} gifs in {this.state.recordPath}</h2>
                </div>
            );
        }

        // html, body {
        //   height: 100%;
        //   margin: 0;
        // }
        //
        // div {
        //   display: flex;
        //   flex-direction: column;
        //   justify-content: center;
        //   align-items: center;
        //   height: 100%;
        // }
        // <div>
        //   <h2>
        //     David
        //   </h2>
        // </div>


        return (
            <div style={{
                height: '100%',
            }}>
                <div style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}>
                    <h2>Found gif! Is this the one you want to add to {this.state.shortcut}?</h2>
                </div>
                <br />
                <button className="btn btn-default" onClick={() => {
                    ipcRenderer.send('save-gif', this.state.gif, this.state.listItem, this.state.appName);
                }}>
                    Save
                </button>

                <button className="btn btn-cancel" onClick={() => {
                    this.setState({
                        gif: null
                    });

                    ipcRenderer.send('keep-recording-gif');
                }}>
                    Keep looking
                </button>

                <button className="btn btn-cancel" onClick={() => {
                    this.setState({
                        gif: null
                    });

                    var windows = holdRemote.BrowserWindow.getAllWindows();
                    for (var i = 0; i < windows.length; i++) {
                        let holdWindow = windows[i];
                        if (holdWindow && holdWindow.getTitle() == "gifRecorderWindow") {
            				holdWindow.hide();
                            break;
                        }
                    }

                    ipcRenderer.send('cancel-gif-recording');
                }}>
                    Cancel recording
                </button>

                <br />

                <img src={`${this.state.gif}`} height="300" width="300"></img>
            </div>
        );
    }
}

window.onload = function(){
	ReactDOM.render(<GifRecorderView />, document.getElementById("gifRecorder-root"));
};
