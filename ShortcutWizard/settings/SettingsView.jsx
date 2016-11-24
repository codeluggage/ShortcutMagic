'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';
import { SketchPicker } from 'react-color';

function makeColorString(color) {
	return `rgba(${ color.rgb.r }, ${ color.rgb.g }, ${ color.rgb.b }, ${ color.rgb.a })`;
}

export default class Settings extends Component {
    componentWillMount() {
        this.handleChangeComplete = this.handleChangeComplete.bind(this);

        // TODO: Make this async properly so the window will always have proper settings
    	var updateSettings = (event, settings) => {
	        this.setState(settings);
    	};

        ipcRenderer.sendAsync('get-default-settings', updateSettings);
    	ipcRenderer.on('get-settings', updateSettings);
    }

    handleChangeComplete(color) {
    	console.log('hit handleChangeComplete with color ', color);
    	var colorString = makeColorString(color);
    	this.setState({ background: colorString });
    	window.document.documentElement.style.color = colorString;
    	ipcRenderer.send('temporarily-update-app-setting', {
    		background: colorString
    	});
    }

    render() {
    	if (this.state) {
    		console.log('about to render settings with state: ', this.state);
    		return (
    			<div style={{backgroundColor: this.state.background}}>
                    <button style={{color:"white", float:'left'}} className="simple-button" onClick={() => {
                    	console.log('NOT IMPLEMENTED show settings for all apps');
                    }}>Settings for all apps</button>

                    <button style={{color:"white", float:'right'}} className="simple-button" onClick={() => {
                    	console.log('NOT IMPLEMENTED show settings for current app');
                    }}>Settings for {this.state.name}</button>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var alwaysOnTop = !this.state.alwaysOnTop;
	                    	this.setState({alwaysOnTop: alwaysOnTop});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		alwaysOnTop: alwaysOnTop
	                    	});
	                    }}>
		                    Float on top: {(this.state.alwaysOnTop) ? "true" : "false"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var hidePerApp = !this.state.hidePerApp;
	                    	this.setState({hidePerApp: hidePerApp});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		hidePerApp: hidePerApp
	                    	});
	                    }}>
				        	Hide individually per app: {(this.state.hidePerApp) ? "true" : "false"}
	                    </button>
		        	</li>

		        	<li>
	                    <button className="simple-button" onClick={() => {
	                    	var boundsPerApp = !this.state.boundsPerApp;
	                    	this.setState({boundsPerApp: boundsPerApp});
	                    	ipcRenderer.send('temporarily-update-app-setting', {
	                    		boundsPerApp: boundsPerApp
	                    	});
	                    }}>
				        	Size and position individually per app: {(this.state.boundsPerApp) ? "true" : "false"}
	                    </button>
		        	</li>

		        	<li>
		        		Choose color: 
		    			<SketchPicker 
		    				color={this.state.background}
			    			onChangeComplete={this.handleChangeComplete}
		    			/>
		    		</li>

                    <button style={{color:"white", float:'left'}} className="simple-button" onClick={() => {
                    	console.log('sending state as settings to "save-settings"', this.state);
                        ipcRenderer.send('save-settings', this.state);
                        // TODO: close window
                    }}>Save</button>
                    <button style={{color:"white", float:'right'}} className="simple-button" onClick={() => {
                    	console.log('cancelling settings window');
                    	ipcRenderer.send('undo-settings');
                        // TODO: close window
                    }}>Cancel</button>
	    		</div>
			);
	  //   	return (
	  //   		<h1>hello from settings!</h1>
	  //   		<ul>
	  //   			{this.state.map(key, obj) {
	  //   				console.log('mapping over state in settings: ', key, obj);
	  //   				return (<li>{key}: {obj}</li>);
	  //   			}}
	  //   		</ul>
			// );
	    } else {
	    	return (<h1>Settings loading...</h1>);
	    }
    }
}

window.onload = function(){
	ReactDOM.render(<Settings />, document.getElementById("settings-root"));
};
