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
} = ReactNative;



const styles = StyleSheet.create({
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
  row: {
    justifyContent: 'center',
    flexDirection: 'row',
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
    render() {
        this.state = {
            image: require(this.props.applicationIconPath)
        };
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

        return (
            <View style={{flexDirection: 'row'}}>

                <Image style={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'transparent',
                    marginRight: 10,
                }} source={{uri: this.props.applicationIconPath}} />
            </View>
            );
    }
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
