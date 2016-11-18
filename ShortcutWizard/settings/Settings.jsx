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
    	console.log('hit handleChangeComplete with color ', color);
    	this.setState({ background: color.hex });
    }

    render() {
    	if (this.state) {
    		console.log('about to render settings with state: ', this.state);
    		return (
    			<div style={{backgroundColor: this.state.background}}>
			        	<li>
		                    <button id="reload-button" className="simple-button" onClick={() => {
		                    	this.setState({alpha: !this.state.alpha});
		                    }}>
			                    Transparency: {(this.state.alpha) ? "true" : "false"}
		                    </button>
			        	</li>
			        	<li>
		                    <button id="reload-button" className="simple-button" onClick={() => {
		                    	this.setState({alwaysOnTop: !this.state.alwaysOnTop});
		                    }}>
			                    Float on top: {(this.state.alwaysOnTop) ? "true" : "false"}
		                    </button>
			        	</li>

			        	<li>
		                    <button id="reload-button" className="simple-button" onClick={() => {
		                    	this.setState({hidePerApp: !this.state.hidePerApp});
		                    }}>
					        	Hide individually per app: {(this.state.hidePerApp) ? "true" : "false"}
		                    </button>
			        	</li>

			        	<li>
		                    <button id="reload-button" className="simple-button" onClick={() => {
		                    	this.setState({boundsPerApp: !this.state.boundsPerApp});
		                    }}>
					        	Size and position individually per app: {(this.state.boundsPerApp) ? "true" : "false"}
		                    </button>
			        	</li>
			        	<li>
			        		Choose color: 
			    			<PhotoshopPicker 
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
