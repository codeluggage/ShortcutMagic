'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote, shell } from 'electron';
import ReactDOM from 'react-dom';

export default class LearnView extends Component {
	render() {
		return (
            <webview id="learn-window" src="https://shortcutmagic.meteorapp.com/tutorial1" style={{
                display: "inline-flex",
                width: "800px",
                height: "800px",
            }}></webview>
		);
	}
};

window.onload = function(){
  ReactDOM.render(<LearnView />, document.getElementById("learn-root"));
};
