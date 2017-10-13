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
    const unlockPage = (
      <div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <br />
          <h1>Allowing access to read shortcuts</h1>

          ShortcutMagic needs administrative access.
          <br />
          <br />
          This window will pop up when you click "Start":

          <img src="../assets/admin-access.png" height="236" width="380"></img>
        </div>

        <div style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
        }}>
          <div className="btn btn-primary" onClick={e => {
            ipcRenderer.send('welcome-window-ready');
          }} style={{
            flex: 1,
            paddingRight: '40px',
            paddingLeft: '40px',
            fontSize: 28,
            margin: '10px',
          }}>Start</div>
          <div className="btn btn-negative" onClick={e => {
            ipcRenderer.send('quit');
          }} style={{
            flex: 1,
            paddingRight: '40px',
            paddingLeft: '40px',
            fontSize: 28,
            margin: '10px',
          }}>Cancel</div>
        </div>
      </div>
    );

    const onboarding = (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
      }}>
        <div style={{
          flex: 1,
        }}>
          <br />
          <h1>Welcome to ShortcutMagic!</h1>
          <h3>How often would you like to see shortcut suggestions like these?</h3>
          <br />
        </div>

        <div style={{
          flex: 1,
          backgroundColor: '#aaaaaa',
          border: '5px solid',
          borderColor: '#aaaaaa',
          borderRadius: '4px',
          padding: '20px',
          margin: '8px',
          // marginLeft: '20px',
          // marginRight: '20px',
        }}>
          <img src="../assets/bubble-window.png" style={{
            height: '125px',
          }}></img>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'space-between',
          flexWrap: 'nowrap',
          flex: 3,
        }}>
          <div className="btn btn-primary" style={{
            flex: 1,
            // color: 'white',
            // backgroundColor: '#ebebeb',
            // border: '5px solid',
            margin: '8px',
            // borderColor: '#6db3fd',
            // borderRadius: '4px',
            // padding: '8px',
          }} onClick={(e) => {
            ipcRenderer.send('configure-suggestions', 0);
            this.setState({
              modePicked: true,
            });
          }}>
            <p style={{
              fontSize: 22,
              fontWeight: 400,
              margin: '5px',
            }}>Never</p>
            <ul style={{
              textAlign: 'left',
            }}>
              <li>Hide suggestions</li>
            </ul>
          </div>

          <div className="btn btn-primary" style={{
            flex: 1,
            // color: 'white',
            // backgroundColor: '#ebebeb',
            // border: '5px solid',
            margin: '8px',
            // borderColor: '#6db3fd',
            // borderRadius: '4px',
            // padding: '8px',
          }} onClick={(e) => {
            ipcRenderer.send('configure-suggestions', 1);
            this.setState({
              modePicked: true,
            });
          }}>
            <p style={{
              fontSize: 22,
              fontWeight: 400,
              margin: '5px',
            }}>Sometimes</p>
            <ul style={{
              textAlign: 'left',
            }}>
              <li>Once in a while</li>
            </ul>
          </div>

          <div className="btn btn-primary" style={{
            flex: 1,
            // color: 'white',
            // backgroundColor: '#ebebeb',
            // border: '5px solid',
            margin: '8px',
            // borderColor: '#6db3fd',
            // borderRadius: '4px',
            // padding: '8px',
          }} onClick={(e) => {
            ipcRenderer.send('configure-suggestions', 2);
            this.setState({
              modePicked: true,
            });
          }}>
            <p style={{
              fontSize: 22,
              fontWeight: 400,
              margin: '5px',
            }}>Often</p>
            <ul style={{
              textAlign: 'left',
            }}>
              <li>Each time app switches</li>
              <li>Also once in a while</li>
            </ul>
          </div>

        </div>
      </div>
    );

    const iconComponent = (
      <img src="../assets/wizard.png" style={{
          left: '47%',
          top: '8px',
          height: '30px',
          // transform: 'rotate(-25deg)',
          // transformOrigin: '0% %0',
          position: 'absolute',
      }}></img>
    );

    const helpComponent = (
      <span style={{
        right: '2%',
        top: '1%',
        position: 'absolute',
        fontSize: 24,
      }} type="button" onClick={e => {
        ipcRenderer.send('open-about');
      }} className="icon icon-help-circled"></span>
    );

    return (
      <div style={{
        backgroundColor: `rgba(232, 230, 232, 0.9)`,
        display: 'flex',
        flex: 9,
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
      }}>
        {iconComponent}
        {helpComponent}

        {this.state && this.state.modePicked ? unlockPage : onboarding}
      </div>
    );
  }
};

window.onload = function(){
  ReactDOM.render(<WelcomeView />, document.getElementById("welcome-root"));
};
