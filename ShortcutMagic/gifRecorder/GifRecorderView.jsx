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
            });
        });

        ipcRenderer.on('file-detected', (event, path) => {
            this.setState({
                newGif: path
            });
        });
    }

    render() {
        if (!this.state) {
            return <div> Opening Kap - a neat gif recording app </div>
        }

        if (!this.state.newGif) {
            return (
                <div style={{ textAlign: 'center' }}>
                    Waiting for new {this.state.shortcut} gifs in {this.state.recordPath}
                </div>
            );
        }

        return (
            <div style={{ textAlign: 'center' }}>
                Found gif! Is this the one you want to add to {this.state.shortcut}?
                <br />
                <button className="btn btn-default" onClick={() => {
                    ipcRenderer.send('save-gif', this.state.newGif, this.state.listItem, this.state.appName);

                    this.setState({});
                }}>
                    Save
                </button>
                <button className="btn btn-cancel" onClick={() => {
                    this.setState({
                        newGif: undefined
                    });

                    var windows = holdRemote.BrowserWindow.getAllWindows();
                    for (var i = 0; i < windows.length; i++) {
                        let holdWindow = windows[i];
                        if (holdWindow && holdWindow.getTitle() == "gifRecorderWindow") {
            				holdWindow.hide();
                            break;
                        }
                    }
                }}>
                    Cancel
                </button>
                <br />
                <br />

                <img src={`${this.state.newGif}`} height="250" width="250"></img>
            </div>
        );
    }
}

window.onload = function(){
	ReactDOM.render(<GifRecorderView />, document.getElementById("gifRecorder-root"));
};
