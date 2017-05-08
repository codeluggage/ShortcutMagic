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
                gif: listItem.gif
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
        if (!this.state) {
            return <div> No state </div>
        }

        return (
            <div style={{ textAlign: 'center' }}>
                <img src={`${__dirname}/../${this.state.gif}`} height="auto" width="auto"></img>
            </div>
        );
    }
}

window.onload = function(){
	ReactDOM.render(<TooltipView />, document.getElementById("tooltip-root"));
};
