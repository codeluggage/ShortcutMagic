'use strict';
var $ = require('NodObjC');
$.import('OSAKit');

function buildExecuteFunction(control, option, shift, command) {
    var executeFunction;

    if (!control && !option && !shift && !command)       { executeFunction = "execute";
    } else if (control && !option && !shift && !command) { executeFunction = "executeCtrl";
    } else if (!control && !option && !shift && command) { executeFunction = "executeCmd";
    } else if (!control && option && !shift && !command) { executeFunction = "executeOpt";
    } else if (!control && !option && shift && !command) { executeFunction = "executeShift";
    } else if (!control && option && !shift && command)  { executeFunction = "executeCmdOpt";
    } else if (control && !option && !shift && command)  { executeFunction = "executeCmdCtrl";
    } else if (!control && !option && shift && command)  { executeFunction = "executeCmdShift";
    } else if (control && option && !shift && !command)  { executeFunction = "executeOptCtrl";
    } else if (!control && option && shift && !command)  { executeFunction = "executeOptShift";
    } else if (control && !option && !shift && !command) { executeFunction = "executeCtrl";
    } else if (control && !option && shift && !command)  { executeFunction = "executeShiftCtrl";
    } else if (!control && option && shift && command)   { executeFunction = "executeCmdOptShift";
    } else if (control && option && !shift && command)   { executeFunction = "executeCmdOptCtrl";
    } else if (control && !option && !shift && !command) { executeFunction = "executeCmdShiftCtrl";
    } else if (control && option && shift && !command)   { executeFunction = "executeOptCtrlShift";
    } else if (control && option && shift && command)    { executeFunction = "executeCmdOptCtrlShift";
    }

    return executeFunction;
}

module.exports = function executeShortcut(appName, listItem) {
    console.log("executeShortcut starting", listItem);
    var pool = $.NSAutoreleasePool('alloc')('init')
	var scriptName = "executeShortcut";
	var encoding = $.NSUTF8StringEncoding;
	var dirName = $(`${__dirname}/${scriptName}.scpt`);
	var source = $.NSString('stringWithContentsOfFile', dirName, 'encoding', encoding, 'error', null);
	var hold = $.OSAScript('alloc')('initWithSource', source);

	// TODO: How to make this a useable pointer? http://tootallnate.github.io/$/class.html -> createPointer ?
	// NSDictionary<NSString *,id> *errorInfo;
	var errorInfo = $.alloc($.NSDictionary);
    console.log("variables built");
	var compiled = hold('compileAndReturnError', errorInfo.ref());
    console.log("compiled");

	if (!compiled) {
        console.log("error in executeShortcut with errorInfo");
        console.log(errorInfo);
	    // $.NSLog("Compile failed: %@", errorInfo);
	    return null;
	}
    console.log("done compiling");

    // console.log("error in executeShortcut with errorInfo", errorInfo,  dirName);
	var arrayArgs = $.NSMutableArray('alloc')('init');

    var char = convertCharToKeyCode(listItem.char, listItem.glyph);

    arrayArgs('addObject', $(appName));
    arrayArgs('addObject', $(char));

    var mod = listItem.mod;
    let control;
    let option;
    let shift;
    let command;
    if (mod) {
        // Strip out the different commands and give them regular words like control
        control = (mod.indexOf("⌃") != -1);
        option = (mod.indexOf("⌥") != -1);
        shift = (mod.indexOf("⇧") != -1);
        command = (mod.indexOf("⌘") != -1);
    }


    if (!control && !option && !shift && !command) {
        console.log("TODO: Fix this - No mod found, applying command mod as minimum");
        command = true;
    }

    console.log("----> ", control, option, shift, command);
    console.log(arrayArgs);

    var executeFunction = buildExecuteFunction(control, option, shift, command);



    console.log("after setting executeFunction", executeFunction);
    var returnValue = hold('executeHandlerWithName', $(executeFunction), 'arguments', arrayArgs, 'error', errorInfo.ref());
    console.log("after executing ", returnValue);

    // TODO: Deal with potential errors?
    pool('drain');
};

