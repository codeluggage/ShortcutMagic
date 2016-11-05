on readWindowOfApp(argv)
	tell application "System Events"
		set this_info to {}
		set innerList to {}
		
		repeat with theProcess in (application processes where visible is true)
			theProcess
			
			--try
			--	set theWindow to (window of theProcess where focused is true)
			--	set end of outerList to theWindow
			--	outerList
			--on error
			--	set theWindow to missing value
			--end try
			
			
			
			
			repeat with x from 1 to (count (every window of theProcess where focused is true))
				try
					set theWindow to window x of theProcess
				on error
					set theWindow to missing value
				end try
				
				--try
				--	set holdFrontmost to get focused of theWindow
				--	set end of innerList to holdFrontmost
				--on error
				--	set end of innerList to missing value
				--end try
				
				--try
				--	set holdPosition to (value of (first attribute whose name is "AXFullScreen") of theWindow)
				--	set end of innerList to holdPosition
				--on error
				--	set end of innerList to missing value
				--end try
				
				try
					set holdName to get name of theWindow
					set end of innerList to holdName
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
				
				
				--set outerList to outerList & innerList
			end repeat
			
			
			if ((count of innerList) > 1 and holdName is not equal to missing value) then
				set this_info to this_info & innerList
				return this_info
			end if
		end repeat
		
		--		this_info
		--		return this_info -- display list in results window of AppleScript Editor 
	end tell
end readWindowOfApp

on run (argv)
	return readWindowOfApp(argv)
end run
