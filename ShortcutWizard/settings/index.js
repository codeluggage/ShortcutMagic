import React from 'react';
import ReactDOM from 'react-dom';
import Settings from './Settings.jsx';

window.onload = function(){
	ReactDOM.render(<Settings />, document.getElementById("settings-root"));
};
