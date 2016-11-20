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
    	ipcRenderer.send('get-settings');

    	ipcRenderer.on('default-preferences', (event, settings) => {
	        this.setState({
	        	alpha: settings.alpha,
	        	alwaysOnTop: settings.alwaysOnTop,
	        	hidePerApp: settings.hidePerApp,
	        	background: settings.background
	        });
    	});

        this.handleChangeComplete = this.handleChangeComplete.bind(this);
    }

    handleChangeComplete(color) {
    	console.log('hit handleChangeComplete with color ', color);
    	var colorString = makeColorString(color);
    	this.setState({ background: colorString });
    	window.document.documentElement.style.color = colorString;
    	ipcRenderer.send('update-app-setting', {
    		background: colorString
    	});
    }

    // TODO: implement "ok" button
    // TODO: implement a save button
    // TODO: implement a cancel button

    render() {
    	if (this.state) {
    		console.log('about to render settings with state: ', this.state);
    		return (
    			<div style={{backgroundColor: this.state.background}}>
			        	<li>
		                    <button className="simple-button" onClick={() => {
		                    	var alwaysOnTop = !this.state.alwaysOnTop;
		                    	this.setState({alwaysOnTop: alwaysOnTop});
		                    	ipcRenderer.send('update-app-setting', {
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
		                    	ipcRenderer.send('update-app-setting', {
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
		                    	ipcRenderer.send('update-app-setting', {
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
