on executeChar(processName, char)
    try
        tell application processName
            keystroke { char down }
        end tell
    catch
        keystroke { char up }
    end try
end executeShortcut

on executeCharMod(processName, char, mod)
    try
        tell application processName
            keystroke { mod down, char down }
        end tell
    catch
        keystroke { mod up, char up }
    end try
end executeShortcut

on executeGlyph(processName, glyph)
    try
    	tell application processName
            keystroke { glyph down }
    	end tell
    catch
        keystroke { glyph up }
    end try
end executeShortcut

on executeGlyphMod(processName, glyph, mod)
    try
    	tell application processName
            keystroke { mod down, glyph down }
    	end tell
    catch
        keystroke { mod up, glyph up }
    end try
end executeShortcut

on executeCharGlyphMod(processName, char, glyph, mod)
    try
    	tell application processName
            keystroke { mod down, char down, glyph down }
    	end tell
    catch
        keystroke { mod up, char up, glyph up }
    end try
end executeShortcut

-- Is this even possible?
on executeCharGlyph(processName, char, glyph)
    try
    	tell application processName
            keystroke { char down, glyph down }
    	end tell
    catch
        keystroke { char up, glyph up }
    end try
end executeShortcut
