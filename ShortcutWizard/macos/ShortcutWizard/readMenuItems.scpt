ObjC.import("Cocoa");
$.NSLog("Hi everybody!");
// Do this to work with it easier: 

var se = Application("System Events");

// for (var thing in se) {
// 	console.log('System Events: ' + thing + " " + JSON.stringify(thing));
// }

var evernote = se.processes.byName('Evernote');
// for (var evernoteThing in evernote) {
// 	console.log('Evernote: ' + evernoteThing + " " + JSON.stringify(evernoteThing));
// }

var fileMenu = evernote.menuBars[0];
var outerItems = fileMenu.menus;
var allItems = [];

console.log("Found " + outerItems.length + " items");

for (var i = 0; i < outerItems.length; i++) {
	var items = outerItems[i].menuItems(); // Note ()

	console.log("Loop#2, found " + items.length + " items");
		
	for (var j = 0; j < items.length; j++) {
		console.log("Loop#3 ");
		
    	item = items[j];
		if (item) {	
			// console.log("Inner most loop, title: " + item.title());
			allItems.push({
				"title": item.title(),
				"properties": item.properties()
			});
		}
		
		//console.log(item.title());
		//console.log(JSON.stringify(item.properties()));
	}
}

console.log(JSON.stringify(allItems));


// #!/bin/sh

// var se = Application("System Events");
// var evernote = se.processes.byName('Evernote');

// var menus = evernote.menuBars;
// console.log('Menus: ' + menus + " - with length: " + menus.length);

// for (var i = 0; i < menus.length; i++) {
// 	console.log('Loop#1-' + i);
// 	var items1 = menus[i];
// 	console.log('Loop#1 length: ' + items1.length);
// 	console.log('Loop#1 menuTiems length: ' + items1.menuItems().length);

// 	for (var j = 0; j < items1.length; j++) {
// 		console.log('Loop#2-' + j);
// 		var items2 = items1[j].menuItems(); // Note ()
			
// 		for (var k = 0; k < items2.length; k++) {
// 			console.log("Loop#3-" + k);
// 			var item = items2[k];

// 			if (item) {	
// 				console.log("Inner most loop, title: " + item.title());
// 			}
			
// 			//console.log(item.title());
// 			//console.log(JSON.stringify(item.properties()));
// 		}
// 	}
// }