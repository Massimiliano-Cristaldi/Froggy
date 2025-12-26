const vscode = require("vscode");

function getNthCharOccurrence(char, n, direction, fromEnd, checkNextLine) {
    const editor = vscode.window.activeTextEditor;

    let currentLineIndex = fromEnd ? editor.selection.end.line : editor.selection.start.line;
    let currentCharIndex = fromEnd ? editor.selection.end.character : editor.selection.start.character;
    let textAtCurrentLine = editor.document.lineAt(currentLineIndex).text;

    const zeroIndex = editor.document.lineAt(currentLineIndex).firstNonWhitespaceCharacterIndex;
    const lastCharIndex = textAtCurrentLine.length;
    const lastLineIndex = editor.document.lineCount - 1;

    const charStep = direction === "right" ? 1 : -1;
    const lineStep = direction === "right" && !editor.selection.isReversed ? 1 : -1;

    let nextLineChecked = false;

    while (true) {
        currentCharIndex += charStep;
        
        if (currentCharIndex < zeroIndex) {
            if (direction === "left" && checkNextLine && !nextLineChecked && currentLineIndex != 0) {
                currentLineIndex--;
                textAtCurrentLine = editor.document.lineAt(currentLineIndex).text;
                currentCharIndex = textAtCurrentLine.length - 1;
                
                nextLineChecked = true;
            } else {
                return new vscode.Position(currentLineIndex, zeroIndex);
            }
        } else if (currentCharIndex >= lastCharIndex) {
            if (direction === "right" && checkNextLine && !nextLineChecked && currentLineIndex != lastLineIndex) {
                currentLineIndex++;
                textAtCurrentLine = editor.document.lineAt(currentLineIndex).text;
                currentCharIndex = 0;

                nextLineChecked = true;
            } else {
                return new vscode.Position(currentLineIndex, lastCharIndex);
            }
        }

        const currentChar = textAtCurrentLine[currentCharIndex];

        if (currentChar.match(new RegExp(char))) {
            n--;
        }

        if (n === 0) {
            return new vscode.Position(currentLineIndex, currentCharIndex);
        }
    }
}

module.exports = {
    getNthCharOccurrence
}