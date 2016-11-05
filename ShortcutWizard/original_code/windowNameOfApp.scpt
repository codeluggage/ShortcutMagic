on windowNameOfApp(argv)
	tell application "System Events"
		try
			set frontApp to first application process whose name is equal to argv
			set frontAppName to name of frontApp
			tell process frontAppName
				tell (1st window whose value of attribute "AXMain" is true)
					return value of attribute "AXTitle"
				end tell
			end tell
		on error
			try
				return name of window of first application process whose name is equal to argv
			on error
				return ""
			end try
		end try
		--		set theName to name of window of first application process whose name is equal to argv
	end tell
end windowNameOfApp

on run (argv)
	return windowNameOfApp(argv)
end run
