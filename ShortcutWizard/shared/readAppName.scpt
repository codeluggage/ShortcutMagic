on readAppName(argv)
	tell application "System Events"
		-- return get name of first process where it is frontmost

		-- TODO: simplify this when previous app name is stored in javascript
	    set frontmostProcess to first process where it is frontmost
	    set visible of frontmostProcess to false
	    repeat while (frontmostProcess is frontmost)
	        delay 0.1
	    end repeat
	    set targetName to name of first process where it is frontmost
	    if (argv is equal to "true")
		    set frontmost of frontmostProcess to true
		    set visible of frontmostProcess to true
		end if
	    return targetName
	end tell
end readAppName

on run (argv)
	return readAppName(argv)
end run


--- potentially use this to avoid selecting SW as first app:

-- tell application "System Events"
--     set frontmostProcess to first process where it is frontmost
--     set visible of frontmostProcess to false
--     repeat while (frontmostProcess is frontmost)
--         delay 0.2
--     end repeat
--     set secondFrontmost to name of first process where it is frontmost
--     set frontmost of frontmostProcess to true
-- end tell

-- tell application (path to frontmost application as text)
--     if "Finder" is in secondFrontmost then
--         display dialog ("Finder was last in front")
--     else
--         display dialog (secondFrontmost & " was last in front")
--     end if
-- end tell