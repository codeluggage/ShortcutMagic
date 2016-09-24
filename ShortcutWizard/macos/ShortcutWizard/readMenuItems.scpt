ObjC.import("Cocoa");
var se = Application("System Events");
var evernote = se.processes.byName('Evernote');
var fileMenu = evernote.menuBars[0];
var outerItems = fileMenu.menus;
var allItems = [];

console.log("Found " + outerItems.length + " items");

var totalCount = 0;
var maxCount = 100;

for (var i = 0; i < outerItems.length; i++) {
	var items = outerItems[i].menuItems(); // Note ()

	console.log("Loop#2, found " + items.length + " items");
		
	for (var j = 0; j < items.length; j++) {
		// console.log("Loop#3 ");
    	var attributes = [];

    	item = items[j];
		if (item) {	
			if (item.attributes["AXMenuItemCmdChar"].name) {
				attributes.push({
					"name": item.attributes["AXMenuItemCmdChar"].name(),
					"value": item.attributes["AXMenuItemCmdChar"].value()
				});
				console.log(attributes[attributes.length - 1].name);
				console.log(attributes[attributes.length - 1].value);
			}

			if (item.attributes["AXMenuItemCmdVirtualKey"].name) {
				attributes.push({
					"name": item.attributes["AXMenuItemCmdVirtualKey"].name(),
					"value": item.attributes["AXMenuItemCmdVirtualKey"].value()
				});
				console.log(attributes[attributes.length - 1].name);
				console.log(attributes[attributes.length - 1].value);
			}

			if (item.attributes["AXMenuItemCmdGlyph"].name) {
				attributes.push({
					"name": item.attributes["AXMenuItemCmdGlyph"].name(),
					"value": item.attributes["AXMenuItemCmdGlyph"].value()
				});
				console.log(attributes[attributes.length - 1].name);
				console.log(attributes[attributes.length - 1].value);
			}

			if (item.attributes["AXMenuItemCmdModifiers"].name) {
				attributes.push({
					"name": item.attributes["AXMenuItemCmdModifiers"].name(),
					"value": item.attributes["AXMenuItemCmdModifiers"].value()
				});
				console.log(attributes[attributes.length - 1].name);
				console.log(attributes[attributes.length - 1].value);
			}

			allItems.push({
				"title": item.title(),
				"properties": item.properties(),
				"attributes": attributes
			});
			
			totalCount++;
		}
	}

	if (totalCount > maxCount) break;
}

// function returnItems() {
// 	return allItems;
// }

// Can this be done by just saying 'allItems'?
// returnItems()
allItems;

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



// ObjC.import("Cocoa");
// var se = Application("System Events");
// var evernote = se.processes.byName('Evernote');
// var fileMenu = evernote.menuBars[0];
// var outerItems = fileMenu.menus;
// var allItems = [];

// console.log("Found " + outerItems.length + " items");

// for (var i = 0; i < outerItems.length; i++) {
// 	var items = outerItems[i].menuItems(); // Note ()

// 	console.log("Loop#2, found " + items.length + " items");
		
// 	for (var j = 0; j < items.length; j++) {
// 		// console.log("Loop#3 ");
		
//     	item = items[j];

//     	var attributes = [];
// 		if (item) {	
// 			attributes.push({
// 				"name": item.attributes["AXMenuItemCmdChar"].name(),
// 				"value": item.attributes["AXMenuItemCmdChar"].value()
// 			});
// 			attributes.push({
// 				"name": item.attributes["AXMenuItemCmdVirtualKey"].name(),
// 				"value": item.attributes["AXMenuItemCmdVirtualKey"].value()
// 			});
// 			attributes.push({
// 				"name": item.attributes["AXMenuItemCmdGlyph"].name(),
// 				"value": item.attributes["AXMenuItemCmdGlyph"].value()
// 			});

// 			attributes.push({
// 				"name": item.attributes["AXMenuItemCmdModifiers"].name(),
// 				"value": item.attributes["AXMenuItemCmdModifiers"].value()
// 			});


// 			allItems.push({
// 				"title": item.title(),
// 				"properties": item.properties(),
// 				"attributes": attributes
// 			});
// 		}
// 	}

// }
