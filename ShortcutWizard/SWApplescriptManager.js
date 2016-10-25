// TODO: How to define static function on a class? 
// TODO: How to deal with NSAppleEventDescriptor's


$.framework('Foundation');

SWApplescriptManager = Class.Extend('NSObject');

// returns to javascript
SWApplescriptManager.addMethod('loadShortcutsForApp:callback', 'void', function(appName, callback) {
  // TODO: how to do async in nobjc
  // dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{

    $.SWApplescriptManager('readMenuItems', appName, 'withBlock', function(shortcuts) {
      callback(null, shortcuts]); // node.js convention for error as first param - TODO: does null work for nil?
    });

  // });
});

// TODO: is singleton pattern useful in nodeobjc?
// static SWApplescriptManager *singletonInstance = nil;
// + (SWApplescriptManager *)singleton
// {
//   if (singletonInstance == nil) {
//     singletonInstance = [[SWApplescriptManager alloc] init];
//     singletonInstance.scripts = @{};
//   }
  
//   return singletonInstance;
// }



SWApplescriptManager.addMethod('readShortcutsWithName:error', 'NSAppleEventDescriptor', function(name, errorInfo) {
  if (!name || name.isEqualToString("")) {
    // TODO: Set errorInfo
    $.NSLog(@"ERROR - no name given to readShortcutsWithName");
    return nil;
  }
  
  var readShortcuts = SWApplescriptManager.scriptForKey("readMenuItems");
  return readShortcuts('executeHandlerWithName', "readShortcuts", 'arguments', [name], 'error', errorInfo);
});



SWApplescriptManager.addMethod('loadAndCompileApplescript', 'OSAScript', function(path) {
  var source = $.NSString('stringWithContentsOfFile', $.NSBundle('mainBundle')('pathForResource', path, 'ofType', "scpt"),
                                               'encoding', $.NSUTF8StringEncoding, 'error', null);
  var hold = $.OSAScript('alloc')('initWithSource', source);

  // TODO: How to make this a useable pointer? http://tootallnate.github.io/NodObjC/class.html -> createPointer ? 
  // NSDictionary<NSString *,id> *errorInfo;
  var errorInfo = Class.createPointer();

  var compiled = hold('compileAndReturnError', errorInfo); // TODO: how to pass this as reference? &errorInfo
  if (!compiled) {
    $.NSLog("Compile failed: %@", errorInfo);
    return null;
  }
  
  return hold;
});

SWApplescriptManager.addMethod('scriptForKey', 'OSAScript', function(key) {
  var instance = SWApplescriptManager('singleton');
  var script = instance.scripts('objectForKey', key);
  if (!script) {
      script = SWApplescriptManager('loadAndCompileApplescript', key);
  }
  
  return script;
});

SWApplescriptManager.addMethod('readMenuItems:withBlock', 'void', function(applicationName, callback) {
  $.NSLog("About to call readMenuItems with %@", applicationName);
  
  // TODO: How to create block?
  $.NSOperationQueue('mainQueue')('addOperationWithBlock', function() {
    var errorInfo = Class.createPointer();
    var desc = SWApplescriptManager('readShortcutsWithName', applicationName, 'error', errorInfo);
    
    if (errorInfo) {
      $.NSLog("error: %@", errorInfo);
    }
    
    var info = $.NSMutableDictionary('alloc')('init');
    var numItems = desc('numberOfItems');
    $.NSLog("Found number of items: %ld", numItems);
    for (var i = 0; i < numItems; i++) {
      
      let numItems = desc('numberOfItems');
      if (numItems) {
        let set = $.NSMutableArray('alloc')('init');
        
        for (var j = 0; j <= numItems; j++) {
          let innerDesc = desc('descriptorAtIndex', j);
          if (!innerDesc) continue;
          
          //          NSLog(@"inner desc: %@", innerDesc);
          let str = innerDesc('stringValue');
          if (str) {
            set('addObject', str);
            
            if (set('count') > 1) {
              let newMerged = SWApplescriptManager('explainOrKeep', set);
              if (newMerged('count') > 2 && (newMerged('objectForKey', "char") || newMerged('objectForKey', "glyph"))) {
                info('setObject', newMerged, 'forKey', newMerged["name"]);
                set('removeAllObjects');
              }
            }
            
            continue;
          }
          
          for (var k = 0; k <= innerDesc('numberOfItems'); k++) {
            let innerDescriptor2 = innerDesc('descriptorAtIndex', k);
            if (!innerDescriptor2) {
              continue;
            }
            
            str = innerDescriptor2('stringValue');
            
            if (str) {
              set('addObject', str);
            } else {
              for (var x = 0; x <= innerDescriptor2('numberOfItems'); x++) {
                let innerDescriptor3 = innerDescriptor2('descriptorAtIndex', x);
                if (!innerDescriptor3) continue;
                
                str = innerDescriptor3('stringValue');
                
                if (str) {
                  set('addObject', str);
                } else {
                  for (var y = 0; y <= innerDescriptor3('numberOfItems'); y++) {
                    let innerDescriptor4 = innerDescriptor3('descriptorAtIndex', y);
                    if (!innerDescriptor4) continue;
                    
                    str = innerDescriptor4('stringValue');
                    
                    if (str) {
                      set('addObject', str);
                    } else {
                      $.NSLog("must go deeper? leve 4 now %@", innerDescriptor4);
                    }
                  }
                }
              }
            }
            
            let newMerged = SWApplescriptManager('explainOrKeep', set);
            if (newMerged('count') > 2 && (newMerged('objectForKey', "char") || newMerged('objectForKey', "glyph"))) {
              info('setObject', newMerged, 'forKey', newMerged["name"]);
              set('removeAllObjects');
            } else {
              set('removeAllObjects');
            }
          }
        }
      }
    }
    
    callback($.NSDictionary('dictionaryWithDictionary', info));
  });
});

