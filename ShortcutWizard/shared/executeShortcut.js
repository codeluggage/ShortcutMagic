'use strict';
var $ = require('NodObjC');
$.import('OSAKit');

module.exports = function executeShortcut(listItem) {
    console.log("executeShortcut starting");
	var scriptName = "executeShortcut";
	var encoding = $.NSUTF8StringEncoding;
	var dirName = $(`${__dirname}/${scriptName}.scpt`);
	var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
	var hold = $.OSAScript('alloc')('initWithSource', source);

	// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ?
	// NSDictionary<NSString *,id> *errorInfo;
	var errorInfo = $.alloc($.NSDictionary);
	var compiled = hold('compileAndReturnError', errorInfo.ref());

	if (!compiled) {
        console.log("error in executeShortcut with errorInfo", $.NSString("stringWithFormat", "%@", errorInfo));
	    // $.NSLog("Compile failed: %@", errorInfo);
	    return null;
	}

    console.log("error in executeShortcut with errorInfo", errorInfo);
	var arrayArgs = $.NSMutableArray('alloc')('init');

    // TODO: Split out each piece of the shortcut
    var char = listItem.char;

    var glyph = listItem.glyph;
    if (glyph) {
        // Convert from visual back to key code

        // let control = mod.indexOf("⌃");
        // let alt = mod.indexOf("⌥");
        // let shift = mod.indexOf("⇧");
        // let command = mod.indexOf("⌘");
    }

    var mod = listItem.mod;
    if (mod) {
        // Strip out the different commands and give them regular words like control
        let control = mod.indexOf("⌃");
        let alt = mod.indexOf("⌥");
        let shift = mod.indexOf("⇧");
        let command = mod.indexOf("⌘");
    }

    if (char && !glyph && !mod) {
        arrayArgs('addObject', $(char));
        hold('executeHandlerWithName', $("executeChar"), 'arguments', arrayArgs, 'error', errorInfo.ref());
    } else if (glyph && !char && !mod) {
        arrayArgs('addObject', $(glyph));
        hold('executeHandlerWithName', $("executeGlyph"), 'arguments', arrayArgs, 'error', errorInfo.ref());
    } else if (char && mod && !glyph) {
        arrayArgs('addObject', $(char));
        arrayArgs('addObject', $(mod));
        hold('executeHandlerWithName', $("executeCharMod"), 'arguments', arrayArgs, 'error', errorInfo.ref());
    } else if (glyph && mod && !char) {
        arrayArgs('addObject', $(glyph));
        arrayArgs('addObject', $(mod));
        hold('executeHandlerWithName', $("executeGlyphMod"), 'arguments', arrayArgs, 'error', errorInfo.ref());
    } else if (char && glyph && mod) {
        // Is this even possible?
        arrayArgs('addObject', $(char));
        arrayArgs('addObject', $(glyph));
        arrayArgs('addObject', $(mod));
        hold('executeHandlerWithName', $("executeCharGlyphMod"), 'arguments', arrayArgs, 'error', errorInfo.ref());
    }


    // TODO: Deal with potential errors?
};
