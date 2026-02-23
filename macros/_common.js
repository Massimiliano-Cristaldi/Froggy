const vscode = require("vscode");

const capitalA = 65;
const capitalZ = 90;

String.prototype.reverse = function () {
    return this.split("").reverse().join("");
}

function getNextCharSelection(charset, direction, select) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const lastLineIndex = editor.document.lineCount - 1;

    let selections = [];

    for (let selection of editor.selections) {
        let startPosition =
            selection.isReversed ?
                selection.start :
                selection.end;
        let startLineText = editor.document.lineAt(startPosition.line).text;

        const firstCharAtCurrLine = editor.document.lineAt(startPosition.line).firstNonWhitespaceCharacterIndex;
        const lastCharAtCurrLine = startLineText.length;

        let startChar;
        let substr;

        if (direction === "right") {
            if (startPosition.character === lastCharAtCurrLine) {
                selection = getNewLineSelection(selection, direction, select, lastLineIndex);

                //When moving to a new line, jumping will simply move to the end of the previous line
                //Or the start of the next line, while selecting will also look for a match from that position
                if (!select) {
                    selections.push(selection);
                    continue;
                }

                startPosition = selection.isReversed ? selection.start : selection.end;
                startLineText = editor.document.lineAt(startPosition.line).text;
            }

            startChar = startPosition.character;
            substr = startLineText.substring(startChar + 1);
        } else {
            if (startPosition.character === firstCharAtCurrLine) {
                selection = getNewLineSelection(selection, direction, select, lastLineIndex);

                //When moving to a new line, jumping will simply move to the end of the previous line
                //Or the start of the next line, while selecting will also look for a match from that position
                if (!select) {
                    selections.push(selection);
                    continue;
                }

                startPosition = selection.isReversed ? selection.start : selection.end;
                startLineText = editor.document.lineAt(startPosition.line).text;
            }

            startChar = startLineText.length - startPosition.character;
            substr = startLineText.reverse().substring(startChar);
        }

        let offset;
        switch (charset) {
            case "caseSmart":
                offset = getCaseSmartCharOffset(substr, direction);
                break;
            case "whiteSpace":
                offset = substr.indexOf(" ");
                break;
        }

        if (offset === -1) {
            selections.push(getNoMatchSelection(selection, direction, select));
            continue;
        }

        selections.push(getDefaultNextCharSelection(selection, direction, offset, select));
    }

    return selections;
}

function getNewLineSelection(selection, direction, select, lastLineIndex) {
    const editor = vscode.window.activeTextEditor;

    const startLine = editor.document.lineAt(selection.start.line);
    const endLine = editor.document.lineAt(selection.end.line);

    const startLineFirstChar = startLine.firstNonWhitespaceCharacterIndex;
    const startLineLastChar = startLine.text.length;
    const endLineFirstChar = endLine.firstNonWhitespaceCharacterIndex;
    const endLineLastChar = endLine.text.length;

    let nextLine;
    let nextChar;
    let startPosition;
    let endPosition;

    switch (true) {
        case direction === "right" && !selection.isReversed && selection.end.character === endLineLastChar:
            if (selection.end.line !== lastLineIndex) {
                nextLine = selection.end.line + 1;
                nextChar = editor.document.lineAt(nextLine).firstNonWhitespaceCharacterIndex;
                endPosition = new vscode.Position(nextLine, nextChar);
            } else {
                endPosition = selection.end;
            }
            break;
        case direction === "right" && selection.isReversed && selection.start.character === startLineLastChar:
            if (selection.start.line !== lastLineIndex) {
                nextLine = selection.start.line + 1;
                nextChar = editor.document.lineAt(nextLine).firstNonWhitespaceCharacterIndex;
                endPosition = new vscode.Position(nextLine, nextChar);
            } else {
                endPosition = selection.start;
            }
            break;
        case direction === "left" && !selection.isReversed && selection.end.character === endLineFirstChar:
            if (selection.end.line !== 0) {
                nextLine = selection.end.line - 1;
                nextChar = editor.document.lineAt(nextLine).text.length;
                endPosition = new vscode.Position(nextLine, nextChar);
            } else {
                endPosition = selection.end;
            }
            break;
        case direction === "left" && selection.isReversed && selection.start.character == startLineFirstChar:
            if (selection.start.line !== 0) {
                nextLine = selection.start.line - 1;
                nextChar = editor.document.lineAt(nextLine).text.length;
                endPosition = new vscode.Position(nextLine, nextChar);
            } else {
                endPosition = selection.start;
            }
            break;
    }

    if (select) {
        startPosition = selection.isReversed ? selection.end : selection.start;
    } else {
        startPosition = endPosition;
    }

    return new vscode.Selection(startPosition, endPosition);
}

