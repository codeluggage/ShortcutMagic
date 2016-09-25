ObjC.import("Cocoa");
$.NSLog("Hi everybody!");


var se = Application("System Events");
$.NSLog("" + se);
// for (var thing in se) {
// 	console.log('System Events: ' + thing + " " + JSON.stringify(thing));
// }

var evernote = se.processes.byName('Evernote');
$.NSLog("" + evernote);

$.NSLog(systeminfo);

// $.NSLog(systemInformation);