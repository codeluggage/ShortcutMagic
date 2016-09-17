/**
* Sample React Native macOS App
* https://github.com/ptmt/react-native-macos
*/

import React from 'react';
import ReactNative from 'react-native-macos';
const {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
    TouchableOpacity,
    RecyclerViewBackedScrollView,
    TouchableHighlight,
    ListView,
} = ReactNative;


var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare, an vix civibus corrumpit referrentur. Te nam case ludus inciderint, te mea facilisi adipiscing. Sea id integre luptatum. In tota sale consequuntur nec. Erat ocurreret mei ei. Eu paulo sapientem vulputate est, vel an accusam intellegam interesset. Nam eu stet pericula reprimique, ea vim illud modus, putant invidunt reprehendunt ne qui.';

/* eslint no-bitwise: 0 */
var hashCode = function(str) {
  var hash = 15;
  for (var ii = str.length - 1; ii >= 0; ii--) {
    hash = ((hash << 5) - hash) + str.charCodeAt(ii);
  }
  return hash;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  thumb: {
    width: 64,
    height: 64,
  },
  text: {
    flex: 1,
  },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
  icon: {
    width: 24,
    height: 24,
  },
  image: {
    width: 50,
    height: 50,
  },
  text: {
    fontSize: 16,
  },
  block: {
    padding: 10,
  },
  button: {
    color: '#007AFF',
  },
  disabledButton: {
    color: '#007AFF',
    opacity: 0.5,
  },
  nativeFeedbackButton: {
    textAlign: 'center',
    margin: 10,
  },
  hitSlopButton: {
    color: 'white',
  },
  wrapper: {
    borderRadius: 8,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  hitSlopWrapper: {
    backgroundColor: 'red',
    marginVertical: 30,
  },
  logBox: {
    padding: 20,
    margin: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  eventLogBox: {
    padding: 10,
    margin: 10,
    height: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  forceTouchBox: {
    padding: 10,
    margin: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  textBlock: {
    fontWeight: '500',
    color: 'blue',
  },
});

// - (BOOL)mouseDownCanMoveWindow;
// {
//   return YES;
// }





const ShortcutWizard = React.createClass({
    componentDidMount() {
        console.log('>>> componentDidMount');
        console.log(this.props);
        console.log(this.props.applicationName);
        console.log(this.props.applicationIconPath);
    },
    componentWillMount() {
        console.log('>>> componentDidMount()');
        console.log((this.props) ? this.props : "No props");
    },
    componentWillUpdate(nextProps, nextState) {
        console.log('>>> componentWillUpdate()');
        console.log((this.props) ? this.props : "No props");
    },
    componentDidUpdate(prevProps, prevState) {
        console.log('>>> componentDidUpdate()');
        console.log((this.props) ? this.props : "No props");
    },
    componentWillUnmount() {
        console.log('>>> componentWillUnmount()');
        console.log((this.props) ? this.props : "No props");
    },
  statics: {
    title: '<ListView>',
    description: 'Performant, scrollable list of data.'
  },

  getInitialState: function() {
    console.log('>>>>>>>>>> hit initial state');
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows(this._genRows({})),
    };
  },

  _pressData: ({}: {[key: number]: boolean}),

  componentWillMount: function() {
    this._pressData = {};
  },

  render: function() {

    this.state = {
        image: this.props.applicationIconPath ? this.props.applicationIconPath : ''
    };

    return (
        <View style={{flexDirection: 'row'}}>
            <Image style={{
                width: 30,
                height: 30,
                backgroundColor: 'transparent',
                marginRight: 10,
            }} source={{uri: this.props.applicationIconPath}} /> 

            <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
            renderSeparator={this._renderSeparator}
            />
        </View>
        );
  },

  _renderRow: function(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
    var rowHash = Math.abs(hashCode(rowData));
    return (
      <TouchableHighlight onPress={() => {
          this._pressRow(rowID);
          highlightRow(sectionID, rowID);
        }}>
        <View>
          <View style={styles.row}>
            <Text style={styles.text}>
              {rowData + ' - ' + LOREM_IPSUM.substr(0, rowHash % 301 + 10)}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  },

  _genRows: function(pressData: {[key: number]: boolean}): Array<string> {
    var dataBlob = [];
    for (var ii = 0; ii < 100; ii++) {
      var pressedText = pressData[ii] ? ' (pressed)' : '';
      dataBlob.push('Row ' + ii + pressedText);
    }
    return dataBlob;
  },

  _pressRow: function(rowID: number) {
    this._pressData[rowID] = !this._pressData[rowID];
    this.setState({dataSource: this.state.dataSource.cloneWithRows(
      this._genRows(this._pressData)
    )});
  },

  _renderSeparator: function(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: adjacentRowHighlighted ? '#3B5998' : '#CCCCCC',
        }}
      />
    );
  }
    // render() {
                    // {this.props.icon.map(this.renderImage)}
        // <TouchableOpacity
        //     style={styles.wrapper}
        //     testID="touchable_feedback_events_button"
        //     accessibilityLabel="touchable feedback events"
        //     accessibilityTraits="button"
        //     accessibilityComponentType="button"
        //     onPress={() => this._appendEvent('press')}
        //     onPressIn={() => this._appendEvent('pressIn')}
        //     onPressOut={() => this._appendEvent('pressOut')}
        //     onLongPress={() => this._appendEvent('longPress')}>
        //     <Text style={styles.button}>
        //       Press Me
        //     </Text>
        //   </TouchableOpacity>




        // <TouchableOpacity
        //     style={styles.wrapper}
        //     testID="touchable_feedback_events_button"
        //     accessibilityLabel="touchable feedback events"
        //     accessibilityTraits="button"
        //     accessibilityComponentType="button">
        //     <Text style={styles.button}>
        //       Press Me
        //     </Text>
        //   </TouchableOpacity>

        // return (
        //     <View style={{flexDirection: 'row'}}>

        //         <Image style={{
        //             width: 30,
        //             height: 30,
        //             backgroundColor: 'transparent',
        //             marginRight: 10,
        //         }} source={{uri: this.props.applicationIconPath}} />
        //     </View>
        //     );
    // }
});

            // <View style={styles.container}>
            //     <Text style={styles.welcome}>
            //     </Text>

            //     <Text style={styles.instructions}>
            //         The currently running application is {this.props.applicationName}
            //     </Text>

            //     <Image source={this.props.applicationIconPath} />
            // </View>


AppRegistry.registerComponent('ShortcutWizard', () => ShortcutWizard);
