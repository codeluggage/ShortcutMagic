'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';

var holdRemote = remote;

export default class WelcomeView extends Component {
  componentWillMount() {
    this.setState({
      accessGranted: false
    });

    window.document.documentElement.style.backgroundColor = '#3a9ad9';

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

    webview.addEventListener('ipc-message', event => {
      console.log('got message for ipc-message');
      console.log(event.channel)
    });

    const loadstart = () => {
      console.log('loadstart');
    }

    const loadstop = () => {
      console.log('loadstop');
    }

    webview.addEventListener('did-start-loading', loadstart)
    webview.addEventListener('did-stop-loading', loadstop)
  }

  render() {
    return (
      <webview id="welcome-window" src="http://localhost:3000" style="display:inline-flex; width:640px; height:480px"></webview>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};

// style={{
//     backgroundColor: (this.state.backgroundColor) ? this.state.backgroundColor : '#3a9ad9'
// }}>