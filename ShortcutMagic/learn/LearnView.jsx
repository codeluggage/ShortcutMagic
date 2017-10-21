'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote } from 'electron';
import ReactDOM from 'react-dom';

export default class LearnView extends Component {
	render() {
		return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
            }}>
                <img src="../assets/wizard.png" height="128" width="128"></img>
                <h1>Learn ShortcutMagic</h1>

                <ul style={{fontSize: 28, textAlign: 'left'}}>
                    <li><a href="#loading">Parsing shortcuts for a new app</a></li>
                    <li><a href="#search">Finding shortcuts</a></li>
                    <li><a href="#executing">Running shortcuts</a></li>
                    <li><a href="#favorites">Shortcut favorites</a></li>
                    <li><a href="#hide">Hidng unused shortcuts</a></li>
                </ul>

                <div id="loading" style={{fontSize: 22}}>
                    <h2>Loading shortcuts</h2>
                    The first time you open or switch to a program, ShortcutMagic will load its shortcuts.
                    <br />
                    It only needs to load the shortcuts once. After the first time, the shortcuts will load quickly. 
                    <br />
                    <br />
                    <img src="../assets/learn/loading.gif" height="auto" width="auto"></img>
                    <br />
                </div>

                <div id="search" style={{fontSize: 22}}>
                    <h2>Searching</h2>
                    The search field lets you search through all the menus and actions that are 
                    <br />
                    possible to do in the program that is focused. Searching is "fuzzy". It will try to
                    <br />
                    find what you are looking for, even if you only type a few characters.
                    <br />
                    The global shortcut to make ShortcutMagic visible (cmd+alt+shift+S) will focus the search
                    <br />
                    field, so you can access the search from anywhere just by pressing the global shortcut. 
                    <br />
                    <br />
                    <img src="../assets/learn/search.gif" height="auto" width="auto"></img>
                </div>

                <div id="executing" style={{fontSize: 22}}>
                    <h2>Running</h2>
                    You can run shortcuts 3 ways: 
                    <br />
                    <br />
                    * Using the original shortcut keys. These are listed in the ShortcutMagic window.
                    * With ShortcutMagic focused, the 5 shortcuts at the top of the list can be ran with cmd+1, cmd+2 and so on
                    * Clicking the play icon on the shortcut in the ShortcutMagic window. This tells ShortcutMagic to run the shortcut keys for you.
                    <img src="../assets/learn/execute.gif" height="auto" width="auto"></img>
                    <br />
                </div>

                <div id="favorites" style={{fontSize: 22}}>
                    <h2>Favorites</h2>
                    By clicking the star on a shortcut, you add it to your favorites. These always show up 
                    <br />
                    at the top of the list unless you are searching for something. 
                    <br />
                    Use this to make your most used shortcuts easily available from the top of the list any time.
                    <br />
                    <br />
                    <img src="../assets/learn/favorite.gif" height="auto" width="auto"></img>
                    <br />
                </div>

                <div id="hide" style={{fontSize: 22}}>
                    <h2>Hiding</h2>
                    You can hide the shortcuts you don't use by pressing the eye icon. 
                    <br />
                    This moves the shortcut to the bottom of the list, out of the way.
                    <br />
                    <br />
                    <img src="../assets/learn/hide.gif" height="auto" width="auto"></img>
                    <br />
                </div>
            </div>
		);
	}
};

window.onload = function(){
  ReactDOM.render(<LearnView />, document.getElementById("learn-root"));
};
