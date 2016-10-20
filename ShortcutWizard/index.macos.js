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
    Button,
} from 'react-native-macos';

// ======================= Bridge to native
import { NativeModules } from 'react-native';

var ShortcutWizard = {
    NativeApplescriptManager: NativeModules.SWApplescriptManager,
    NativeClick: NativeModules.SWMenuExecutor 
};



// <<<<<<<<<<<<<<<<<<<<<<< Bridge to native


const styles = StyleSheet.create({
    shortcutNameStyle : {
        textAlign: 'right',
        color: 'blue',
        fontWeight: '400',
    },
    textDivider: {
        paddingBottom: 20
    },
    scrollView: {
        backgroundColor: '#EFEFEF',
        height: 360,
    },
    view: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF',
    },
    row: {
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 2,
        backgroundColor: '#EFEFEF',
    },
    image: {
        width: 35,
        height: 35,
        backgroundColor: 'white',
        // flex: 1,
        // marginRight: 10,
    },
    titleText: {
        fontWeight: '700',
        fontSize: 20,
        textAlign: 'center',
        paddingBottom: 10
    },
    rowText: {
        marginLeft: 5,
        fontSize: 12,
        textAlign: 'left',
        color: 'blue'
    },
});

// TODO: Make additional explanations (beginner mode?) a setting
// const modifierStrings = {
//     cmd: "⌘ (Command) ",
//     shift: "⇧ (Shift) ",
//     alt: "⌥ (Alt) ",
//     ctrl: "⌃ (Control) "
// };
const modifierStrings = {
    cmd: "⌘",
    shift: "⇧",
    alt: "⌥",
    ctrl: "⌃"
};


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


