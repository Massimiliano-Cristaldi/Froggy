const vscode = require('vscode');

function goToLineStart() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const currentLine = editor.selection.start.line;
    const firstChar = editor.document.lineAt(currentLine).firstNonWhitespaceCharacterIndex;
    const cursorAtStart = new vscode.Selection(
        new vscode.Position(currentLine, firstChar),
        new vscode.Position(currentLine, firstChar),
    );
    editor.selection = cursorAtStart; 
}

function goToLineEnd() {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        const currentLine = editor.selection.end.line;
        const lineLength = editor.document.lineAt(currentLine).text.length;
        const cursorAtEnd = new vscode.Selection(
            new vscode.Position(currentLine, lineLength),
            new vscode.Position(currentLine, lineLength),
        );
        editor.selection = cursorAtEnd; 
    }

module.exports = {
    goToLineStart,
    goToLineEnd,
}