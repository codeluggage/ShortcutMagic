set proc to "Evernote"
tell application "System Events" to tell process proc
    set out to ""
    set v to menu bar item 1 of menu bar 1
    -- repeat with v in menu bar items 2 thru -1 of menu bar 1
    set out to out & name of v & linefeed
    repeat with w in menu items of menu 1 of v
        set out to out & "  " & my getshortcut(proc, w) & "  " & name of w & linefeed
        try
            repeat with x in menu items of menu 1 of w
                set out to out & "    " & my getshortcut(proc, x) & "  " & name of x & linefeed
            end repeat
        end try
    end repeat
    -- end repeat
end tell

on getshortcut(proc, x)
    set text item delimiters to space
    set menuglyphs to text items of "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"
    set cmdmods to text items of "⌘ ⇧⌘ ⌥⌘ ⌥⇧⌘ ⌃⌘ ⌃⇧⌘ ⌃⌥⌘ ⌃⌥⇧⌘ - ⇧ ⌥ ⌥⇧ ⌃ ⌃⇧ ⌃⌥ ⌃⌥⇧"
    tell application "System Events" to tell process proc
        set c to ""
        try
            set n to value of attribute "AXMenuItemCmdModifiers" of x
            set modifier to item (n + 1) of cmdmods
            try
                set c to (value of attribute "AXMenuItemCmdChar" of x)
                c as text
                return modifier & c
            on error
                set glyph to (value of attribute "AXMenuItemCmdGlyph" of x) as text
                repeat with i from 1 to (count menuglyphs)
                    if item i of menuglyphs is glyph then
                        return modifier & item (i + 1) of menuglyphs
                    end if
                end repeat
            end try
        end try
        return "-"
    end tell
end getshortcut

out