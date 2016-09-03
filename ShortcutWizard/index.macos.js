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
} = ReactNative;

const ShortcutWizard = React.createClass({
    componentDidMount() {
        console.log(this.props);
    },
    renderImage(imgURI) {
        return (
            <Image source={{uri: imgURI}} />
            );
    },
    render() {
                    // {this.props.icon.map(this.renderImage)}
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                </Text>

                <Text style={styles.instructions}>
                    The currently running application is {this.props.name}
                </Text>
            </View>
        );
    }
});

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
});

AppRegistry.registerComponent('ShortcutWizard', () => ShortcutWizard);
