// @flow
import React from 'react';
import { render } from 'react-dom';
import './settings.css';


class SettingsView extends Component {
	// TODO: load state with redux/nedb
    state = {
    	hideDockIcon: false,
    	alwaysOnTop: true,
    	alpha: 0.5,
    };

    componentWillMount = () => {
    	console.log('Settings - componentWillMount()');
    }

    render = () => {
    	return (
    		<div>
    			Hello from settings!
    			Hide dock icon: {this.state.hideDockIcon}
    			Window on top: {this.state.alwaysOnTop}
    			Alpha: {this.state.alpha}
    		</div>
		);
    }
};

render(
  <SettingsView />,
  document.getElementById('settings-root')
);
