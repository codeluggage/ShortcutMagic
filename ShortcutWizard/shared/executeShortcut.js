'use strict';
var $ = require('NodObjC');
$.import('OSAKit');

module.exports = function executeShortcut(listItem) {
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
	    $.NSLog("Compile failed: %@", errorInfo);
	    return null;
	}

	var arrayArgs = $.NSMutableArray('alloc')('init');

    // TODO: Split out each piece of the shortcut
    var char = listItem.char;
    var glyph = listItem.glyph;
    var mod = listItem.mod;

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
