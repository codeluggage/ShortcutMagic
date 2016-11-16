'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';
import { PhotoshopPicker } from 'react-color';


export default class Settings extends Component {
    componentWillMount() {
    	ipcRenderer.send('get-settings');

    	ipcRenderer.on('default-preferences', (event, settings) => {
	        this.setState({
	        	alpha: settings.alpha,
	        	alwaysOnTop: settings.alwaysOnTop,
	        	hidePerApp: settings.hidePerApp,
	        	background: '#fff'
	        });
    	});

        this.handleChangeComplete = this.handleChangeComplete.bind(this);
    }

    handleChangeComplete(color) {
    	this.setState({ background: color.hex });
    }

    render() {
    	if (this.state) {
    		return (
    			<div>
	    			<ul>
			        	<li>Transparency: {(this.state.alpha) ? "true" : "false"}</li>
			        	<li>Float on top: {(this.state.alwaysOnTop) ? "true" : "false"}</li>
			        	<li>Hide individually per app: {(this.state.hidePerApp) ? "true" : "false"}</li>
			        	<li>Size and position individually per app: {(this.state.boundsPerApp) ? "true" : "false"}</li>
	    			</ul>
	    			<PhotoshopPicker 
	    				color={this.state.background}
		    			onChangeComplete={this.handleChangeComplete}
	    			/>
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
	    	return (<h1>hello from settings!</h1>);
	    }
    }
}

window.onload = function(){
	ReactDOM.render(<Settings />, document.getElementById("settings-root"));
};
