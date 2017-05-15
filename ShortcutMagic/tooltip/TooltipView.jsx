'use babel';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer, remote } from 'electron';

let holdRemote = remote;

export default class TooltipView extends Component {
    componentWillMount() {
        ipcRenderer.on('set-gif', (event, listItem) => {
            console.log(`setting listItem.gif: ${listItem}`);
            this.setState({
                gif: (listItem) ? listItem.gif : null
            });
        });

        // ipcRenderer.on('reset', (event) => {
        // });

        // this.changeFontDown = this.changeFontDown.bind(this);
    }

    // changeFontDown() {
    //
	// }

    render() {
        // console.log('render() called');
        //
        if (this.state && this.state.gif) {
            return (
                <img src={`${this.state.gif}`} height="auto" width="auto"></img>
            );
        }

        return (
            <div>
                No recorded gifs for this shortcut... Why not make one? Click to start!
            </div>
        );
    }
}

window.onload = function(){
	ReactDOM.render(<TooltipView />, document.getElementById("tooltip-root"));
};
