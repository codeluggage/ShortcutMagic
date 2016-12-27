-- Just char
on execute(processName, char)
    try
    	activate application processName
    	tell application "System Events" to key code char
    end try
end execute




-- SINGLE
----------




on executeCmd(processName, char)
    try
    	activate application processName
    	tell application "System Events" to key code char using {command down}
    end try
end executeCmd

on executeOpt(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {option down}
    end try
end executeOpt

on executeCtrl(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {control down}
    end try
end executeCtrl

on executeShift(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {shift down}
    end try
end executeShift




-- DOUBLES, CMD
----------




on executeCmdOpt(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, option down}
    end try
end executeCmdOpt

on executeCmdCtrl(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, control down}
    end try
end executeCmdCtrl

on executeCmdShift(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, shift down}
    end try
end executeCmdShift



-- DOUBLES, OPTION (no cmd)
----------



on executeOptCtrl(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {option down, control down}
    end try
end executeOptCtrl

on executeOptShift(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {option down, shift down}
    end try
end executeOptShift




-- DOUBLES, SHIFT (no alt, cmd)
----------




on executeShiftCtrl(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {shift down, control down}
    end try
end executeShiftCtrl




-- TRIPLES
----------




on executeCmdOptShift(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, option down, shift down}
    end try
end executeCmdOptShift

on executeCmdOptCtrl(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, option down, control down}
    end try
end executeCmdOptCtrl

on executeCmdShiftCtrl(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, shift down, control down}
    end try
end executeCmdShiftCtrl

on executeOptCtrlShift(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {option down, control down, shift down}
    end try
end executeOptCtrlShift



-- QUADRUPLE
------------



on executeCmdOptCtrlShift(processName, char)
    try
        activate application processName
        tell application "System Events" to key code char using {command down, option down, control down, shift down}
    end try
end executeCmdOptCtrlShift