function convertCharToKeyCode(char, glyph) {
    if (!char) {
        char = glyph;

        if (!char) {
            // No char, no glyph, no way to execute this shortcut...
            return null;
        }
    }

    console.log("creating key code with ", char);

    // Force to string in case it's a number - maybe not needed
    char = "" + char;
    char = char.toLowerCase();



    if (char.indexOf("a") != -1) {
        char = 0;
    } else if (char.indexOf("s") != -1) {
        char = 1;
    } else if (char.indexOf("d") != -1) {
        char = 2;
    } else if (char.indexOf("f") != -1) {
        char = 3;
    } else if (char.indexOf("h") != -1) {
        char = 4;
    } else if (char.indexOf("g") != -1) {
        char = 5;
    } else if (char.indexOf("z") != -1) {
        char = 6;
    } else if (char.indexOf("x") != -1) {
        char = 7;
    } else if (char.indexOf("c") != -1) {
        char = 8;
    } else if (char.indexOf("v") != -1) {
        char = 9;
    // } else if (char.indexOf(ISO_Section) != -1) {
    //     char = 10;
    } else if (char.indexOf("b") != -1) {
        char = 11;
    } else if (char.indexOf("q") != -1) {
        char = 12;
    } else if (char.indexOf("w") != -1) {
        char = 13;
    } else if (char.indexOf("e") != -1) {
        char = 14;
    } else if (char.indexOf("r") != -1) {
        char = 15;
    } else if (char.indexOf("y") != -1) {
        char = 16;
    } else if (char.indexOf("t") != -1) {
        char = 17;
    } else if (char.indexOf("1") != -1) {
        char = 18;
    } else if (char.indexOf("2") != -1) {
        char = 19;
    } else if (char.indexOf("3") != -1) {
        char = 20;
    } else if (char.indexOf("4") != -1) {
        char = 21;
    } else if (char.indexOf("6") != -1) {
        char = 22;
    } else if (char.indexOf("5") != -1) {
        char = 23;
    } else if (char.indexOf("=") != -1) {
        char = 24;
    } else if (char.indexOf("9") != -1) {
        char = 25;
    } else if (char.indexOf("7") != -1) {
        char = 26;
    } else if (char.indexOf("-") != -1) {
        char = 27;
    } else if (char.indexOf("8") != -1) {
        char = 28;
    } else if (char.indexOf("0") != -1) {
        char = 29;
    } else if (char.indexOf("]") != -1) {
        char = 30;
    } else if (char.indexOf("o") != -1) {
        char = 31;
    } else if (char.indexOf("u") != -1) {
        char = 32;
    } else if (char.indexOf("[") != -1) {
        char = 33;
    } else if (char.indexOf("i") != -1) {
        char = 34;
    } else if (char.indexOf("p") != -1) {
        char = 35;
    } else if (char.indexOf("⏎") != -1 || char.indexOf("↵") != -1 || char.indexOf("↩") != -1
        || char.indexOf("⌤") != -1 || char.indexOf("Enter") != -1) {
        char = 36;
    } else if (char.indexOf("l") != -1) {
        char = 37;
    } else if (char.indexOf("j") != -1) {
        char = 38;
    } else if (char.indexOf('"') != -1) {
        char = 39;
    } else if (char.indexOf("k") != -1) {
        char = 40;
    } else if (char.indexOf(";") != -1) {
        char = 41;
    } else if (char.indexOf("\\") != -1) {
        char = 42;
    } else if (char.indexOf(",") != -1) {
        char = 43;
    } else if (char.indexOf("/") != -1) {
        char = 44;
    } else if (char.indexOf("n") != -1) {
        char = 45;
    } else if (char.indexOf("m") != -1) {
        char = 46;
    } else if (char.indexOf(".") != -1) {
        char = 47;
    } else if (char.indexOf("↹") != -1 || char.indexOf("⇆") != -1 || char.indexOf("⇤") != -1 || char.indexOf("⇥") != -1 || char.indexOf("\t") != -1) {
        char = 48;
    } else if (char.indexOf(" ") != -1) { // TODO: Does this work for space?
        char = 49;
    // } else if (char.indexOf(ANSI_Grave) != -1) {
    //     char = 50;
    } else if (char.indexOf("⌫") != -1) {
        char = 51;
    } else if (char.indexOf("⎋") != -1) {
        char = 53;
    // } else if (char.indexOf(Command) != -1) {
    //     char = 55;
    // } else if (char.indexOf(Shift) != -1) {
    //     char = 56;
    } else if (char.indexOf("⇪") != -1) {
        char = 57;
    // } else if (char.indexOf(Option) != -1) {
    //     char = 58;
    // } else if (char.indexOf(Control) != -1) {
    //     char = 59;
    // } else if (char.indexOf(RightShift) != -1) {
    //     char = 60;
    // } else if (char.indexOf(RightOption) != -1) {
    //     char = 61;
    // } else if (char.indexOf(RightControl) != -1) {
    //     char = 62;
    // } else if (char.indexOf(Function) != -1) {
    //     char = 63;
    } else if (char.indexOf("F17") != -1) {
        char = 64;
    // } else if (char.indexOf(ANSI_KeypadDecimal) != -1) {
    //     char = 65;
    // } else if (char.indexOf(ANSI_KeypadMultiply) != -1) {
    //     char = 67;
    // } else if (char.indexOf(ANSI_KeypadPlus) != -1) {
    //     char = 69;
    // } else if (char.indexOf(ANSI_KeypadClear) != -1) {
    //     char = 71;
    // } else if (char.indexOf(VolumeUp) != -1) {
    //     char = 72;
    // } else if (char.indexOf(VolumeDown) != -1) {
    //     char = 73;
    // } else if (char.indexOf(Mute) != -1) {
    //     char = 74;
    // } else if (char.indexOf(ANSI_KeypadDivide) != -1) {
    //     char = 75;
    // } else if (char.indexOf(ANSI_KeypadEnter) != -1) {
    //     char = 76;
    // } else if (char.indexOf(ANSI_KeypadMinus) != -1) {
    //     char = 78;
    } else if (char.indexOf("F18") != -1) {
        char = 79;
    } else if (char.indexOf("F19") != -1) {
        char = 80;
    // } else if (char.indexOf(ANSI_KeypadEquals) != -1) {
    //     char = 81;
    // } else if (char.indexOf(ANSI_Keypad0) != -1) {
    //     char = 82;
    // } else if (char.indexOf(ANSI_Keypad1) != -1) {
    //     char = 83;
    // } else if (char.indexOf(ANSI_Keypad2) != -1) {
    //     char = 84;
    // } else if (char.indexOf(ANSI_Keypad3) != -1) {
    //     char = 85;
    // } else if (char.indexOf(ANSI_Keypad4) != -1) {
    //     char = 86;
    // } else if (char.indexOf(ANSI_Keypad5) != -1) {
    //     char = 87;
    // } else if (char.indexOf(ANSI_Keypad6) != -1) {
    //     char = 88;
    // } else if (char.indexOf(ANSI_Keypad7) != -1) {
    //     char = 89;
    } else if (char.indexOf("F20") != -1) {
        char = 90;
    // } else if (char.indexOf(ANSI_Keypad8) != -1) {
    //     char = 91;
    // } else if (char.indexOf(ANSI_Keypad9) != -1) {
    //     char = 92;
    // } else if (char.indexOf(JIS_Yen) != -1) {
    //     char = 93;
    } else if (char.indexOf("_") != -1) { // TODO: Check that underscore works
        char = 94;
    // } else if (char.indexOf(JIS_KeypadComma) != -1) {
    //     char = 95;
} else if (char.indexOf("F5") != -1) {
        char = 96;
    } else if (char.indexOf("F6") != -1) {
        char = 97;
    } else if (char.indexOf("F7") != -1) {
        char = 98;
    } else if (char.indexOf("F3") != -1) {
        char = 99;
    } else if (char.indexOf("F8") != -1) {
        char = 100;
    } else if (char.indexOf("F9") != -1) {
        char = 101;
    // } else if (char.indexOf(JIS_Eisu) != -1) {
    //     char = 102;
    } else if (char.indexOf("F11") != -1) {
        char = 103;
    // } else if (char.indexOf(JIS_Kana) != -1) {
    //     char = 104;
    } else if (char.indexOf("F13") != -1) {
        char = 105;
    } else if (char.indexOf("F16") != -1) {
        char = 106;
    } else if (char.indexOf("F14") != -1) {
        char = 107;
    } else if (char.indexOf("F10") != -1) {
        char = 109;
    } else if (char.indexOf("F12") != -1) {
        char = 111;
    } else if (char.indexOf("F15") != -1) {
        char = 113;
    // } else if (char.indexOf(Help) != -1) {
    //     char = 114;
    } else if (char.indexOf("↖") != -1) {
        char = 115;
    } else if (char.indexOf("⇞") != -1) {
        char = 116;
    } else if (char.indexOf("⌦") != -1) {
        char = 117;
    } else if (char.indexOf("F4") != -1) {
        char = 118;
    } else if (char.indexOf("↘") != -1) {
        char = 119;
    } else if (char.indexOf("F2") != -1) {
        char = 120;
    } else if (char.indexOf("⇟") != -1) {
        char = 121;
    } else if (char.indexOf("F1") != -1) {
        char = 122;
    } else if (char.indexOf("←") != -1) {
        char = 123;
    } else if (char.indexOf("→") != -1) {
        char = 124;
    } else if (char.indexOf("↑") != -1) {
        char = 125;
    } else if (char.indexOf("↓") != -1) {
        char = 126;
    }

    console.log("result key code: ", char);

    return char;
}
