'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';


// index.html:



    // <script>
    //     require('babel-register');
    //     var ipcRenderer = require('electron').ipcRenderer;
    //     // welcomeWindow.webContents.send('ipc-message', 'heiiiiii');

    //     onload = () => {
    //       const webview = window.document.querySelector('webview');

    //       webview.addEventListener('ipc-message', event => {
    //         console.log('got message for ipc-message');
    //         console.log(event.channel)
    //       });

    //       const loadstart = () => {
    //         console.log('loadstart');
    //       }

    //       const loadstop = () => {
    //         console.log('loadstop');
    //       }

    //       const end = () => {
    //         webview.send('create-windows');
    //       }

    //       webview.addEventListener('did-start-loading', () => {
    //         console.log('did-start-loading called');
    //         console.log('calling: ');
    //         webview.send('log',  'did-start-loading');
    //         loadstart();
    //       });

    //       webview.addEventListener('did-stop-loading', () => {
    //         console.log('did-stop-loading called');
    //         console.log('calling: ');
    //         webview.send('log',  'did-stop-loading');
    //         loadstop();
    //       });

    //       webview.addEventListener('console-message', (e) => {
    //         console.log('Guest page logged a message:', e.message);
    //       });

    //       webview.addEventListener('close', (e) => {
    //         console.log('closed');
    //         console.log(e);
    //       });

    //     }
    // </script>

    // // in body: 
    //   <webview nodeingegration id="welcome-window" src="http://localhost:3000" style="display:inline-flex; width:800px; height:640px"></webview>



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
    // const webview = window.document.querySelector('webview');

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
  }

  render() {
    // TODO: Load based on environment
    // const remoteUrl = "http://localhost:3000";
    const remoteUrl = "https://shortcutmagic.meteorapp.com";

    // autosize minwidth="576" minheight="432"
    // preload="./test.js"

    return (
      <webview id="welcome-window" src={remoteUrl} style={{
        display: "inline-flex",
        width: "800px",
        height: "640px"
      }}></webview>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};

// style={{
//     backgroundColor: (this.state.backgroundColor) ? this.state.backgroundColor : '#3a9ad9'
// }}>