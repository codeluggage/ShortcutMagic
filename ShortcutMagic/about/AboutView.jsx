'use babel';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class AboutView extends Component {
  render() {
    return (
      <div style={{
        backgroundColor: `rgba(232, 230, 232, 0.9)`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
      }}>
        <h1>About ShortcutMagic</h1>
        <br />
        <br />

        <img src="../assets/wizard.png" style={{
          height: '100px',
        }}></img>
        <br />

        <div>
          ShortcutMagic is an open project. You can contribute! 
          <br />
          <br />
          Check out the <a style={{color: 'blue'}} onClick={(event) => {
            shell.openExternal('https://github.com/codeluggage/ShortcutMagic');
          }}>code</a>!
          <br />
          Report something <a style={{color: 'blue'}} onClick={(event) => {
            shell.openExternal('https://github.com/codeluggage/ShortcutMagic/issues');
          }}>missing or not working</a>.
          <br />
          Have a <a style={{color: 'blue'}} onClick={(event) => {
            shell.openExternal('https://github.com/codeluggage/ShortcutMagic/blob/master/CONTRIBUTING.md');
          }}>cool idea or request</a>? 
          <br />
          <br />
          <b><i>I would love to hear your feedback!</i></b>
          <br />
          <br />
        </div>
      </div>
      );
  }
};

window.onload = function(){
  ReactDOM.render(<AboutView />, document.getElementById("about-root"));
};
