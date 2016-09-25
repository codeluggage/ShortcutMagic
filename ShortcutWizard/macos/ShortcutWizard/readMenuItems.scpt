function readShortcutMenuItems(readApplication) {
	ObjC.import("Cocoa");
	var se = Application("System Events");
	var evernote = se.processes.byName(readApplication);
	var fileMenu = evernote.menuBars[0];
	var outerItems = fileMenu.menus;
	var allItems = [];
	var item;
	var title;
	var attributes = {};
	var modMeanings = {
		"0": "cmd",
		"1": "cmd + shift",
		"2": "cmd + option",
		"3": "cmd + option + shift",
		"4": "cmd + ctrl",
		"6": "cmd + option + ctrl",
		"8": "",
		"10": "",
		"12": "ctrl",
		"13": "ctrl + shift",
		"24": "fn fn",
	};
	var glyphMeanings = {
		"2": "tab",
		"23": "delete",
		"27": "escape",
		"100": "left arrow",
		"101": "right arrow",
		"104": "up arrow",
		"106": "down arrow",
		"148": "fn fn",
	};
	var totalCount = 0;
	var maxCount = 20;

	for (var i = 0; i < outerItems.length; i++) {
		var items = outerItems[i].menuItems();

		// console.log("Loop#2, found " + items.length + " items");
			
		for (var j = 0; j < items.length; j++) {
			// console.log("Loop#3 ");
	    	item = items[j];
	    	attributes = {};
			title = item.title();
			if (!title) continue;

			attributes["title"] = title;

	    	try {
				var axCmdModName = item.attributes["AXMenuItemCmdModifiers"].name();
				var axCmdModVal = item.attributes["AXMenuItemCmdModifiers"].value();
				if (axCmdModVal) {
					attributes[axCmdModName] = modMeanings[axCmdModVal];
				}

				var axCmdVirtualName = item.attributes["AXMenuItemCmdVirtualKey"].name();
				var axCmdVirtualVal = item.attributes["AXMenuItemCmdVirtualKey"].value();
				if (axCmdVirtualVal) {
					attributes[axCmdVirtualName] = axCmdVirtualVal;
				}

				var axCmdGlyphName = item.attributes["AXMenuItemCmdGlyph"].name();
				var axCmdGlyphVal = item.attributes["AXMenuItemCmdGlyph"].value();
				if (axCmdGlyphVal) {
	    			if (typeof glyphMeanings[axCmdGlyphVal] === "undefined") {
	    				if (axCmdGlyphVal > 110 && axCmdGlyphVal < 130) {
	    					attributes[axCmdGlyphName] = "F & " + axCmdGlyphVal;
	    				}
	    			} else {
	    				attributes[axCmdGlyphName] = axCmdGlyphVal;
	    			}
				}

				var axCmdCharName = item.attributes["AXMenuItemCmdChar"].name();
				var axCmdCharVal = item.attributes["AXMenuItemCmdChar"].value();
				if (axCmdCharVal) {
					attributes[axCmdCharName] = axCmdCharVal;
				}
			} catch (err) {
				console.log('ERROR: ' + err);
			}

	    	if ((axCmdCharVal && axCmdCharVal.length) || axCmdGlyphVal) {
				allItems.push(attributes);
	    	}

			totalCount++;

			// allItems.push({
				// "title": item.title(),
				// "properties": item.properties(),
				// "attributes": attributes
			// });
		}

		if (totalCount > maxCount) break;
	}

	return allItems;
}

function readMenuItems(readApplication) {
	ObjC.import("Cocoa");
	var se = Application("System Events");
	var evernote = se.processes.byName(readApplication);
	var fileMenu = evernote.menuBars[0];
	var outerItems = fileMenu.menus;
	var allItems = [];
	var item;
	var title;
	var attributes = {};
	var modMeanings = {
		"0": "cmd",
		"1": "cmd + shift",
		"2": "cmd + option",
		"3": "cmd + option + shift",
		"4": "cmd + ctrl",
		"6": "cmd + option + ctrl",
		"8": "",
		"10": "",
		"12": "ctrl",
		"13": "ctrl + shift",
		"24": "fn fn",
	};

	var glyphMeanings = {
		"2": "tab",
		"23": "delete",
		"27": "escape",
		"100": "left arrow",
		"101": "right arrow",
		"104": "up arrow",
		"106": "down arrow",
		"148": "fn fn",
	};

	// console.log("Found " + outerItems.length + " items");

	var totalCount = 0;
	var maxCount = 50;

	for (var i = 0; i < outerItems.length; i++) {
		var items = outerItems[i].menuItems();

		// console.log("Loop#2, found " + items.length + " items");
			
		for (var j = 0; j < items.length; j++) {
			// console.log("Loop#3 ");
	    	item = items[j];
	    	attributes = {};
			title = item.title();
			if (!title) continue;

	    	try {
				var axCmdModName = item.attributes["AXMenuItemCmdModifiers"].name();
				var axCmdModVal = item.attributes["AXMenuItemCmdModifiers"].value();
				if (axCmdModVal) {
					attributes[axCmdModName] = axCmdModVal;
				}

				var axCmdVirtualName = item.attributes["AXMenuItemCmdVirtualKey"].name();
				var axCmdVirtualVal = item.attributes["AXMenuItemCmdVirtualKey"].value();
				if (axCmdVirtualVal) {
					attributes[axCmdVirtualName] = axCmdVirtualVal;
				}

				var axCmdGlyphName = item.attributes["AXMenuItemCmdGlyph"].name();
				var axCmdGlyphVal = item.attributes["AXMenuItemCmdGlyph"].value();
				if (axCmdGlyphVal) {
					attributes[axCmdGlyphName] = axCmdGlyphVal;
				}

				var axCmdCharName = item.attributes["AXMenuItemCmdChar"].name();
				var axCmdCharVal = item.attributes["AXMenuItemCmdChar"].value();
				if (axCmdCharVal) {
					attributes[axCmdCharName] = axCmdCharVal;
				}
			} catch (err) {
				console.log('ERROR: ' + err);
			}

			// console.log("About to insert title: " + item.title() + " and attributes: ");
			// for (key in attributes) {
				// console.log("Key: " + key + " value: " + attributes[key]);
			// }
			// allItems[item.title()] = attributes;





	    	// console.log('---------------------');
	    	for (key in attributes) {

	    		if (key == "AXMenuItemCmdModifiers") {
	    			attributes[key] = modMeanings[attributes[key]];
	    			// console.log('setting AXMenuItemCmdModifiers to ' + attributes[key]);
	    		} else if (key == "AXMenuItemCmdGlyph") {
	    			var holdVal = attributes[key];
	    			if (typeof glyphMeanings[holdVal] === "undefined") {
	    				if (holdVal > 110 && holdVal < 130) {
	    					attributes[key] = "F & " + holdVal;
	    				}
	    			} else {
	    				attributes[key] = holdVal;
	    			}
	    			// console.log('setting AXMenuItemCmdGlyph to ' + attributes[key]);
	    		}
	    	}
	    	// console.log('---------------------');

	    	attributes["title"] = title;
	    	allItems.push(attributes);
	    	totalCount++;
			// allItems.push({
				// "title": item.title(),
				// "properties": item.properties(),
				// "attributes": attributes
			// });
		}

		if (totalCount > maxCount) break;
	}

	return allItems;
}



function run(argv) {
	return readMenuItems(argv);
}

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