'use babel';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer, remote } from 'electron';
import sizeOf from 'image-size';

let holdRemote = remote;

export default class TooltipView extends Component {
    componentWillMount() {
        ipcRenderer.on('set-gif', (event, listItem) => {
            var windows = holdRemote.BrowserWindow.getAllWindows();

            for (let i = 0; i < windows.length; i++) {
                let tooltipWindow = windows[i];
                if (tooltipWindow) {
    				if (tooltipWindow.getTitle() == "tooltipWindow") {
                        let mainBounds = mainWindow.getBounds();

                        var dimensions = sizeOf(listItem.gif);
                        let originalBounds = {
                            // Show window left or right of main window depending on screen position:
                            // TODO: Replace hard coded values
                            x: (mainBounds.x > 600) ? mainBounds.x - originalBounds.width : mainBounds.x + mainBounds.width,
                            y: (mainBounds.y > 400) ? mainBounds.y - originalBounds.height : mainBounds.y + mainBounds.height,
                            width: dimensions.width,
                            height: dimensions.height,
                        };

                        console.log(`setting tooltipWindow = ${originalBounds}`);

                        tooltipWindow.setBounds(originalBounds);
    	            }
    			}
            }

            console.log(`setting listItem.gif: ${listItem}`);
            this.setState({
                gif: listItem.gif
            });
        });

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
                <img src={this.state.gif} height="auto" width="auto"></img>
            </div>
        );
    }
}

window.onload = function(){
	ReactDOM.render(<TooltipView />, document.getElementById("tooltip-root"));
};
