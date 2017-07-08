# ShortcutMagic

This is the open source repository for [ShortcutMagic](https://shortcutmagic.com). 

## What is ShortcutMagic?

A small floating window that lives on your computer and teaches you about other programs. 

In the ShortcutMagic window, all the things you can do in your program are listed. You can click them to run the shortcut, set it as your favorite, hide it if you don't need it, and so on. 

The community contributes ratings, advice, tips, and most importantly gifs that show how something works. 


## How does ShortcutMagic work?

It uses the accessibility in the computer to learn what the other programs on your computer can do, and what the shortcuts are.  

## What technology is used?

Several programming languages are used, but the majority of the code is in Javascript. Specifically in [Node.js](https://github.com/nodejs/node), ran by [Electron](https://github.com/electron/electron). Everything visible is in [React.js](https://github.com/facebook/react).

Applescript is used to get the list of menu items through the accessibility API in MacOS. The Applescript is compiled and ran by Objective-C, in the form of NodObjc, running inside Node.js. All of this is happening in "worker threads" (actually, invisible Chrome browser windows) in the background. 

## Can I contribute to this repo? Can I use the code? 

Yes you can! Head over to the [issues](https://github.com/codeluggage/ShortcutMagic/issues) page to see what's going on. Check out [contributing](https://github.com/codeluggage/ShortcutMagic/blob/master/CONTRIBUTING.md) for more on how you can help the ShortcutMagic community! 

## License

[MIT](https://github.com/codeluggage/ShortcutMagic/blob/master/LICENSE)
