Thanks for using Froggy!

Froggy is a simple tool for quick movement of the text cursor.

The main movements have default keybindings:
- go up 5 lines = ctrl + up
- go down 5 lines = ctrl + down
- go up 10 lines = ctrl + alt + up
- go down 10 lines = ctrl + alt + down
- go to line start = ctrl + alt + left
- go to line end = ctrl + alt + right
- expand selection up by 5 lines = ctrl + shift + up
- expand selection down by 5 lines = ctrl + shift + down
- expand selection up by 10 lines = ctrl + alt + shift + up
- expand selection down by 10 lines = ctrl + alt + shift + down
- expand selection to beginning of first line of the selection range = ctrl + alt + shift + left
- expand selection to end of last line of the selection range = ctrl + alt + shift + right

It's easy to remember these shortcuts: ctrl means jump close, ctrl + alt means jump far, adding shift means select instead of moving

More advanced macros can be accessed through a prompt menu.
The prompt menu is opened with ctrl + alt + numpad6 by default, but this keybinding can be changed in VSCode's keybindings.json file (default location for Windows: C:/Users/Username/AppData/Roaming/Code/User), by adding this to the existing array:
    {
        "key": "(your desired key combination)",
        "command": "badlvckinc.FroggyPrompt",
        "when": "editorTextFocus"
    }

Advanced macros include:
- start = go to first line of file
- end = go to last line of file
- up(number) e.g. up40 = go up (number) lines
- down(number) e.g. down40 = go down (number) lines
- goto(number) e.g. goto75 = go to line (number)
- shup(number) e.g. shup15 = move selection up by (number) lines
- shdown(number) e.g. shdown15 = move selection down by (number) lines
- next(chars) e.g. nextdb = find next occurrence of one or more characters starting from the current position of the text cursor
- prev(chars) e.g. prevdb = find previous occurrence of one or more characters starting from the current position of the text cursor
- first(chars) e.g. firstdb = find first occurrence of one or more characters
- last(chars) e.g. lastdb = find last occurrence of one or more characters
- def(chars) e.g. defdb = go to definition of a given symbol

Commands that take a string as argument can be run without any arguments if you have some text selected, in which case the current selection will be passed as an argument to that command (e.g. 'next' will find the next occurrence of the currently selected text).
These commands can also take the last string parameter given to a command, by passing '#' to it. For example, if I execute 'firstdb', I can then execute 'last#' to find the last occurrence of 'db' (since it's the last string parameter used), 'next#' to find the next occurrence of 'db', and so on. Should you want to pass '#' as a string argument without any special meaning, you can simply escape it (e.g. 'prev\#').

Advanced macros can be repeated with the command badlvckinc.RepeatLastCommand. The default keybinding for this command is ctrl + alt + numpad5, but it can be changed by editing the keybindings.json file, like explained above.
