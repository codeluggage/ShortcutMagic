'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';

var holdRemote = remote;

export default class WelcomeView extends Component {
    componentWillMount() {
        // this.setState({
        //     accessGranted: false
        // });

        window.document.documentElement.style.backgroundColor = '#3a9ad9';


        ipcRenderer.on('set-background-color', (event, backgroundColor) => {
        	window.document.documentElement.style.backgroundColor = backgroundColor;
        });

        ipcRenderer.on('set-div-color', (event, backgroundColor) => {
            // this.setState({
            //     backgroundColor: backgroundColor
            // });

            window.document.documentElement.style.backgroundColor = backgroundColor;
        });
    }

    render() {

            // style={{
            //     backgroundColor: (this.state.backgroundColor) ? this.state.backgroundColor : '#3a9ad9'
            // }}>
        return (

        <div>
          <div className="pane-group">

            <div className="pane pane-sm sidebar">
              <nav className="nav-group">
                <h5 className="nav-group-title">Favorites</h5>
                <span className="nav-group-item">
                  <span className="icon icon-home"></span>
                  connors
                </span>
                <span className="nav-group-item active">
                  <span className="icon icon-light-up"></span>
                  Photon
                </span>
                <span className="nav-group-item">
                  <span className="icon icon-download"></span>
                  Downloads
                </span>
                <span className="nav-group-item">
                  <span className="icon icon-folder"></span>
                  Documents
                </span>
                <span className="nav-group-item">
                  <span className="icon icon-window"></span>
                  Applications
                </span>
                <span className="nav-group-item">
                  <span className="icon icon-signal"></span>
                  AirDrop
                </span>
                <span className="nav-group-item">
                  <span className="icon icon-monitor"></span>
                  Desktop
                </span>
              </nav>
            </div>

                  <h2>Welcome!</h2>
                  <h4>ShortcutWizard is a simple app that lives along side your other apps.</h4>
                  <h4>Everything about ShortcutWizard can be changed to suit each of your apps - super easy.</h4>
                  <h5>ShortcutWizard does require assistive access in order to run correctly. <a onClick={() => {
                      console.log("todo: request access with some simple script, call to ipcMain");
                  }}>Click here to allow that access.</a></h5>
                  <button onClick={() => {
                      // enabled={this.state.accessGranted}
                var windows = holdRemote.BrowserWindow.getAllWindows();
                for (var i = 0; i < windows.length; i++) {
                    let holdWindow = windows[i];
                    if (holdWindow) {
                              if (holdWindow.getTitle() == "welcomeWindow") {
                    holdWindow.hide();
                              } else if (holdWindow.getTitle() == "mainWindow") {
                                  holdWindow.webContents.send("start-shortcut-window");
                              }
                    }
                }
                  }}>Start showing shortcuts</button>
              </div>
          </div>
        );
    }
};

window.onload = function(){
	ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};
