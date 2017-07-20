'use babel';
import React, { Component } from 'react';
import Electron, { ipcRenderer, remote, shell } from 'electron';
import ReactDOM from 'react-dom';

export default class LearnView extends Component {
	render() {
		return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center',
            }}>
                <img src="../assets/wizard.png" height="128" width="128"></img>
                <h1>Learn ShortcutMagic</h1>

                <ul>
                    <li><a href="#loading">Loading shortcuts for a new app</a></li>
                    <li><a href="#search">Finding shortcuts</a></li>
                    <li><a href="#executing">Running shortcuts</a></li>
                    <li><a href="#favorites">Shortcut favorites</a></li>
                    <li><a href="#hide">Hidng unused shortcuts</a></li>
                </ul>

                <div id="loading">
                    The first time you open or switch to a program, ShortcutMagic will load its shortcuts.
                    <br />
                    It only needs to load the shortcuts once. After the first time, the shortcuts will load quickly. 
                    <br />
                    <img src="../assets/learn/loading.png" height="512" width="512"></img>
                </div>

                <div id="search">
                    The search field lets you search through all the menus and actions that are 
                    <br />
                    possible to do in the program that is focused. Searching is "fuzzy". It will try to
                    <br />
                    find what you are looking for, even if you only type a few characters.
                    <br />
                    <img src="../assets/learn/executing.png" height="512" width="512"></img>
                    <br />
                    The global shortcut to make ShortcutMagic visible (cmd+alt+shift+S) will focus the search
                    <br />
                    field, so you can access the search from anywhere just by pressing the global shortcut. 
                </div>

                <div id="executing">
                    You can run shortcuts 3 ways: 
                    <br />
                    <img src="../assets/learn/executing.png" height="512" width="512"></img>
                    <br />
                    <ol>
                        <li>Using the original shortcut keys. These are listed in the ShortcutMagic window.</li>
                        <li>With ShortcutMagic focused, the 5 shortcuts at the top of the list can be ran with cmd+1, cmd+2 and so on</li>
                        <li>Clicking the play icon on the shortcut in the ShortcutMagic window. This tells ShortcutMagic to run the shortcut keys for you.</li>
                    </ol>
                </div>

                <div id="favorites">
                    By clicking the star on a shortcut, you add it to your favorites. These always show up 
                    <br />
                    at the top of the list unless you are searching for something. 
                    <br />
                    Use this to make your most used shortcuts easily available from the top of the list any time.
                    <br />
                    <img src="../assets/learn/executing.png" height="512" width="512"></img>

                </div>

                <div id="hide">
                    <br />
                    <img src="../assets/learn/executing.png" height="512" width="512"></img>

                </div>


            </div>
        </div>
		);
	}
};

window.onload = function(){
  ReactDOM.render(<LearnView />, document.getElementById("learn-root"));
};
