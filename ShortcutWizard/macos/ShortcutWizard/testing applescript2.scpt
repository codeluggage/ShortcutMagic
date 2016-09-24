-- tell application "System Events"
--     tell process "Safari"
--         -- get the menu bar items from the main menu
--         tell menu bar 1
--             set menuBarItems to menu bar items -- apple menu, application menu, file menu etc.
--         end tell

--         -- get the menu items from a menu bar item
--         set fileMenuBarItem to item 3 of menuBarItems -- the file menu
--         tell menu 1 of fileMenuBarItem -- you have to have "menu 1" here
--             set menuItems to menu items
--         end tell

--         -- query the menu bar item
--         set closeWindowMenuItem to item 6 of menuItems -- close window menu item
--         tell closeWindowMenuItem
--             return {name, value} of attributes
--         end tell
--     end tell
-- end tell





-- # Taken from http://macscripter.net/viewtopic.php?id=40374&p=2
-- # Optimised from a script by Yvan Koenig.
-- # completed by Yvan Koenig (2013/07/27)
-- # optionally added the separators
property showSeparators : true
-- drop the submenu items of the Recent Items menu
-- # added two modifiers values : 5 & 7 which are used by two services :

main("Numbers")

on main(theApp)
   activate application theApp
   
   set params to {"Name" & tab & "Char" & tab & "VirtualKey" & tab & "Glyph" & tab & "Modifiers" & tab & "Shortcut"}
   
   tell application "System Events" to set {menuNames, {menuItemNames, {menuItemAttributeNames, menuItemAttributeValues}, {submenuItemNames, {submenuItemAttributeNames, submenuItemAttributeValues}}}} to {name, {name, {name, value} of attributes, {name, {name, value} of attributes} of menu items of menu 1} of menu items of menu 1} of menu bar items of menu bar 1 of application process theApp
   
   repeat with mbIdx from 1 to (count menuNames)
       set end of params to return & theApp & ", menu " & mbIdx & " ( " & item mbIdx of menuNames & " )"
       repeat with mIdx from 1 to (count item mbIdx of menuItemNames)
           set miName to item mIdx of item mbIdx of menuItemNames
           if (miName is not missing value) then
               if {mbIdx, mIdx} is not {1, 9} then
                   set miLine to parseAttributes(miName, item mIdx of item mbIdx of menuItemAttributeNames, item mIdx of item mbIdx of menuItemAttributeValues)
                   
                   set end of params to miLine
                   repeat with smIdx from 1 to (count item mIdx of item mbIdx of submenuItemNames)
                       set smiName to item smIdx of item mIdx of item mbIdx of submenuItemNames
                       if (smiName is not missing value) then
                           set miLine to parseAttributes("> " & smiName, item smIdx of item mIdx of item mbIdx of submenuItemAttributeNames, item smIdx of item mIdx of item mbIdx of submenuItemAttributeValues)
                           set end of params to miLine
                       end if
                   end repeat
               else
                   set end of params to item mIdx of item mbIdx of menuItemNames
               end if # {mbIdx, mIdx} is not {1, 9}
           else
               # I wish to keep the separators
               if showSeparators then set end of params to "-----------"
           end if # (miName is not missing value)
       end repeat
   end repeat
   
   set params to my recolle(params, return)
   set nomDuRapport to (path to desktop as text) & theApp & (do shell script "date +_%Y%m%d_%H%M%S.txt")
   
   writeto(nomDuRapport, params, text, false)
   
end main


#tell application "Numbers" to open file nomDuRapport

#=====

on parseAttributes(miName, attrNames, attrValues)
   set {theChar, theVirtualKey, theGlyph, theModifiers, theShortcut} to {"", "", "", "", ""}
   
   repeat with miaIdx from 1 to (count attrNames)
       set thisAttrName to item miaIdx of attrNames
       if (thisAttrName is "AXMenuItemCmdChar") then
           set thisAttrValue to item miaIdx of attrValues
           if (thisAttrValue is not missing value) then set theChar to thisAttrValue
       else if (thisAttrName is "AXMenuItemCmdVirtualKey") then
           set thisAttrValue to item miaIdx of attrValues
           if (thisAttrValue is not missing value) then set theVirtualKey to thisAttrValue
       else if (thisAttrName is "AXMenuItemCmdGlyph") then
           set thisAttrValue to item miaIdx of attrValues
           if (thisAttrValue is not missing value) then set theGlyph to thisAttrValue
       else if (thisAttrName is "AXMenuItemCmdModifiers") then
           set thisAttrValue to item miaIdx of attrValues
           if (thisAttrValue is not missing value) then set theModifiers to thisAttrValue
       end if
   end repeat
   
   if ((count theChar) > 0) then
       set theShortcut to buildPrefix(theModifiers) & theChar
   else if (theGlyph's class is integer) then
       set theShortcut to buildPrefix(theModifiers) & specialKey(theGlyph)
   end if
   
   return recolle({miName, theChar, theVirtualKey, theGlyph, theModifiers, theShortcut}, tab)
end parseAttributes

on buildPrefix(the_Modifiers)
   set prefix to ""
   if (the_Modifiers mod 2 is 1) then set prefix to "shift + "
   if (the_Modifiers mod 4 > 1) then set prefix to "option + " & prefix
   if (the_Modifiers mod 8 > 3) then set prefix to prefix & "ctrl + "
   if (the_Modifiers mod 16 < 8) then set prefix to "cmd + " & prefix
   
   return prefix
end buildPrefix

#=====

on specialKey(the_Glyph)
   if the_Glyph = 2 then
       return "tab"
   else if the_Glyph = 23 then
       return "delete"
   else if the_Glyph = 27 then
       return "escape"
   else if the_Glyph = 100 then
       return "left arrow"
   else if the_Glyph = 101 then
       return "right arrow"
   else if the_Glyph = 104 then
       return "up arrow"
   else if the_Glyph = 106 then
       return "down arrow"
   else if (the_Glyph > 110) and (the_Glyph < 130) then # range 111 … 129
       return "F" & (the_Glyph - 110)
   else if the_Glyph = 148 then
       return "fn fn"
   else
       return ""
   end if # the_Glyph
end specialKey

#=====

on recolle(l, d)
   local oTIDs, t
   set {oTIDs, AppleScript's text item delimiters} to {AppleScript's text item delimiters, d}
   set t to "" & l
   set AppleScript's text item delimiters to oTIDs
   return t
end recolle

#=====
(*
Handler borrowed to Regulus6633 - http://macscripter.net/viewtopic.php?id=36861
*)
on writeto(targetFile, theData, dataType, apendData)
   -- targetFile is the path to the file you want to write
   -- theData is the data you want in the file.
   -- dataType is the data type of theData and it can be text, list, record etc.
   -- apendData is true to append theData to the end of the current contents of the file or false to overwrite it
   try
       set targetFile to targetFile as text
       set openFile to open for access file targetFile with write permission
       if not apendData then set eof of openFile to 0
       write theData to openFile starting at eof as dataType
       close access openFile
       return true
   on error
       try
           close access file targetFile
       end try
       return false
   end try
end writeto

#=====