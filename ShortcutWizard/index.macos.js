import React from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
    TouchableOpacity,
    RecyclerViewBackedScrollView,
    TouchableHighlight,
    ListView,
} from 'react-native-macos';

const styles = StyleSheet.create({
    view: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    row: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 5,
        backgroundColor: 'white',
    },
    image: {
        width: 110,
        height: 110,
        backgroundColor: 'white',
        // flex: 1,
        // marginRight: 10,
    },
    titleText: {
        fontWeight: '700',
        fontSize: 20,
        textAlign: 'center'
    },
    rowText: {
        marginLeft: 5,
        fontSize: 12,
        textAlign: 'left'
    },
    // thumb: {
    //     width: 64,
    //     height: 64,
    // },
    // container: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: '#F5FCFF',
    // },
    // welcome: {
    //     fontSize: 20,
    //     textAlign: 'center',
    //     margin: 2,
    // },
    // instructions: {
    //     textAlign: 'center',
    //     color: '#333333',
    //     marginBottom: 5,
    // },
    // icon: {
    //     width: 24,
    //     height: 24,
    // },
    // block: {
    //     padding: 10,
    // },
    // button: {
    //     color: '#007AFF',
    // },
    // disabledButton: {
    //     color: '#007AFF',
    //     opacity: 0.5,
    // },
    // nativeFeedbackButton: {
    //     textAlign: 'center',
    //     margin: 10,
    // },
    // hitSlopButton: {
    //     color: 'white',
    // },
    // wrapper: {
    //     borderRadius: 8,
    // },
    // wrapperCustom: {
    //     borderRadius: 8,
    //     padding: 6,
    // },
    // hitSlopWrapper: {
    //     backgroundColor: 'red',
    //     marginVertical: 30,
    // },
    // logBox: {
    //     padding: 20,
    //     margin: 10,
    //     borderWidth: StyleSheet.hairlineWidth,
    //     borderColor: '#f0f0f0',
    //     backgroundColor: '#f9f9f9',
    // },
    // eventLogBox: {
    //     padding: 10,
    //     margin: 10,
    //     height: 120,
    //     borderWidth: StyleSheet.hairlineWidth,
    //     borderColor: '#f0f0f0',
    //     backgroundColor: '#f9f9f9',
    // },
    // forceTouchBox: {
    //     padding: 10,
    //     margin: 10,
    //     borderWidth: StyleSheet.hairlineWidth,
    //     borderColor: '#f0f0f0',
    //     backgroundColor: '#f9f9f9',
    //     alignItems: 'center',
    // },
});


function randomizeShortcuts(shortcutRows) {
    if (!shortcutRows) return undefined;
    let currentIndex = shortcutRows.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = shortcutRows[currentIndex];
        shortcutRows[currentIndex] = shortcutRows[randomIndex];
        shortcutRows[randomIndex] = temporaryValue;
    }

    return shortcutRows;
};




const ShortcutWizard = React.createClass({
    initialize() {
        let shortcutDataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
        });
        let shortcutRows = [];
        let shortcuts = this.props.shortcuts;

        if (shortcuts) {
            for (let i = 0; i < shortcuts.length; i++) {
                let innerShortcuts = shortcuts[i];
                if (!innerShortcuts || innerShortcuts == []) continue;

                let title = innerShortcuts[0];
                if (!title || title == "") continue;

                let mergedShortcut = "";
                for (let j = 0; j < innerShortcuts.length; j++) {
                    if (j == 1) {
                        mergedShortcut = mergedShortcut + " - ";
                    } else {
                        mergedShortcut = mergedShortcut + " " + innerShortcuts[j];
                    }
                }

                if (mergedShortcut && mergedShortcut != "") {
                    shortcutRows.push(mergedShortcut);
                }
            }
        } else {
            shortcutRows.push("No shortcuts yet...");
        }

        // Randomize for now... 
        shortcutRows = randomizeShortcuts(shortcutRows);
        let holdThis = this;
        setTimeout(function() {
            console.log('setTimeout randomize running... ');
            holdThis.state = {
                ...holdThis.state,
                shortcuts: randomizeShortcuts(holdThis.shortcuts)
            };
        }, 10);

        let holdSource = shortcutDataSource.cloneWithRows(shortcutRows);
        let newState = {
            shortcutDataSource: holdSource,
            image: this.props.applicationIconPath ? this.props.applicationIconPath : '' // TODO: Replace with default image
        };

        // newState.fullyInitialized = (newState.shortcutDataSource && newState.image); 

        // if (this.state && this.state.fullyInitialized) {
        //     console.log('Already initialized, comparing against new props...');
        //     if (this.state == newState) {
        //         console.log('Old and new props are the same, skipping');
        //         return;
        //     }
        // }

        console.log('>>> Initializing... ');
        console.log('newState length: ');
        console.log(Object.keys(newState).length);
        this.state = newState;
    },

    componentWillMount() {
        console.log('>>> componentWillMount() with props: ' + (this.props) ? this.props.length : "No props");
    },

    componentDidMount() {
        console.log('>>> componentDidMount');
        this.initialize();
    },

    componentWillUpdate(nextProps, nextState) {
        console.log('>>> componentWillUpdate() with props: ' + (this.props) ? this.props : "No props" +
            " nextState: " + (nextState) ? nextState.length : "No next state" + 
            " nextProps: " + (nextProps) ? nextProps.length : "No next props");
    },

    componentDidUpdate(prevProps, prevState) {
        console.log('>>> componentDidUpdate() ');
        this.initialize();
    },

    componentWillUnmount() {
        console.log('>>> componentWillUnmount() props:' + (this.props) ? this.props.length : "No props");
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
                        <Text style={styles.rowText}>
                            {rowData}
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
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
        console.log('>>> render hit');

        if (this.state && this.props) {
            return (
                <View style={styles.view}>
                    <Text style={styles.titleText}>{ (this.props) ? this.props.applicationName : "Starting..." }</Text>

                    <Image style={styles.image} source={{uri: this.props.applicationIconPath}} />

                    <Text>{'\n'}</Text>

                    <ListView dataSource={this.state.shortcutDataSource}
                        renderRow={this._renderRow}
                        renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
                        renderSeparator={this._renderSeparator} 
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.view}>
                </View>
            );
        }
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
