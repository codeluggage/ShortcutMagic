on run {executeFunction, processName, char}
	if (executeFunction is equal to "execute") then execute(processName, char)
	if (executeFunction is equal to "executeCmd") then return executeCmd(processName, char)
	if (executeFunction is equal to "executeOpt") then executeOpt(processName, char)
	if (executeFunction is equal to "executeCtrl") then executeCtrl(processName, char)
	if (executeFunction is equal to "executeShift") then executeShift(processName, char)
	if (executeFunction is equal to "executeCmdOpt") then executeCmdOpt(processName, char)
	if (executeFunction is equal to "executeCmdCtrl") then executeCmdCtrl(processName, char)
	if (executeFunction is equal to "executeCmdShift") then executeCmdShift(processName, char)
	if (executeFunction is equal to "executeOptCtrl") then executeOptCtrl(processName, char)
	if (executeFunction is equal to "executeOptShift") then executeOptShift(processName, char)
	if (executeFunction is equal to "executeShiftCtrl") then executeShiftCtrl(processName, char)
	if (executeFunction is equal to "executeCmdOptShift") then executeCmdOptShift(processName, char)
	if (executeFunction is equal to "executeCmdOptCtrl") then executeCmdOptCtrl(processName, char)
	if (executeFunction is equal to "executeCmdShiftCtrl") then executeCmdShiftCtrl(processName, char)
	if (executeFunction is equal to "executeOptCtrlShift") then executeOptCtrlShift(processName, char)
	if (executeFunction is equal to "executeCmdOptCtrlShift") then executeCmdOptCtrlShift(processName, char)
end run

on executeShortcut(executeFunction, processName, char)
	if (executeFunction is equal to "execute") then execute(processName, char)
	if (executeFunction is equal to "executeCmd") then executeCmd(processName, char)
	if (executeFunction is equal to "executeOpt") then executeOpt(processName, char)
	if (executeFunction is equal to "executeCtrl") then executeCtrl(processName, char)
	if (executeFunction is equal to "executeShift") then executeShift(processName, char)
	if (executeFunction is equal to "executeCmdOpt") then executeCmdOpt(processName, char)
	if (executeFunction is equal to "executeCmdCtrl") then executeCmdCtrl(processName, char)
	if (executeFunction is equal to "executeCmdShift") then executeCmdShift(processName, char)
	if (executeFunction is equal to "executeOptCtrl") then executeOptCtrl(processName, char)
	if (executeFunction is equal to "executeOptShift") then executeOptShift(processName, char)
	if (executeFunction is equal to "executeShiftCtrl") then executeShiftCtrl(processName, char)
	if (executeFunction is equal to "executeCmdOptShift") then executeCmdOptShift(processName, char)
	if (executeFunction is equal to "executeCmdOptCtrl") then executeCmdOptCtrl(processName, char)
	if (executeFunction is equal to "executeCmdShiftCtrl") then executeCmdShiftCtrl(processName, char)
	if (executeFunction is equal to "executeOptCtrlShift") then executeOptCtrlShift(processName, char)
	if (executeFunction is equal to "executeCmdOptCtrlShift") then executeCmdOptCtrlShift(processName, char)

	return "run done"
end executeShortcut


-- Just char
on execute(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char
		end tell
	end try

	return "execute"
end execute




-- SINGLE
----------




on executeCmd(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down}
		end tell
	end try
end executeCmd

on executeOpt(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {option down}
		end tell
	end try
end executeOpt

on executeCtrl(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {control down}
		end tell
	end try
end executeCtrl

on executeShift(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {shift down}
		end tell
	end try
end executeShift




-- DOUBLES, CMD
----------




on executeCmdOpt(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down, option down}
		end tell
	end try
end executeCmdOpt

on executeCmdCtrl(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down, control down}
		end tell
	end try
end executeCmdCtrl

on executeCmdShift(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down, shift down}
		end tell
	end try
end executeCmdShift



-- DOUBLES, OPTION (no cmd)
----------



on executeOptCtrl(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {option down, control down}
		end tell
	end try
end executeOptCtrl

on executeOptShift(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {option down, shift down}
		end tell
	end try
end executeOptShift




-- DOUBLES, SHIFT (no alt, cmd)
----------




on executeShiftCtrl(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {shift down, control down}
		end tell
	end try
end executeShiftCtrl




-- TRIPLES
----------




on executeCmdOptShift(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down, option down, shift down}
		end tell
	end try
end executeCmdOptShift

on executeCmdOptCtrl(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down, option down, control down}
		end tell
	end try
end executeCmdOptCtrl

on executeCmdShiftCtrl(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {command down, shift down, control down}
		end tell
	end try
end executeCmdShiftCtrl

on executeOptCtrlShift(processName, char)
	try
		tell application "System Events"
			set bId to (bundle identifier of first process whose name is equal to processName)
		end tell

		tell application id bId to activate

		tell application "System Events"
			key code char using {option down, shift down, control down}
		end tell
    end try
end executeOptCtrlShift

-- QUADRUPLES
-------------

on executeCmdOptCtrlShift(processName, char)
    try
	tell application "System Events"
		set bId to (bundle identifier of first process whose name is equal to processName)
	end tell

	tell application id bId to activate

	tell application "System Events"
		key code char using {command down, option down, control down, shift down}
	end tell
    end try
end executeCmdOptCtrlShift
