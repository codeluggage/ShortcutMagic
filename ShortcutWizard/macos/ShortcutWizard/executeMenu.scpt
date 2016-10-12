on executeMenu(processName, menuItemName, menuName) -- subMenuName)
	-- might have to activate first?
	tell application "System Events" to tell application process processName
    	-- for sub menus in the future:
        --click menu item (menuItemName) of menu 1 of menu item (subMenuName) of menu 1 of menu bar item (menuName) of menu bar 1
        -- click menu item (menuItemName) of menu bar item (menuName) of menu bar 1
        click menu item menuItemName of menu 1 of menu bar item menuName of menu bar 1
	end tell
end executeMenu

on run(processName, menuItemName, menuName) -- subMenuName)
	return executeMenu(processName, menuItemName, menuName)
end run