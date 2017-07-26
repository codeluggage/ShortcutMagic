'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';

export default class SurveyView extends Component {
	render() {
		return (
            <div>
                <webview id="gif-upload" src="https://matias49.typeform.com/to/mZTqRz" style={{
                    display: "inline-flex",
                    width: "600px",
                    height: "640px",
                }}></webview>
            </div>
        );
	}
};

window.onload = function(){
  ReactDOM.render(<SurveyView />, document.getElementById("survey-root"));
};
