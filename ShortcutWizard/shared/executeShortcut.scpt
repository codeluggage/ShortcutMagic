on run(processName, char)
    executeCmd(processName, char)
end run


-- Just char
on execute(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char
        end tell
    end try
end execute




-- SINGLE
----------




on executeCmd(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down}
        end tell
    end try
end executeCmd

on executeOpt(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {option down}
        end tell
    end try
end executeOpt

on executeCtrl(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {control down}
        end tell
    end try
end executeCtrl

on executeShift(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {shift down}
        end tell
    end try
end executeShift




-- DOUBLES, CMD
----------




on executeCmdOpt(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, option down}
        end tell
    end try
end executeCmdOpt

on executeCmdCtrl(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, control down}
        end tell
    end try
end executeCmdCtrl

on executeCmdShift(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, shift down}
        end tell
    end try
end executeCmdShift



-- DOUBLES, OPTION (no cmd)
----------



on executeOptCtrl(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {option down, control down}
        end tell
    end try
end executeOptCtrl

on executeOptShift(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {option down, shift down}
        end tell
    end try
end executeOptShift




-- DOUBLES, SHIFT (no alt, cmd)
----------




on executeShiftCtrl(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {shift down, control down}
        end tell
    end try
end executeShiftCtrl




-- TRIPLES
----------




on executeCmdOptShift(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, option down, shift down}
        end tell
    end try
end executeCmdOptShift

on executeCmdOptCtrl(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, option down, control down}
        end tell
    end try
end executeCmdOptCtrl

on executeCmdShiftCtrl(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, shift down, control down}
        end tell
    end try
end executeCmdShiftCtrl

on executeOptCtrlShift(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {option down, control down, shift down}
        end tell
    end try
end executeOptCtrlShift



-- QUADRUPLE
------------



on executeCmdOptCtrlShift(processName, char)
    try
        tell application "System Events"
            if processName is not equal to (name of first process where it is frontmost) then activate application processName
            key code char using {command down, option down, control down, shift down}
        end tell
    end try
end executeCmdOptCtrlShift
