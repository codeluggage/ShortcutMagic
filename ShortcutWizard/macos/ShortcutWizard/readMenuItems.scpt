on readShortcuts(argv)	tell application "System Events"		tell application process argv			set liste to {}			set liste2 to {}			set holdMenuBarItems to {}			set holdTopBar to menu bar 1						-- from 2 because 1 is Apple menu			repeat with y from 2 to (count every menu bar item of holdTopBar)				set innerBarItem to menu bar item y of holdTopBar								repeat with x from 1 to (count every menu of innerBarItem)					set innerMenu to menu x of innerBarItem										repeat with z from 1 to (count every menu item of innerMenu)						set miniList to {}						set shortcut to menu item z of innerMenu												try							set holdName to get name of shortcut							if (holdName is not equal to missing value) then								set end of miniList to holdName							end if						on error							set holdName to missing value						end try												set holdCmdChar to missing value						try							set holdCmdChar to get value of attribute "AXMenuItemCmdChar" of shortcut							if (holdCmdChar is not equal to missing value) then								set end of miniList to holdCmdChar							end if						on error							set holdCmdChar to missing value						end try												set holdCmdMod to missing value						try							set holdCmdMod to get value of attribute "AXMenuItemCmdModifiers" of shortcut							if (holdCmdMod is not equal to 0) then								set end of miniList to holdCmdMod							end if						on error							set holdCmdMod to missing value						end try												set holdCmdGlyph to missing value						try							set holdCmdGlyph to (value of attribute "AXMenuItemCmdGlyph" of shortcut) as text							if (holdCmdGlyph is not equal to "missing value") then								set end of miniList to holdCmdGlyph							end if						on error							set holdCmdGlyph to missing value						end try												--set holdCmd???? to (value of attribute "AXMenuItemCmdGlyph" of shortcut) as text						--try						--	holdCmd???						--on error						--	set holdCmd??? to missing value						--end try						-- how to extract: 						-- set menuglyphs to text items of "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"						-- set cmdmods to text items of "⌘ ⇧⌘ ⌥⌘ ⌥⇧⌘ ⌃⌘ ⌃⇧⌘ ⌃⌥⌘ ⌃⌥⇧⌘ - ⇧ ⌥ ⌥⇧ ⌃ ⌃⇧ ⌃⌥ ⌃⌥⇧"						-- repeat with i from 1 to (count menuglyphs)						-- if item i of holdCmdGlyph is glyph then						-- return modifier & item (i + 1) of menuglyphs						-- end 						-- end repeat												if ((count of miniList) > 2 or holdCmdChar is not equal to missing value) then							set end of liste2 to miniList						end if						-- set holdMenuItemChild to menu item i												-- set mName to get name of holdMenuItemChild																	end repeat				end repeat								set end of liste to liste2				set liste2 to {}			end repeat						return liste		end tell	end tellend readShortcutson run (argv)	return readShortcuts(argv)end run