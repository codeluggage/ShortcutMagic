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
    textDivider: {
        paddingBottom: 20
    },
    scrollView: {
        backgroundColor: '#888888',
        height: 300,
    },
    view: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
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
        textAlign: 'center',
        paddingBottom: 30
    },
    rowText: {
        marginLeft: 5,
        fontSize: 12,
        textAlign: 'left'
    },
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

                let title = innerShortcuts.title;
                if (!title || title == "") continue;

                let keys = innerShortcuts.keys;
                if (!keys || keys == []) continue;

                shortcutRows.push({
                    "title": title,
                    "keys": keys
                })

                // let mergedShortcut = "";
                // for (let j = 0; j < innerShortcuts.length; j++) {
                //     if (j == 1) {
                //         mergedShortcut = mergedShortcut + " - ";
                //     } else {
                //         mergedShortcut = mergedShortcut + " " + innerShortcuts[j];
                //     }
                // }

                // if (mergedShortcut && mergedShortcut != "") {
                //     shortcutRows.push(mergedShortcut);
                // }
            }
        } else {
            shortcutRows.push({
                title: "No shortcuts yet...",
                keys: [""]
            });
        }

        // Randomize for now... 
        // shortcutRows = randomizeShortcuts(shortcutRows);
        shortcutRows = shortcutRows;
        let holdThis = this;
        // setTimeout(function() {
        //     console.log('setTimeout randomize running... ');
        //     let oldState = holdThis.state;
        //     holdThis.state["shortcuts"] = randomizeShortcuts(holdThis.shortcuts);
        // }, 10);

        let holdSource = shortcutDataSource.cloneWithRows(shortcutRows);
        let newState = {
            shortcutDataSource: holdSource,
            image: this.props.applicationIconPath ? this.props.applicationIconPath : '' // TODO: Replace with default image,
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

    _renderRow: function(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        console.log('Hit render row with row data: ' + JSON.stringify(rowData));
        if (rowData && rowData.title && rowData.keys.length) {
            return (
                <TouchableHighlight onPress={() => {
                        this._pressRow(rowID);
                        highlightRow(sectionID, rowID);
                    }}>
                    <View>
                        <View style={styles.row}>
                            <Text style={styles.rowText}>
                                {rowData.title}
                            </Text>
                            <Text style={styles.textDivider}></Text>
                            <Text style={styles.rowText}>
                                {rowData.keys}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        } else {
            return (
                <View style={styles.row}> </View>
            );
        }
    },

    render: function() {
        console.log('>>> render hit');

        if (this.state && this.props) {
            return (
                <View style={styles.view}>
                    <Text style={styles.titleText}>{ (this.props) ? this.props.applicationName : "Starting..." }</Text>

                    <Image style={styles.image} source={{uri: this.props.applicationIconPath}} />

                    <Text style={styles.textDivider} > </Text>

                    <ListView 
                        dataSource={this.state.shortcutDataSource}
                        ref={(scrollView) => { _scrollView = scrollView; }}
                        automaticallyAdjustContentInsets={false}
                        style={styles.scrollView}
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
