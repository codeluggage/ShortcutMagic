on readWindowsOfApp(argv)
	tell application "System Events"
		set this_info to {}
		
		repeat with theProcess in (application processes where visible is true)
			set outerList to {}
			
			repeat with x from 1 to (count every window of theProcess)
				set theWindow to window x of theProcess
				
				set innerList to {}
				
				try
					set holdName to get name of theWindow
					set end of innerList to holdName
				on error
					set end of innerList to missing value
				end try
				
				try
					set holdFrontmost to (value of (first attribute whose name is "frontmost") of theWindow)
					set end of innerList to ("frontmost::::::::::" & holdFrontmost)
				on error
					set end of innerList to missing value
				end try
				
				try
					set holdPosition to (value of (first attribute whose name is "AXFullScreen") of theWindow)
					set end of innerList to holdPosition
				on error
					set end of innerList to missing value
				end try
				
				try
					-- set holdSize to (value of size of theWindow)   
					set holdFrame to (value of (first attribute whose name is "AXFrame") of theWindow)
					set end of innerList to holdFrame
				on error
					set end of innerList to missing value
				end try
				
				set outerList to outerList & innerList
			end repeat
			
			set this_info to this_info & outerList
		end repeat
		
		return this_info -- display list in results window of AppleScript Editor 
	end tell
end readWindowsOfApp

on run (argv)
	return readWindowsOfApp(argv)
end run