SWApplescriptManager.addMethod('explainOrKeepWindow', 'NSDictionary', function(set) {
    $.NSLog("explainOrKeepWindow before: %@", set);
  
    if ([set count] < 5) return nil;
  
    let newSet = $.NSMutableDictionary('alloc')('init');

    newSet["name"] = set[0];
    let rect = $.NSMakeRect(set[1]('floatValue'), set[2]('floatValue'), set[3]('floatValue'), set[4]('floatValue'));
    newSet('setObject', $.NSStringFromRect(rect), 'forKey', "position");
    return newSet;
}

SWApplescriptManager.addMethod('explainOrKeep', 'NSDictionary', function(set) {
  //  NSLog(@"explainOrKeep before: %@", set);
  
  if (set('count') < 2) return nil;
  
  let newSet = $.NSMutableDictionary('alloc')('init');
  newSet["name"] = set[0];

  let nextCmdChar = false;
  let nextCmdMod = false;
  let nextCmdGlyph = false;
  let nextPosition = false;
  let nextMenuName = false;
  
  set('enumerateObjectsUsingBlock', function(obj, idx, stop) {
    // Skip first index - that is always the name
    if (obj && idx != 0) {
      if (nextPosition) {
        nextPosition = false;
        newSet('setObject', obj, 'forKey', "position");
      } else if (nextMenuName) {
        nextMenuName = false;
        newSet('setObject', obj, 'forKey', "menuName");
      } else if (nextCmdMod) {
        nextCmdMod = false;
        
        let mod = nil;
        let switchCase = obj('integerValue');
        
        switch (switchCase) {
          case 0:
            mod = "⌘";
            break;
          case 1:
            mod = "⇧⌘";
            break;
          case 2:
            mod = "⌥⌘";
            break;
          case 3:
            mod = "⌥⇧⌘";
            break;
          case 4:
            mod = "⌃⌘";
            break;
          case 5:
            mod = "⌃⇧⌘";
            break;
          case 6:
            mod = "⌃⌥⌘";
            break;
          case 7:
            mod = "⌃⌥⇧⌘";
            break;
            // TOOD: Determine what '8' is in this key table
            //      case 8:
            //        mod = "-";
            //        break;
          case 9:
            mod = "⇧";
            break;
          case 10:
            mod = "⌥";
            break;
          case 11:
            mod = "⌥⇧";
            break;
          case 12:
            mod = "⌃";
            break;
          case 13:
            mod = "⌃⇧";
            break;
          case 14:
            mod = "⌃⌥";
            break;
          case 15:
            mod = "⌃⌥⇧";
            break;
        }
        
        if (mod) {
          newSet('setObject', mod, 'forKey', "mod");
        }
      } else if (nextCmdGlyph) {
        nextCmdGlyph = false;
        
        let switchCase = obj('integerValue');
        let glyph = nil;
        
        // set menuglyphs to text items of "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"
        switch (switchCase) {
          case 2:
            glyph = "⇥";
            break;
          case 3:
            glyph = "⇤";
            break;
          case 4:
            glyph = "⌤";
            break;
          case 9:
            glyph = "Space";
            break;
          case 10:
            glyph = "⌦";
            break;
          case 11:
            glyph = "↩";
            break;
          case 16:
            glyph = "↓";
            break;
          case 23:
            glyph = "⌫";
            break;
          case 24:
            glyph = "←";
            break;
          case 25:
            glyph = "↑";
            break;
          case 26:
            glyph = "→";
            break;
          case 27:
            glyph = "⎋";
            break;
          case 28:
            glyph = "⌧";
            break;
          case 98:
            glyph = "⇞";
            break;
          case 99:
            glyph = "⇪";
            break;
          case 100:
            glyph = "←";
            break;
          case 101:
            glyph = "→";
            break;
          case 102:
            glyph = "↖";
            break;
          case 104:
            glyph = "↑";
            break;
          case 105:
            glyph = "↘";
            break;
          case 106:
            glyph = "↓";
            break;
          case 107:
            glyph = "⇟";
            break;
          case 111:
            glyph = "F1";
            break;
          case 112:
            glyph = "F2";
            break;
          case 113:
            glyph = "F3";
            break;
          case 114:
            glyph = "F4";
            break;
          case 115:
            glyph = "F5";
            break;
          case 116:
            glyph = "F6";
            break;
          case 117:
            glyph = "F7";
            break;
          case 118:
            glyph = "F8";
            break;
          case 119:
            glyph = "F9";
            break;
          case 120:
            glyph = "F10";
            break;
          case 121:
            glyph = "F11";
            break;
          case 122:
            glyph = "F12";
            break;
          case 135:
            glyph = "F13";
            break;
          case 136:
            glyph = "F14";
            break;
          case 137:
            glyph = "F15";
            break;
          case 140:
            glyph = "⏏";
            break;
          case 143:
            glyph = "F16";
            break;
          case 144:
            glyph = "F17";
            break;
          case 145:
            glyph = "F18";
            break;
          case 146:
            glyph = "F19";
            break;
        }
        
        if (glyph) {
          newSet('setObject', glyph, 'forKey', "glyph");
        }
        
      } else if (nextCmdChar) {
        nextCmdChar = false;
        newSet('setObject', obj, 'forKey', "char");
      } else if (obj('isEqualToString', "menuName")) {
        nextMenuName = true;
      } else if (obj('isEqualToString', "position")) {
        nextPosition = true;
      } else if (obj('isEqualToString', "AXMenuItemCmdModifiers")) {
        nextCmdMod = true;
      } else if (obj('isEqualToString', "AXMenuItemCmdGlyph")) {
        nextCmdGlyph = true;
      } else if (obj('isEqualToString', "AXMenuItemCmdChar")) {
        nextCmdChar = true;
      }
    }
  });
  
  //  NSLog(@"explain after: %@", newSet);
  return newSet;
});

SWApplescriptManager.addMethod('readWindowOfApp:withBlock', 'void', function(applicationName, callback) {
  $.NSOperationQueue('mainQueue')('addOperationWithBlock', function() {
    let readWindowsOfApp = SWApplescriptManager('scriptForKey', "readWindowsOfApp");
    let errorInfo;
    
    let desc = readWindowsOfApp('executeHandlerWithName', "readWindowsOfApp", 'arguments', [applicationName], 'error', errorInfo); // todo pass ref
    
    if (errorInfo) {
      $.NSLog(@"error: %@", errorInfo);
    }
    
    
    let info = $.NSMutableDictionary('alloc')('init');
    let numItems = desc('numberOfItems');
    $.NSLog("Found number of items: %ld", numItems);
    for (var i = 0; i < numItems; i++) {
      
      let numItems = desc('numberOfItems');
      
      if (numItems) {
        let set = $.NSMutableArray('alloc')('init');
        
        for (var j = 0; j <= numItems; j++) {
          let innerDesc = desc('descriptorAtIndex', j);
          if (!innerDesc) continue;
          
          //          NSLog(@"inner desc: %@", innerDesc);
          let str = innerDesc('stringValue');
          if (str) {
            set('addObject', str);
            
            if (set('count') > 1) {
              let newMerged = SWApplescriptManager('explainOrKeep', set);
              if (newMerged('count') > 2 && (newMerged('objectForKey', "char") || newMerged('objectForKey', "glyph"))) {
                info('setObject', newMerged, 'forKey', newMerged["name"]);
                set('removeAllObjects');
              }
            }
            
            continue;
          }
          
          for (var k = 0; k <= innerDesc('numberOfItems'); k++) {
            let innerDescriptor2 = innerDesc('descriptorAtIndex', k);
            if (!innerDescriptor2) {
              continue;
            }
            
            str = innerDescriptor2('stringValue');
            
            if (str) {
              set('addObject', str);
            } else {
              for (var x = 0; x <= innerDescriptor2('numberOfItems'); x++) {
                let innerDescriptor3 = innerDescriptor2('descriptorAtIndex', x);
                if (!innerDescriptor3) continue;
                
                str = innerDescriptor3('stringValue');
                
                if (str) {
                  set('addObject', str);
                } else {
                  for (var y = 0; y <= innerDescriptor3('numberOfItems'); y++) {
                    let innerDescriptor4 = innerDescriptor3('descriptorAtIndex', y);
                    if (!innerDescriptor4) continue;
                    
                    str = innerDescriptor4('stringValue');
                    
                    if (str) {
                      set('addObject', str);
                    } else {
                      $.NSLog("must go deeper? leve 4 now %@", innerDescriptor4);
                    }
                  }
                }
              }
            }
            
            let newMerged = SWApplescriptManager('explainOrKeep', set);
            if (newMerged('count') > 2 && (newMerged('objectForKey', "char") || newMerged('objectForKey', "glyph"))) {
              info('setObject', newMerged, 'forKey', newMerged["name"]);
              set('removeAllObjects');
            } else {
              set('removeAllObjects');
            }
          }
        }
      }
    }
    
    callback($.NSDictionary('dictionaryWithDictionary', info));
  });
});

SWApplescriptManager.addMethod('readWindowOfApp:withBlock', 'void', function(applicationName, callback) {
  $.NSOperationQueue('mainQueue')('addOperationWithBlock', function() {
    let readWindowsOfApp = SWApplescriptManager('scriptForKey', "readWindowOfApp");
    let errorInfo;
    
    let desc = readWindowsOfApp('executeHandlerWithName', "readWindowOfApp", 'arguments', [applicationName], 'error', errorInfo);
    
    if (errorInfo) {
      $.NSLog("+++++++++readWindowOfApp error: %@", errorInfo);
    }
    
    
    let info = $.NSMutableDictionary('alloc')('init');
    let numItems = desc('numberOfItems');
    $.NSLog("++++++++++++++readWindowOfApp Found number of items: %ld", numItems);
    for (var i = 0; i < numItems; i++) {
      
      var numItems = desc('numberOfItems');
      
      if (numItems) {
        let set = $.NSMutableArray('alloc')('init');
        
        for (var j = 0; j <= numItems; j++) {
          let innerDesc = desc('descriptorAtIndex', j);
          if (!innerDesc) continue;
          
          //          NSLog(@"inner desc: %@", innerDesc);
          let str = innerDesc('stringValue');
          if (str) {
            set('addObject', str);
            continue;
          }
          
          for (var k = 0; k <= innerDesc('numberOfItems'); k++) {
            let innerDescriptor2 = innerDesc('descriptorAtIndex', k);
            if (!innerDescriptor2) {
              continue;
            }
            
            str = innerDescriptor2('stringValue');
            
            if (str) {
              set('addObject', str);
            } else {
              for (var x = 0; x <= innerDescriptor2('numberOfItems'); x++) {
                let innerDescriptor3 = innerDescriptor2('descriptorAtIndex', x);
                if (!innerDescriptor3) continue;
                
                str = innerDescriptor3('stringValue');
                
                if (str) {
                  set('addObject', str);
                } else {
                  for (var y = 0; y <= innerDescriptor3('numberOfItems'); y++) {
                    let innerDescriptor4 = innerDescriptor3('descriptorAtIndex', y);
                    if (!innerDescriptor4) continue;
                    
                    str = innerDescriptor4('stringValue');
                    
                    if (str) {
                      set('addObject', str);
                    } else {
                      $.NSLog("must go deeper? leve 4 now %@", innerDescriptor4);
                    }
                  }
                }
              }
            }
            
            let newMerged = SWApplescriptManager('explainOrKeepWindow', set);
            if (newMerged) {
              info('addEntriesFromDictionary', newMerged);
              // TODO: break out? make this loop simpler
            }
          }
        }
      }
    }
    
    callback($.NSDictionary('dictionaryWithDictionary', info));
  });
});

SWApplescriptManager.addMethod('windowNameOfApp', 'NSString', function(applicationName) {
    let readWindowsOfApp = SWApplescriptManager('scriptForKey', "windowNameOfApp");
    let errorInfo;
    let desc = readWindowsOfApp('executeHandlerWithName', "windowNameOfApp", 'arguments', [applicationName], 'error', errorInfo);
    
    if (errorInfo) {
      $.NSLog("--------windowNameOfApp error: %@", errorInfo);
      return "";
    }
    
    return desc('stringValue');
});

Class.register(SWApplescriptManager); // todo fix syntax of registering