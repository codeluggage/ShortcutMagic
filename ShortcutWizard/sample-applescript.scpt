-- this just checks cut enabled:
tell application "System Events"
   tell (first application process whose frontmost is true) -- Or a named, frontmost process.
       set CutEnabled to (enabled of first menu item of menu 1 of menu bar item 4 of menu bar 1 whose value of attribute "AXMenuItemCmdChar" is "X" and value of attribute "AXMenuItemCmdModifiers" is 0)
   end tell
end tell


tell application "System Events"
   tell (first application process whose frontmost is true) -- Or a named, frontmost process.
       tell menu 1 of menu bar item 4 of menu bar 1
           set nbMenuItem to count every menu item
           set liste to {}
           repeat with i from 1 to nbMenuItem
               set mName to get name of menu item i
               try
                   mName
               on error
                   set mName to missing value
               end try
               set mAttr to get value of attribute "AXMenuItemCmdChar" of menu item i
               try
                   mAttr
               on error
                   set mAttr to missing value
               end try
               set end of liste to {mName, mAttr}
           end repeat
       end tell
   end tell
end tell

-- this will print the above values:
liste


-- apparently works on newer versions of OSX:
tell application "System Events"
   tell (first application process whose frontmost is true)
       tell menu 1 of menu bar item 4 of menu bar 1
           get properties of attribute "AXMenuItemCmdChar" of menu item 4
       end tell
   end tell
end tell


-- even newer version compatibility/changes: 
tell application "System Events"
   set theProcess to (first application process whose frontmost is true)
   
   set theProcess to process "TextEdit"
   tell theProcess
       tell menu 1 of menu bar item 4 of menu bar 1
           #set cutEnabled to (properties of (get first menu item whose value of attribute "AXMenuItemCmdChar" is "X"))
           -- Invalid index
           set theValues to value of attribute "AXMenuItemCmdChar" of every menu item
           set {maybe, cutenabled} to {0, false}
           repeat with i from 1 to count theValues
               if item i of theValues is "X" then
                   set maybe to i
                   exit repeat
               end if
           end repeat
           if maybe = 0 then
               # no item whose shortcut letter is X in the menu
           else
               # test the value of attribute "AXMenuItemCmdModifiers"
               tell menu item maybe
                   properties of every attribute
                   set cutenabled to value of attribute "AXMenuItemCmdModifiers" is in {1, true}
               end tell
           end if
           
       end tell
   end tell    
end tell


-- another example:
set theApp to "TextEdit"
activate application theApp
tell application "System Events"
   #tell (first application process whose frontmost is true) -- Or a named, frontmost process.
   tell process theApp
       set CutEnabled to false
       set maybe to first menu item of menu 1 of menu bar item 4 of menu bar 1 whose value of attribute "AXMenuItemCmdChar" is "X"
       if value of attribute "AXMenuItemCmdModifiers" of maybe is in {0, false} then
           set CutEnabled to enabled of maybe
       end if
end tell
end tell


-- another example:
tell application "TextEdit" to activate

tell application "System Events"
   tell (first application process whose frontmost is true)
       set {AXMenuItemCmdCharVals, AXMenuItemCmdModifierVals, enabledVals} to {value of attribute "AXMenuItemCmdChar", value of attribute "AXMenuItemCmdModifiers", enabled} of every menu item of menu 1 of menu bar item 4 of menu bar 1
   end tell
end tell

repeat with i from 1 to (count AXMenuItemCmdCharVals)
   if ((item i of AXMenuItemCmdCharVals is "X") and (item i of AXMenuItemCmdModifierVals is in {0, false})) then
       set cutenabled to item i of enabledVals
       exit repeat
   end if
end repeat
-- shows above values
cutenabled

--The entire list is :
-- 0    cmd +
-- 1    cmd + maj +
-- 2    cmd + option +
-- 3    cmd + option + maj +
-- 4    cmd + ctrl +
-- 6    cmd + option + ctrl +
-- 8    
-- 10    
-- 12    ctrl +
-- 13    ctrl + maj +
-- 24    fn fn

-- To identify menu items whose shortcut contains Escape, Delete, up arrow, down arrow, left arrow, right arrow it's useful to extract also :
-- value of attribute "AXMenuItemCmdVirtualKey"
-- value of attribute "AXMenuItemCmdGlyph"



