/**
* Sample React Native macOS App
* https://github.com/ptmt/react-native-macos
*/
import TransparentView from './TransparentView.js';
import React from 'react';
import ReactNative from 'react-native-macos';
const {
    AppRegistry,
    StyleSheet,
    Text,
    View,
} = ReactNative;

const Remindo = React.createClass({
    render() {
        return (
            <TransparentView />
            // <View style={styles.container}>
            //     <Text style={styles.welcome}>
            //         Welcome to Remindo!
            //     </Text>
            //     <Text style={styles.instructions}>
            //         In this window, you will see all sorts of simple help messages
            //         - for just the app you are in! {'\n'}
            //         Shortcuts, tips and tricks, to speed up your daily work, 
            //         and let you worry about more important things.
            //     </Text>
            // </View>
            );
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // todo - make translucent
        // backfaceVisibility: "hidden"
        // backgroundColor: 'rgba(255, 255, 255, 0.0)',
        // opacity: 0.1
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
});

AppRegistry.registerComponent('Remindo', () => Remindo);

export default Remindo;
