(*
 Probe Menu Bar
 
 This script uses UI element scripting to return a list of every menuitem
 of every menu for every application currently running.
 
 Copyright © 2013 Apple Inc.
 
 You may incorporate this Apple sample code into your program(s) without
 restriction.  This Apple sample code has been provided "AS IS" and the
 responsibility for its operation is yours.  You are not permitted to
 redistribute this Apple sample code as "Apple sample code" after having
 made changes.  If you're going to redistribute the code, we require
 that you make it clear that the code was descended from Apple sample
 code, but that you've made changes.
 *)

try
	tell application "System Events"
		get properties
		get every process
		tell process "Evernote"
			get every menu bar
			tell menu bar 1
				set m1 to every menu bar item
				if (m1 is not equal to {}) then
					set m2 to every menu of every menu bar item
					if (m2 is not equal to {}) then
						set m3 to every menu item of every menu of every menu bar item
						if (m2 is not equal to {}) then
							if (title of m2 is not equal to "") then
								set m3 to every menu of every menu item of every menu of every menu bar item
								if (m3 is not {}) then
									get every menu item of every menu of every menu item of every menu of every menu bar item
								end if
							end if
						end if
					end if
				end if
			end tell
		end tell
		display dialog "The 'Probe Menu Bar' script was executed, it uses UI element scripting to return a list of every menuitem
 of every menu for every application currently running, to see results run it within AppleScript Editor."
	end tell
on error errMsg
	display dialog "Error: " & errMsg
end try
