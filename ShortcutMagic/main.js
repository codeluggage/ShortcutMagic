import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/Home.jsx';

window.onload = function(){
  ReactDOM.render(<Home />, document.getElementById("app"));
}
