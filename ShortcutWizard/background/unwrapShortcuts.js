var $ = require('NodObjC')
$.framework('Foundation');

module.exports = function unwrap(desc) {
  // var errorInfo = $.alloc($.NSDictionary);
  
  // if (errorInfo) {
  //   $.NSLog("error: %@", errorInfo);
  // }
  
  var info = {}
  var numItems = desc('numberOfItems');
  let set = $.NSMutableArray('alloc')('init');
  // $.NSLog("Found number of items: %ld", numItems);
  console.log('numItems ', numItems);

      for (var j = 0; j <= numItems; j++) {
        let innerDesc = desc('descriptorAtIndex', j);
        if (!innerDesc) continue;
        
        //          NSLog(@"inner desc: %@", innerDesc);
        let str = innerDesc('stringValue');
        if (str) {
          set('addObject', str);
          
          if (set('count') > 1) {
            let newMerged = explainOrKeep(set);
            if (Object.keys(newMerged).length > 2 && (newMerged["char"] || newMerged["glyph"])) {
              info[newMerged["name"]] = newMerged;
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
                    // $.NSLog("must go deeper? leve 4 now %@", innerDescriptor4);
                    console.log('inside loop 4', innerDescriptor4);
                  }
                }
              }
            }
          }
          
          let newMerged = explainOrKeep(set);
          if (Object.keys(newMerged).length > 2 && (newMerged["char"] || newMerged["glyph"])) {
            info[newMerged["name"]] = newMerged;
            set('removeAllObjects');
          } else {
            set('removeAllObjects');
          }
        }
      }
  
  return info;
};

// function explainOrKeepWindow(set) {
//     console.log('explainOrKeepWindow', set);
  
//     if (set('count') < 5) return null;
  
//     let newSet = {
//       "name": "" + set[0];
//     };

//     // TODO: convert to floats 
//     let rect = $.NSMakeRect(set[1]('floatValue'), set[2]('floatValue'), set[3]('floatValue'), set[4]('floatValue'));
//     newSet('setObject', $.NSStringFromRect(rect), 'forKey', "position");
//     return newSet;
// }

function explainOrKeep(set) {
  //  NSLog(@"explainOrKeep before: %@", set);

  var setCount = set('count');
  if (setCount < 2 || !set) return null;
  
  let newSet = {
    "name": "" + set('objectAtIndex', 0)
  };

  let nextCmdChar = false;
  let nextCmdMod = false;
  let nextCmdGlyph = false;
  let nextPosition = false;
  let nextMenuName = false;
  
  for (var idx = 0; idx < setCount; idx++) {
    // TODO: Make this cleaner? 
    let obj = "" + set('objectAtIndex', idx); 

    // Skip first index - that is always the name
    if (idx != 0 && obj) {
      if (nextPosition) {
        nextPosition = false;
        newSet["position"] = obj;
      } else if (nextMenuName) {
        nextMenuName = false;
        newSet["menuName"] = obj;
      } else if (nextCmdMod) {
        nextCmdMod = false;
        
        let mod = null;
        // TODO: Cleaner covert?
        let switchCase = obj; switchCase++; switchCase--;
        
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
          newSet["mod"] = mod;
        }
      } else if (nextCmdGlyph) {
        nextCmdGlyph = false;
        
        // TODO: Cleaner converts
        let switchCase = obj; switchCase++; switchCase--;
        let glyph = null;
        
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
          newSet["glyph"] = glyph;
        }
        
      } else if (nextCmdChar) {
        nextCmdChar = false;
        newSet["char"] = obj;
      } else if (obj === "menuName") {
        nextMenuName = true;
      } else if (obj === "position") {
        nextPosition = true;
      } else if (obj === "AXMenuItemCmdModifiers") {
        nextCmdMod = true;
      } else if (obj === "AXMenuItemCmdGlyph") {
        nextCmdGlyph = true;
      } else if (obj === "AXMenuItemCmdChar") {
        nextCmdChar = true;
      }
    }
  }
  
  //  NSLog(@"explain after: %@", newSet);
  return newSet;
}