const ShortcutWizardApp = React.createClass({
    getInitialState () {
        var ds = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2
        });

        return {
            ds: ds,
            dataSource: ds.cloneWithRows(["Loading shortcuts", "Please wait :)"]),
            loading: undefined
        };
    },
    // _genRows: function(props) {
    //     console.log('--- _genRows called, with props: ' + JSON.stringify(props));

    // },
    initialize() {
        console.log('>> initialize hit');
        let newState = {};
        let shortcutRows = [];
        let shortcuts = (this.props) ? this.props.shortcuts : null;

        let dataSource;
        if (!this.state || !this.state.datasource) {
            dataSource = new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2
            });
        } else {
            dataSource = this.state.dataSource;
        }

        if (shortcuts) {
            // console.log('|||||||||||| props: ' + JSON.stringify(this.props));
            // console.log('|||||||||||| shortcuts: ' + JSON.stringify(shortcuts));
            let shortcutNames = Object.keys(shortcuts);
            for (var i = 0; i < shortcutNames.length; i++) {
                // console.log('looping : ' + i);
                // console.log('looping >: ' + shortcutNames[i]);
                let innerShortcuts = shortcuts[shortcutNames[i]];
                // console.log('looping >: ' + innerShortcuts);

                if (!innerShortcuts || innerShortcuts == []) continue;

                let name = innerShortcuts.name;
                // console.log('looping >: ' + name);

                if (!name || name == "") continue;

                shortcutRows.push(name);

                // console.log('looping genrows: ' + name);

                // let mergedString = "";
                // let innerValues = Object.keys(innerShortcuts);
                // for (var j = 0; j < innerValues.length; j++) {
                //     let innerKey = innerValues[j];
                //     let innerValue = innerShortcuts[innerValues[j]];
                //     // console.log('--- inner loop 2 key: ' + innerKey + ' val: ' + innerValue);
                //     if (!innerKey || !innerValue) continue;

                //     mergedString += innerKey + ": " + innerValue + " ";
                // }

                // if (mergedString == "") continue;

                // console.log('---- made it through, writing string: ' + mergedString);
                // shortcutRows.push(mergedString);
            } 

            // console.log('Returning from initialize, "genrows" length: ' + shortcutRows.length);
            if (shortcutRows.length == 0) {
                shortcutRows.push("No shortcuts read");
            }

            // Randomize for now... 
            shortcutRows = randomizeShortcuts(shortcutRows);
            // let holdThis = this;
            // setTimeout(function() {
            //     shortcutRows = randomizeShortcuts(holdThis.shortcutRows)
            //     var newState = {
            //         ...holdThis.state,
            //         shortcutRows: shortcutRows,
            //         dataSource: dataSource.cloneWithRows(shortcutRows),
            //     };
            //     holdThis.state = newState;
            // }, 10);

            newState = {
                shortcutRows: shortcutRows,
                // dataSource: dataSource.cloneWithRows(["1", "2", "3"]),
                dataSource: dataSource.cloneWithRows(shortcutRows),
                // dataSource: shortcutRows.length ? this.state.ds.cloneWithRows(shortcutRows) : null,
                image: this.props.applicationIconPath ? this.props.applicationIconPath : ''
            };

            // console.log('--- setting state to: ' + JSON.stringify(newState));
        } else {
            shortcutRows = ["Welcome to Shortcut Wizard!"];
            newState = {
                shortcutRows: shortcutRows,
                dataSource: dataSource.cloneWithRows(shortcutRows),
                image: this.props.applicationIconPath ? this.props.applicationIconPath : ''
            };
        }

        console.log('>> initialize - setting state for name: ' + this.props.applicationName);
        this.state = newState;
    },

    componentWillMount: function() {
        console.log('componentWillMount');
        this._pressData = {};
        // this.initialize();
    },
    
    componentDidMount() {
        console.log(' componentDidMount');
        this.initialize();
    },

    componentWillUpdate(nextProps, nextState) {
        console.log('componentWillUpdate');
        // console.log(' componentWillUpdate() with props: ' + (this.props) ? this.props : "No props" +
        //     " nextState: " + (nextState) ? nextState.length : "No next state" + 
        //     " nextProps: " + (nextProps) ? nextProps.length : "No next props");
        // this.initialize();
    },

    componentDidUpdate(prevProps, prevState) {
        console.log(' componentDidUpdate() ');
        // this.initialize();
    },

    componentWillUnmount() {
        console.log(' componentWillUnmount() props:' + (this.props) ? this.props.length : "No props");
    },

    _pressData: ({}: {[key: number]: boolean}),

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

    // componentDidReceiveProps() {
        // this.initialize();
        // console.log(' componentWillReceiveProps: ' + JSON.stringify(nextProps));
        // console.log('componentWillReceiveProps( nextProps )' + JSON.stringify(nextProps));
        // this.initializeWithProps(nextProps);

        // this.setState({
        //     dataSource: this.state.dataSource.cloneWithRows(this._genRows(nextProps)),
        //     image: this.props.applicationIconPath ? this.props.applicationIconPath : '', // TODO: Replace with default image,
        // });

        // this.setState({
        //     dataSource: this.state.dataSource.cloneWithRows( nextProps.data )
        // });
    // },


    // TODO pseudocode::::
    // imageDrag: function(nextMousePos) {
    //     if (dragStarts) {
    //         self.props.dragMessage = "Set position and size for this specific app";
    //     }

    //     if (dragEnds) {
    //         self.props.updatePosition = nextMousePos;
    //         self.props.dragMessage = undefined;
    //     }

    //     if (dragMoves) {
    //         self.props.updatePosition = nextMousePos;
    //     }
    // }

    _renderLoadingRow: function(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        // console.log('Hit render row with row data: ' + JSON.stringify(rowData));
        // console.log('Hit render row with : ' + sectionID + " " + rowID);
        if (rowData) {
            return (
                <TouchableHighlight onPress={() => {}}>
                    <Text style={styles.row}>
                        {rowData}
                    </Text>
                </TouchableHighlight>
            );
        }
    },

    _renderRow: function(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
        // console.log('Hit render row with row data: ' + JSON.stringify(rowData));
        // console.log('Hit render row with : ' + sectionID + " " + rowID);
        if (rowData) {
            let shortcut = (this.props && this.props.shortcuts) ? this.props.shortcuts[rowData] : undefined;
            // console.log('>> hit renderrow with shortcut: ' + JSON.stringify(shortcut) + " "  + shortcut);
            // console.log('>> and props: ' + this.props + " " + JSON.stringify(this.props));

            // TODO: Clean up conditional mess

            let titleAndMenu = shortcut ? (
                <Text style={styles.shortcutNameStyle}>[{shortcut.menuName}] - {shortcut.name}</Text>
            ) : undefined;


            let shortcutKeys = shortcut ? (
                <Text style={{
                    color: 'green',
                    fontWeight: 'bold',
                    paddingBottom: 8,
                    paddingTop: 8
                }}>
                    {shortcut.mod ? shortcut.mod : undefined}
                    {shortcut.glyph ? shortcut.glyph : undefined}
                    {shortcut.char ? (shortcut.mod ? shortcut.char : modifierStrings["cmd"] + shortcut.char) : undefined}
                </Text>
            ) : undefined;

            let favoriteToggle = shortcut ? (
                <View>
                    <Button 
                        title={"F" + shortcut.favorite}
                        onClick={() => {
                            shortcut.favorite = (typeof shortcut.favorite == 'undefined' || shortcut.favorite == 9) ? 1 : shortcut.favorite + 1;
                            console.log('CLICKED ----------------- ', shortcut.favorite);
                        }}
                    />
                </View>
            ) : undefined;


            return (
                <TouchableHighlight onPress={() => {
                    this._pressData[rowID] = !this._pressData[rowID];
                    // highlightRow(sectionID, rowID);
                    ShortcutWizard.NativeClick.clickMenu(this.props.applicationName, shortcut);
                }}>
                    <View style={{
                        flexDirection: 'row',
                    }}>
                        <View style={{
                            flexDirection: 'column',
                            paddingTop: 4,
                        }}>
                            <Text style={{}}>
                                {titleAndMenu}
                            </Text>
                            {shortcutKeys}
                        </View>

                        {favoriteToggle}
                    </View>
                </TouchableHighlight>
            );
        }
    },

    render: function() {
        this.initialize();

        // if (this.state) {
        //     console.log('json stringify state: ' + JSON.stringify(this.state));
        // } else {
        //     console.log('NO STATE IN RENDER');
        // }


        if (this.state && this.props && this.props.shortcuts) {
        console.log('>>> render hit with loading: ', this.state.loading);
            // TODO: create better "state system" for rendering:

            if (this.state.loading) {
                return (
                    <View style={styles.view}>
                        <Text style={{paddingBottom: 3}} > </Text>

                        <Text style={styles.titleText}>{this.props.applicationName}</Text>

                        <View style={{flexDirection: 'column'}}>
                            <Image style={styles.image} source={{uri: this.props.applicationIconPath}} />
                            <Button 
                                title="Reloading..."
                                onClick={() => {}}
                            />
                        </View>

                        <Text style={{paddingBottom: 1}} > </Text>

                        <ListView 
                            style={styles.scrollView}
                            dataSource={this.state.dataSource.cloneWithRows(["Click any of these to see where it is - then press enter to click the menu"])}
                            ref={(scrollView) => { _scrollView = scrollView; }}
                            automaticallyAdjustContentInsets={false}
                            renderRow={this._renderLoadingRow}
                            renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
                        />
                    </View>
                );
            } else {
                return (
                    <View style={styles.view}>
                        <Text style={{paddingBottom: 3}} > </Text>

                        <Text style={styles.titleText}>{this.props.applicationName}</Text>

                        <View style={{flexDirection: 'column'}}>
                            <Image style={styles.image} source={{uri: this.props.applicationIconPath}} />
                            <Button 
                                title="Reload"
                                onClick={() => {
                                    console.log('CLICKED with applicationName', this.props.applicationName);
                                    ShortcutWizard.NativeApplescriptManager.loadShortcutsForApp(this.props.applicationName, (res) => {
                                        if (res) {
                                            if (res[0]) {
                                                console.log('error loading shortcuts: ' + res[0]);
                                                return;
                                            }

                                            var shortcuts = res[1];

                                            this.props.shortcuts = shortcuts;
                                        }
                                        
                                        this.state.loading = undefined;
                                        console.log('setting state to not loading, any more: ', this.state.loading);
                                    });

                                    this.state.loading = "[" + new Date() + "] " + this.props.applicationName;
                                    console.log('setting state to loading: ', this.state.loading);
                                }}
                            />
                        </View>

                        <Text style={{paddingBottom: 1}} > </Text>

                        <ListView 
                            style={styles.scrollView}
                            dataSource={this.state.dataSource}
                            ref={(scrollView) => { _scrollView = scrollView; }}
                            automaticallyAdjustContentInsets={false}
                            renderRow={this._renderRow}
                            renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
                            renderSeparator={this._renderSeparator} 
                        />
                    </View>
                );
            }
        } else {
            return (
                <View style={styles.view}>
                    <Text style={styles.titleText}>
                        {"\n"}
                        Welcome to ShortcutWizard!
                        {"\n"}
                        {"\n"}
                        Change app to see its shortcuts :)
                        {"\n"}
                        Sorry about the loading time! 
                    </Text>
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


AppRegistry.registerComponent('ShortcutWizard', () => ShortcutWizardApp);
