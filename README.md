# ShortcutMagic

ShortcutMagic is a productivity program to help you learn shortcuts. It does this by showing suggetsions, either when the program changes or a set time afterwards. 

![Suggestion](./bubble-window.png?raw=true "Suggestion")

Every action it can find, both those with shortcuts and those without, are added to the main shortcut library window: 

![Library](./library.png?raw=true "Library")

## How does it work?

It uses the accessibility API's through AppleScript to parse every action item listed under the menues and adds them to a simple local database. The global notifications for app switching and launching are used through Objective-C, so ShortcutMagic knows when to parse new shortcuts and when to show the suggestion. 

The majority of the code is in Javascript. [Node.js](https://github.com/nodejs/node), running in [Electron](https://github.com/electron/electron), rendered with [React.js](https://github.com/facebook/react).

## Can I contribute to this repo? Can I use the code? 

Yes and yes! The code freely available under the MIT license, and there are issues listed on [issues](https://github.com/codeluggage/ShortcutMagic/issues). 

## License

[MIT](https://github.com/codeluggage/ShortcutMagic/blob/master/LICENSE)