function readWindowOfApp(applicationName) {
    let readWindowsOfApp = SWApplescriptManager('scriptForKey', "readWindowsOfApp");
    let errorInfo;
    
    let desc = readWindowsOfApp('executeHandlerWithName', "readWindowsOfApp", 'arguments', [applicationName], 'error', errorInfo); // todo pass ref
    
    if (errorInfo) {
      // $.NSLog("error: %@", errorInfo);
      console.log('readWindowOfApp', errorInfo);
    }
    
    
    let info = {};
    let numItems = desc('numberOfItems');
    // $.NSLog("Found number of items: %ld", numItems);
    console.log('found numItems', numItems);
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
              let newMerged = explainOrKeep(set);
              if (Object.keys(newMerged).length > 2 && (newMerged["char"] || newMerged["glyph"])) {
                info[newMerged["name"]] = newMerged;
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
                      // $.NSLog("must go deeper? leve 4 now %@", innerDescriptor4);
                      console.log('level 4 ', innerDescriptor4);
                    }
                  }
                }
              }
            }
            
            let newMerged = explainOrKeep(set);
            if (Object.keys(newMerged).length > 2 && (newMerged["char"] || newMerged["glyph"])) {
              info[newMerged["name"]] = newMerged;
              set('removeAllObjects');
            } else {
              set('removeAllObjects');
            }
          }
        }
      }
    }
    
  return info;
}

// function readWindowOfApp(applicationName) {
//     let readWindowsOfApp = SWApplescriptManager('scriptForKey', "readWindowOfApp");
//     let errorInfo;
    
//     let desc = readWindowsOfApp('executeHandlerWithName', "readWindowOfApp", 'arguments', [applicationName], 'error', errorInfo);
    
//     if (errorInfo) {
//       $.NSLog("+++++++++readWindowOfApp error: %@", errorInfo);
//     }
    
    
//     let info = $.NSMutableDictionary('alloc')('init');
//     let numItems = desc('numberOfItems');
//     $.NSLog("++++++++++++++readWindowOfApp Found number of items: %ld", numItems);
//     for (var i = 0; i < numItems; i++) {
      
//       var numItems = desc('numberOfItems');
      
//       if (numItems) {
//         let set = $.NSMutableArray('alloc')('init');
        
//         for (var j = 0; j <= numItems; j++) {
//           let innerDesc = desc('descriptorAtIndex', j);
//           if (!innerDesc) continue;
          
//           //          NSLog(@"inner desc: %@", innerDesc);
//           let str = innerDesc('stringValue');
//           if (str) {
//             set('addObject', str);
//             continue;
//           }
          
//           for (var k = 0; k <= innerDesc('numberOfItems'); k++) {
//             let innerDescriptor2 = innerDesc('descriptorAtIndex', k);
//             if (!innerDescriptor2) {
//               continue;
//             }
            
//             str = innerDescriptor2('stringValue');
            
//             if (str) {
//               set('addObject', str);
//             } else {
//               for (var x = 0; x <= innerDescriptor2('numberOfItems'); x++) {
//                 let innerDescriptor3 = innerDescriptor2('descriptorAtIndex', x);
//                 if (!innerDescriptor3) continue;
                
//                 str = innerDescriptor3('stringValue');
                
//                 if (str) {
//                   set('addObject', str);
//                 } else {
//                   for (var y = 0; y <= innerDescriptor3('numberOfItems'); y++) {
//                     let innerDescriptor4 = innerDescriptor3('descriptorAtIndex', y);
//                     if (!innerDescriptor4) continue;
                    
//                     str = innerDescriptor4('stringValue');
                    
//                     if (str) {
//                       set('addObject', str);
//                     } else {
//                       $.NSLog("must go deeper? leve 4 now %@", innerDescriptor4);
//                     }
//                   }
//                 }
//               }
//             }
            
//             let newMerged = SWApplescriptManager('explainOrKeepWindow', set);
//             if (newMerged) {
//               info('addEntriesFromDictionary', newMerged);
//               // TODO: break out? make this loop simpler
//             }
//           }
//         }
//       }
//     }
    
//     return $.NSDictionary('dictionaryWithDictionary', info);
// }

function windowNameOfApp(applicationName) {
    let readWindowsOfApp = SWApplescriptManager('scriptForKey', "windowNameOfApp");
    let errorInfo;
    let desc = readWindowsOfApp('executeHandlerWithName', "windowNameOfApp", 'arguments', [applicationName], 'error', errorInfo);
    
    if (errorInfo) {
      // $.NSLog("--------windowNameOfApp error: %@", errorInfo);
      console.log('windowNameOfApp err', errorInfo);
      return "";
    }
    
    return desc('stringValue');
}

