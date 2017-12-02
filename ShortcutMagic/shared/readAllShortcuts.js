'use strict'

const { exec } = require('child_process')

module.exports = function(programName, cb) {
	exec(`osascript shared/readAllMenuItems.scpt "${programName}"`, (err, res) => {
		let allShortcuts = []

		res.split('?????').filter(m => m && m.length).forEach(menu => {
			const shortcutsStartPos = menu.indexOf('||')
			const menuName = menu.substr(0, shortcutsStartPos)
			const shortcuts = menu.substr(shortcutsStartPos, menu.length - 1).split('!!!!!')

			shortcuts.filter(f => f && f.length).forEach(shortcut => {
				const splitShortcuts = shortcut.split('||').filter(f => f && f.length)
				const [ name, pos, char, mod, glyph ] = splitShortcuts

				if (splitShortcuts.length < 5 || !name || name === 'missing value') { 
					return
				}

				let finalShortcut = {
					menuName,
					name,
					pos,
				}

				if (char && char !== 'missing value') {
					finalShortcut["char"] = char
				}
				// Default mod for command is 0, so double check that it is not an "empty command" entry when there are no other keys
				if (mod !== 'missing value' && ((char && char !== 'missing value' && char.length) || (glyph && glyph !== 'missing value' && glyph.length))) {
					finalShortcut["mod"] = unwrapMod[mod]
				}
				if (glyph !== 'missing value') {
					finalShortcut["glyph"] = unwrapGlyph[glyph]
				}

				allShortcuts.push(finalShortcut)
			})
		})

		cb({
			name: programName,
			shortcuts: allShortcuts
		})
	})
}

let unwrapMod = []
unwrapMod[0] = '⌘'
unwrapMod[1] = '⇧⌘'
unwrapMod[2] = '⌥⌘'
unwrapMod[3] = '⌥⇧⌘'
unwrapMod[4] = '⌃⌘'
unwrapMod[5] = '⌃⇧⌘'
unwrapMod[6] = '⌃⌥⌘'
unwrapMod[7] = '⌃⌥⇧⌘'

// TOOD: Determine what '8' actually means
// unwrapMod[8] = '-'
unwrapMod[8] = ''

unwrapMod[9] = '⇧'
unwrapMod[10] = '⌥'
unwrapMod[11] = '⌥⇧'
unwrapMod[12] = '⌃'
unwrapMod[13] = '⌃⇧'
unwrapMod[14] = '⌃⌥'
unwrapMod[15] = '⌃⌥⇧'

  // "2 ⇥ 3 ⇤ 4 ⌤ 9 ␣ 10 ⌦ 11 ↩ 16 ↓ 23 ⌫ 24 ← 25 ↑ 26 → 27 ⎋ 28 ⌧ 98 ⇞ 99 ⇪ 100 ← 101 → 102 ↖ 104 ↑ 105 ↘ 106 ↓ 107 ⇟ 111 F1 112 F2 113 F3 114 F4 115 F5 116 F6 117 F7 118 F8 119 F9 120 F10 121 F11 122 F12 135 F13 136 F14 137 F15 140 ⏏ 143 F16 144 F17 145 F18 146 F19"
let unwrapGlyph = []
unwrapGlyph[2] = '⇥'
unwrapGlyph[3] = '⇤'
unwrapGlyph[4] = '⌤'
unwrapGlyph[9] = 'Space'
unwrapGlyph[10] = '⌦'
unwrapGlyph[11] = '↩'
unwrapGlyph[16] = '↓'
unwrapGlyph[23] = '⌫'
unwrapGlyph[24] = '←'
unwrapGlyph[25] = '↑'
unwrapGlyph[26] = '→'
unwrapGlyph[27] = '⎋'
unwrapGlyph[28] = '⌧'
unwrapGlyph[98] = '⇞'
unwrapGlyph[99] = '⇪'
unwrapGlyph[100] = '←'
unwrapGlyph[101] = '→'
unwrapGlyph[102] = '↖'
unwrapGlyph[104] = '↑'
unwrapGlyph[105] = '↘'
unwrapGlyph[106] = '↓'
unwrapGlyph[107] = '⇟'
unwrapGlyph[111] = 'F1'
unwrapGlyph[112] = 'F2'
unwrapGlyph[113] = 'F3'
unwrapGlyph[114] = 'F4'
unwrapGlyph[115] = 'F5'
unwrapGlyph[116] = 'F6'
unwrapGlyph[117] = 'F7'
unwrapGlyph[118] = 'F8'
unwrapGlyph[119] = 'F9'
unwrapGlyph[120] = 'F10'
unwrapGlyph[121] = 'F11'
unwrapGlyph[122] = 'F12'
unwrapGlyph[135] = 'F13'
unwrapGlyph[136] = 'F14'
unwrapGlyph[137] = 'F15'
unwrapGlyph[140] = '⏏'
unwrapGlyph[143] = 'F16'
unwrapGlyph[144] = 'F17'
unwrapGlyph[145] = 'F18'
unwrapGlyph[146] = 'F19'