function getNoMatchSelection(selection, direction, select) {
    const editor = vscode.window.activeTextEditor;

    let newSelection;
    let destChar;

    switch (true) {
        case !selection.isReversed && direction === "right" && !select:
            destChar = editor.document.lineAt(selection.end.line).text.length;
            newSelection = new vscode.Selection(
                new vscode.Position(selection.end.line, destChar),
                new vscode.Position(selection.end.line, destChar)
            );
            break;
        case !selection.isReversed && direction === "right" && select:
            destChar = editor.document.lineAt(selection.end.line).text.length;
            newSelection = new vscode.Selection(
                selection.start,
                new vscode.Position(selection.end.line, destChar)
            );
            break;
        case !selection.isReversed && direction === "left" && !select:
            destChar = editor.document.lineAt(selection.end.line).firstNonWhitespaceCharacterIndex;
            newSelection = new vscode.Selection(
                new vscode.Position(selection.end.line, destChar),
                new vscode.Position(selection.end.line, destChar)
            );
            break;
        case !selection.isReversed && direction === "left" && select:
            destChar = editor.document.lineAt(selection.end.line).firstNonWhitespaceCharacterIndex;
            newSelection = new vscode.Selection(
                selection.start,
                new vscode.Position(selection.end.line, destChar)
            );
            break;
        case selection.isReversed && direction === "right" && !select:
            destChar = editor.document.lineAt(selection.start.line).text.length;
            newSelection = new vscode.Selection(
                new vscode.Position(selection.start.line, destChar),
                new vscode.Position(selection.start.line, destChar)
            );
            break;
        case selection.isReversed && direction === "right" && select:
            destChar = editor.document.lineAt(selection.start.line).text.length;

            newSelection = new vscode.Selection(
                selection.end,
                new vscode.Position(selection.start.line, destChar)
            );
            break;
        case selection.isReversed && direction === "left" && !select:
            destChar = editor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex;
            newSelection = new vscode.Selection(
                new vscode.Position(selection.start.line, destChar),
                new vscode.Position(selection.start.line, destChar)
            );
            break;
        case selection.isReversed && direction === "left" && select:
            destChar = editor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex;
            newSelection = new vscode.Selection(
                selection.end,
                new vscode.Position(selection.start.line, destChar)
            );
            break;
    }

    return newSelection;
}

function getDefaultNextCharSelection(selection, direction, offset, select) {
    const editor = vscode.window.activeTextEditor;

    let startPosition;
    let endChar;
    let endPosition;

    const startLineFirstChar = editor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex;
    const endLineFirstChar = editor.document.lineAt(selection.end.line).firstNonWhitespaceCharacterIndex;

    switch (true) {
        case direction === "right" && !selection.isReversed:
            endChar = selection.end.character + offset + 1;
            endPosition = new vscode.Position(selection.end.line, endChar);
            break;
        case direction === "right" && selection.isReversed:
            endChar = selection.start.character + offset + 1;
            endPosition = new vscode.Position(selection.start.line, endChar);
            break;
        case direction === "left" && !selection.isReversed:
            endChar = Math.max(selection.end.character - offset - 1, endLineFirstChar);
            endPosition = new vscode.Position(selection.end.line, endChar);
            break;
        case direction === "left" && selection.isReversed:
            endChar = Math.max(selection.start.character - offset - 1, startLineFirstChar);
            endPosition = new vscode.Position(selection.start.line, endChar);
            break;
    }

    if (select) {
        startPosition = selection.isReversed ? selection.end : selection.start;
    } else {
        startPosition = endPosition;
    }

    return new vscode.Selection(startPosition, endPosition);
}

