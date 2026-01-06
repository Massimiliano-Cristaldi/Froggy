const vscode = require("vscode");

function getNthCharOccurrence(char, n, direction, fromEnd) {
    const editor = vscode.window.activeTextEditor;

    const currentLineIndex = fromEnd ? editor.selection.end.line : editor.selection.start.line;
    const lastLineIndex = editor.document.lineCount - 1;
    
    const currentLine = editor.document.lineAt(currentLineIndex);
    const textAtCurrentLine = currentLine.text;
    
    const zeroIndex = currentLine.firstNonWhitespaceCharacterIndex;
    const lastCharIndex = textAtCurrentLine.length;
    
    const charStep = direction === "right" ? 1 : -1;
    let currentCharIndex = fromEnd ? editor.selection.end.character : editor.selection.start.character;

    while (n !== 0) {
        currentCharIndex += charStep;
        
        if (currentCharIndex < zeroIndex && direction === "left" && currentLineIndex != 0) {
            const newLastCharIndex = editor.document.lineAt(currentLineIndex - 1).text.length;
            return new vscode.Position(currentLineIndex - 1, newLastCharIndex);
        } else if (currentCharIndex === zeroIndex) {
            return new vscode.Position(currentLineIndex, zeroIndex);
        } else if (currentCharIndex >= lastCharIndex) {
            if (direction === "right" && currentLineIndex != lastLineIndex) {
                const newZeroIndex = editor.document.lineAt(currentLineIndex + 1).firstNonWhitespaceCharacterIndex;
                return new vscode.Position(currentLineIndex + 1, newZeroIndex);
            }

            return new vscode.Position(currentLineIndex, lastCharIndex);
        }

        if (textAtCurrentLine.length === 0) {
            continue;
        }

        const currentChar = textAtCurrentLine[currentCharIndex];
        if (currentChar.match(new RegExp(char))) {
            n--;
        }
    }
    
    return new vscode.Position(currentLineIndex, currentCharIndex);
}

module.exports = {
    getNthCharOccurrence
}