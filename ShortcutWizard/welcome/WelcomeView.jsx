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


		// ipcRenderer.on('update-window-ids', (event, newWindowIds) => {
		// 	console.log("inside WelcomeView.js update-window-ids");
        //     this.windowIds = newWindowIds;
        // });
        // 
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
			            if (holdWindow && holdWindow.getTitle() == "welcomeWindow") {
							holdWindow.hide();
			            }
			        }
                }}>Start showing shortcuts</button>
            </div>
        );
    }
};

window.onload = function(){
	ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};
