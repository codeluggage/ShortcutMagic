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
        let shortcutRows = [];
        let shortcuts = this.props.shortcuts;
        // console.log('|||||||||||| props: ' + JSON.stringify(this.props));
        // console.log('|||||||||||| shortcuts: ' + JSON.stringify(shortcuts));

        if (shortcuts) {
            let shortcutNames = Object.keys(shortcuts);
            for (var i = 0; i < shortcutNames.length; i++) {
                // console.log('loop.... ' + i);
                let innerShortcuts = shortcuts[shortcutNames[i]];
                // console.log('innertshorcuts |||| = ' + JSON.stringify(innerShortcuts));
                if (!innerShortcuts || !innerShortcuts == []) continue;

                let name = innerShortcuts.name;
                if (!name || name == "") continue;

                shortcutRows.push(innerShortcuts.name);

                // let keys = innerShortcuts.shortcuts;
                // if (!keys || keys == []) continue;

                // Ignore position in React side for now
                // let position = innerShortcuts.position;
                // if (!position || position == [] || position == "") continue;

                // shortcutRows.push({
                //     "name": name,
                //     "keys": keys,
                //     // "position": position
                // });

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
            // }
        } 
    } else if (!shortcutRows.length) {
            shortcutRows.push({
                name: "No shortcuts yet..."
            });
        }

        // Randomize for now... 
        // shortcutRows = randomizeShortcuts(shortcutRows);
        // shortcutRows = shortcutRows;
        // let holdThis = this;
        // setTimeout(function() {
        //     console.log('setTimeout randomize running... ');
        //     let oldState = holdThis.state;
        //     holdThis.state["shortcuts"] = randomizeShortcuts(holdThis.shortcuts);
        // }, 10);

        if (!this.state) {
            // console.log('>>>>>>>> INSIDE !this.state');
            this.state = {
                shortcutDataSource: new ListView.DataSource({
                    rowHasChanged: (row1, row2) => row1 !== row2
                })
            };
            // console.log('>>>>>>>> INSIDE !this.state AFTER: ' + JSON.stringify(this.state));
        }

        // console.log('>>>>>>>> ABOUT TO SET STATE ' + JSON.stringify(this.state));
        this.state = {
            shortcutDataSource: this.state.shortcutDataSource.cloneWithRows(shortcutRows),
            image: this.props.applicationIconPath ? this.props.applicationIconPath : '', // TODO: Replace with default image,
            shortcuts: shortcuts
        };
        // console.log('>>>>>>>> ABOUT TO SET STATE, AFTER ' + JSON.stringify(this.state));
    },

    componentWillMount: function() {
        this._pressData = {};
        // this.initialize();
    },
    
    componentDidMount() {
        console.log('>>> componentDidMount');
        this.initialize();
    },

    componentWillUpdate(nextProps, nextState) {
        console.log('>>> componentWillUpdate() with props: ' + (this.props) ? this.props : "No props" +
            " nextState: " + (nextState) ? nextState.length : "No next state" + 
            " nextProps: " + (nextProps) ? nextProps.length : "No next props");
        // this.initialize();
    },

    componentDidUpdate(prevProps, prevState) {
        console.log('>>> componentDidUpdate() ');
        // this.initialize();
    },

    componentWillUnmount() {
        console.log('>>> componentWillUnmount() props:' + (this.props) ? this.props.length : "No props");
    },

    _pressData: ({}: {[key: number]: boolean}),

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

    _renderRow: function(rowData, sectionID, rowID, highlightRow: (sectionID: number, rowID: number) => void) {
        console.log('Hit render row with row data: ' + JSON.stringify(rowData));
        if (rowData) {
            return (
                <TouchableHighlight onPress={() => {
                        this._pressRow(rowID);
                        highlightRow(sectionID, rowID);
                    }}>
                    <View>
                        <View style={styles.row}>
                            <Text style={styles.rowText}>
                                {rowData.name}
                            </Text>
                            <Text style={styles.textDivider}></Text>
                            <Text style={styles.rowText}>
                                {rowData.mod}
                                {rowData.glyph}
                                {rowData.char}
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
        this.initialize();
        
        console.log('>>> render hit');
        if (this.state) {
            console.log('json stringify state: ' + JSON.stringify(this.state));
        } else {
            console.log('state is ' + this.state);
        }

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
