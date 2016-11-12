'use babel';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';


export default class Settings extends Component {
    componentWillMount() {
        console.log('settings constructor called');
    }

    render() {
    	return (
    		<h1>hello from settings!</h1>
		);
    }
}
