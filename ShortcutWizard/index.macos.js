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
    initialize() {
        var shortcutDataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
        });
        var shortcutRows = [];
        var shortcuts = this.props.shortcuts;

        if (shortcuts) {
            for (var key of Object.keys(shortcuts)) {
                // console.log(`>>>> ECHOOO key: ${key}`);
                shortcutRows.push(`[${shortcuts[key].join(" + ")}]: ${key}`);
            }
        }

        var newState = {
            shortcutDataSource: shortcutRows.length ? shortcutDataSource.cloneWithRows(shortcutRows) : null,
            image: this.props.applicationIconPath ? this.props.applicationIconPath : ''
        };
        newState.fullyInitialized = (newState.shortcutDataSource && newState.image); // TODO: kan jeg lese newState her?

        if (this.state && this.state.fullyInitialized) {
            console.log('Already initialized, comparing against new props...');
            if (this.state == newState) {
                console.log('Old and new props are the same, skipping');
                return;
            }
        }

        console.log('>>> Initializing... ');
        console.log(`props: [${typeof this.props}]: ${JSON.stringify(this.props)}`);
        console.log(`props.applicationName: [${typeof this.props.applicationName}]: ${this.props.applicationName}`);
        console.log(`props.applicationIconPath: [${typeof this.props.applicationIconPath}]: ${this.props.applicationIconPath}`);
        console.log(`props.shortcuts: [${typeof this.props.shortcuts}]: ${JSON.stringify(this.props.shortcuts)}`);

        this.state = newState;
    },

    componentDidMount() {
        console.log('>>> componentDidMount');
        this.initialize();
    },

    componentWillMount() {
        console.log('>>> componentWillMount()');
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

    _pressData: ({}: {[key: number]: boolean}),

    componentWillMount: function() {
        this._pressData = {};
    },

    _renderRow: function(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        return (
            <TouchableHighlight onPress={() => {
                this._pressRow(rowID);
                highlightRow(sectionID, rowID);
            }}>
                <View>
                    <View style={styles.row}>
                        <Text style={styles.text}>
                            {rowData}
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
        console.log('pressed row: ' + rowID);

        this._pressData[rowID] = !this._pressData[rowID];
        // this.setState({shortcutDataSource: this.state.shortcutDataSource.cloneWithRows(
        //     this._genRows(this._pressData)
        // )});
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
    }, 

    render: function() {
        this.initialize();

        return (
            <View style={{flexDirection: 'row'}}>
                <Text>ShorcutWizard - {this.props.applicationName} ({this.props.applicationIconPath})</Text>
                <Image style={{
                        width: 30,
                        height: 30,
                        backgroundColor: 'transparent',
                        marginRight: 10,
                    }} 
                    source={{uri: this.props.applicationIconPath}} 
                /> 

                <ListView dataSource={this.state.shortcutDataSource}
                    renderRow={this._renderRow}
                    renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
                    renderSeparator={this._renderSeparator} 
                />
            </View>
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
