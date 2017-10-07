'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote, shell } from 'electron';
import ReactDOM from 'react-dom';

export default class WelcomeView extends Component {
  componentWillMount() {
    this.setState({
      accessGranted: false
    });
  }

  render() {
    return (
      <div style={{
        backgroundColor: `rgba(232, 230, 232, 0.9)`,
        display: 'flex',
        flex: 9,
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
      }}>
      <span style={{
        right: '6px',
        top: '3px',
        position: 'absolute',
        fontSize: 24,
      }} type="button" onClick={e => {
        ipcRenderer.send('open-about');
      }} className="icon icon-help-circled"></span>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <h1>Running ShortcutMagic</h1>
        <br />

        To run ShortcutMagic, it needs administrative access which is unlocked with your computer password. 
        <br />
        The password is not used for anything, it only unlocks administrative access.
        <br />
        <br />
        It will look like this: 

        <img src="../assets/admin-access.png" height="236" width="380"></img>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
      }}>
        <div className="btn btn-negative" onClick={e => {
          ipcRenderer.send('quit');
        }} style={{
          flex: 1,
          paddingRight: '40px',
          paddingLeft: '40px',
          fontSize: 28,
          margin: '10px',
        }}>Cancel</div>
        <div className="btn btn-primary" onClick={e => {
          ipcRenderer.send('welcome-window-ready');
        }} style={{
          flex: 1,
          paddingRight: '40px',
          paddingLeft: '40px',
          fontSize: 28,
          margin: '10px',
        }}>Start</div>
      </div>
    </div>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};