function getCaseSmartCharOffset(substr, direction) {
    const breakpoints = ["_", "-", " ", "\t", "\"", "'", ";", ",", ".", "(", ")", "[", "]", "[", "]"];
    let capitalLetters = 0;

    for (let i = 0; i < substr.length; i++) {
        const char = substr[i];

        if (breakpoints.includes(char)) {
            return i;
        } else if (char === "_") {
            return i - 1;
        }

        const codePoint = char.codePointAt(0);

        if (codePoint >= capitalA && codePoint <= capitalZ) {
            if (capitalLetters === 0 && i !== 0) {
                if (peekForCapital(substr, i)) {
                    return direction === "right" ? i : i - 1;
                }
                
                return i;
            }

            capitalLetters++;
        } else if (capitalLetters === 1) {
            return i - 1;
        } else if (capitalLetters > 1) {
            return direction === "right" ? i : i - 1;
        }
    }

    return -1;
}

function peekForCapital(substr, i) {
    if (i >= substr.length - 1) {
        return false;
    }

    const nextCharCodePoint = substr.codePointAt(i + 1);
    if (nextCharCodePoint >= capitalA && nextCharCodePoint <= capitalZ) {
        return true;
    }

    return false;
}

function moveToNextCharOccurrence(charset, direction) {
    return getNextCharSelection(charset, direction, false);
}

function selectToNextCharOccurrence(charset, direction) {
    return getNextCharSelection(charset, direction, true);
}

function goToLineEdge(selection, destination, select) {
    const editor = vscode.window.activeTextEditor;

    let startPosition;
    let endPosition;

    switch (true) {
        case destination === "end" && !selection.isReversed:
            endPosition = new vscode.Position(
                selection.end.line,
                editor.document.lineAt(selection.end.line).text.length
            );
            startPosition = select ? selection.start : endPosition;
            break;
        case destination === "end" && selection.isReversed:
            endPosition = new vscode.Position(
                selection.start.line,
                editor.document.lineAt(selection.start.line).text.length
            );
            startPosition = select ? selection.end : endPosition;
            break;
        case destination === "start" && !selection.isReversed:
            endPosition = new vscode.Position(
                selection.end.line,
                editor.document.lineAt(selection.end.line).firstNonWhitespaceCharacterIndex
            );
            startPosition = select ? selection.start : endPosition;
            break;
        case destination === "start" && selection.isReversed:
            endPosition = new vscode.Position(
                selection.start.line,
                editor.document.lineAt(selection.start.line).firstNonWhitespaceCharacterIndex
            );
            startPosition = select ? selection.end : endPosition;
            break;
    }

    return new vscode.Selection(
        startPosition,
        endPosition
    );
}

function moveToLineEdge(selection, destination) {
    return goToLineEdge(selection, destination, false);
}

function selectToLineEdge(selection, destination) {
    return goToLineEdge(selection, destination, true);
}

function focusLastSelection() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const lastSelection = editor.selections[editor.selections.length - 1];
    const lineToFocus = lastSelection.isReversed ?
        lastSelection.start.line :
        lastSelection.end.line;

    vscode.commands.executeCommand("revealLine", {
        lineNumber: lineToFocus,
        at: "center"
    });
}

/**
 * Fixes a problem with VSCode's select next occurrence command: by default all new selections are
 * not reversed,  but this causes inconsistencies with certain commands; every time selection count
 * is updated, the following selections are updated to have the same orientation as the first one.
 */
function recalculateMultiselections() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const firstSelection = editor.selections[0];
    let selections = [firstSelection];
    let currentSelection;

    for (let i = 1; i < editor.selections.length; i++) {
        currentSelection = editor.selections[i];

        if (firstSelection.isReversed && !currentSelection.isReversed) {
            selections.push(
                new vscode.Selection(
                    currentSelection.end,
                    currentSelection.start
                )
            );
        } else if (!firstSelection.isReversed && currentSelection.isReversed) {
            selections.push(
                new vscode.Selection(
                    currentSelection.start,
                    currentSelection.end
                )
            );
        } else {
            selections.push(currentSelection);
        }
    }

    editor.selections = selections;
}

module.exports = {
    moveToNextCharOccurrence,
    selectToNextCharOccurrence,
    moveToLineEdge,
    selectToLineEdge,
    focusLastSelection,
    recalculateMultiselections
}