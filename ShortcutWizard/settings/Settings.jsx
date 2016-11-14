'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';


export default class Settings extends Component {
    componentWillMount() {
    	ipcRenderer.send('get-preferences');

    	ipcRenderer.on('default-preferences', (event, settings) => {
	        this.setState({
	        	alpha: settings.alpha,
	        	alwaysOnTop: settings.alwaysOnTop,
	        	hidePerApp: settings.hidePerApp,
	        });
    	});
    }

    render() {
    	if (this.state) {
    		return (
    			<ul>
		        	<li>{this.state.alpha}</li>
		        	<li>{this.state.alwaysOnTop}</li>
		        	<li>{this.state.hidePerApp}</li>
    			</ul>
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
