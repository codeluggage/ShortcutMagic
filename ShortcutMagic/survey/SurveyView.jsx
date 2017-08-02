'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';

export default class SurveyView extends Component {
	render() {
        // TODO: Write logic for not recurring if the last path of the survey is reached in the webview
		return (
            <div>
                <webview id="gif-upload" src="https://matias49.typeform.com/to/mZTqRz" style={{
                    display: "inline-flex",
                    width: "800",
                    height: "600",
                }}></webview>
            </div>
        );
	}
};

window.onload = function(){
  ReactDOM.render(<SurveyView />, document.getElementById("survey-root"));
};
