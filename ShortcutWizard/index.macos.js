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
                    // {this.props.icon.map(this.renderImage)}
        return (
            <View style={{flexDirection: 'row'}}>
                <Image style={{
                    width: 60,
                    height: 60,
                    backgroundColor: 'transparent',
                    marginRight: 10,
                }} source={this.props.applicationIconPath} />
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
