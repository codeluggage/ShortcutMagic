# ShortcutMagic

This is the open source repository for [ShortcutMagic](https://shortcutmagic.com). 

ShortcutMagic is a simple tool to see every action in any program, and master them.

## How does it work?

Applescript is used to get the list of menu items through the accessibility API in MacOS. The Applescript is compiled and ran by Objective-C, in the form of NodObjc, running inside Node.js. All of this is happening in "worker threads" (actually, invisible Chrome browser windows) in the background, and a transparent React overlay shows the shortcuts in the foreground. 


## What technology is used?

Several programming languages are used, but the majority of the code is in Javascript. Specifically in [Node.js](https://github.com/nodejs/node), ran by [Electron](https://github.com/electron/electron), and finally the view layer is in [React.js](https://github.com/facebook/react).


## Can I contribute to this repo? Can I use the code? 

Yes you can! Head over to the [issues](https://github.com/codeluggage/ShortcutMagic/issues) page to see what's going on. There are no contribution guidelines yet. 

## License

[MIT](https://github.com/codeluggage/ShortcutMagic/blob/master/LICENSE)
