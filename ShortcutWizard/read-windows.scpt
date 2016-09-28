property pstrJS : "

function (ed) {
	var arrCmd = ed.commands(),
		lst = [],
		dctCmd, strKey;
	for (var lng = arrCmd.length, i = 0; i < lng; i++) {
		dctCmd = arrCmd[i];
		lst.push(
			(strKey = dctCmd.shortcut) ?
			dctCmd.name + '\\t' + strKey :
			dctCmd.name
		);
	}
	lst.sort();
	return lst.join('\\n');
}

"

tell application "Evernote"
	set lstDocs to documents
	if lstDocs is not {} then
		tell item 1 of lstDocs to set strCommands to (evaluate script pstrJS)
		return strCommands
	end if
end tell
