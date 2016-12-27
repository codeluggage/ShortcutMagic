on executeChar(processName, char)
    try
        tell application processName
            key down char
        end tell
    end try

    -- Make sure they always come back up again
    key up char
end executeChar

on run()
    executeCharMod("iTerm2", "p", "command")
end run

on executeCharMod(processName, char, mod)
    try
        tell application processName
            keystroke char using { mod down }
        end tell
    end try

    -- Make sure they always come back up again
    key up char
    key up mod
end executeCharMod

on executeGlyph(processName, glyph)
    try
    	tell application processName
            key down glyph
    	end tell
    end try

    -- Make sure they always come back up again
    key up glyph
end executeGlyph

on executeGlyphMod(processName, glyph, mod)
    try
    	tell application processName
            keystroke glyph using mod
    	end tell
    end try

    -- Make sure they always come back up again
    key up glyph

        keystroke { mod up, glyph up }
end executeGlyphMod

on executeCharGlyphMod(processName, char, glyph, mod)
    try
    	tell application processName
            keystroke { mod down, char down, glyph down }
    	end tell
    catch
        keystroke { mod up, char up, glyph up }
    end try
end executeCharGlyphMod

-- Is this even possible?
on executeCharGlyph(processName, char, glyph)
    try
    	tell application processName
            keystroke { char down, glyph down }
    	end tell
    catch
        keystroke { char up, glyph up }
    end try
end executeCharGlyph
