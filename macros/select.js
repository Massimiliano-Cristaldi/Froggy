const vscode = require('vscode');

function selectMacro(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const leapDistance = args["leapDistance"];
    const direction = args["direction"];

    const lineCount = editor.document.lineCount;
    const selectionStartLine = editor.selection.start.line;
    const selectionEndLine = editor.selection.end.line;
    const leapLineNumber = direction == 'up' ? Math.max(selectionStartLine - leapDistance, 0) : Math.min(selectionEndLine + leapDistance, lineCount - 1);
    const selectionHeight = selectionEndLine - selectionStartLine + 1;
    const selectionLength = editor.document.getText(editor.selection).length;
    var textLength = 0;
    for (let i = 0; i < selectionHeight; i++) {
        textLength += editor.document.lineAt(editor.selection.end.line - i).text.length;
    }

    if (selectionLength < textLength && leapDistance == 1) {
        const startPosition = new vscode.Position(selectionStartLine, 0);
        const endPosition = new vscode.Position(selectionEndLine, textLength);
        editor.selection = new vscode.Selection(startPosition, endPosition);
    } else {
        const startPosition = new vscode.Position(direction == 'up' ? leapLineNumber : selectionStartLine, 0);
        const endPosition = new vscode.Position(direction == 'up' ? selectionEndLine : leapLineNumber, textLength);
        editor.selection = new vscode.Selection(startPosition, endPosition);
    }

    vscode.commands.executeCommand('revealLine', {
        lineNumber: leapLineNumber,
        at: 'center'
    });
};

function expandSelectionToLineStart() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const startLine = editor.selection.start.line;
    const endLine = editor.selection.end.line;
    const endChar = editor.selection.end.character;
    const extendedSelection = new vscode.Selection(
        new vscode.Position(startLine, 0),
        new vscode.Position(endLine, endChar)
    );
    editor.selection = extendedSelection;
}

function expandSelectionToLineEnd() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const startLine = editor.selection.start.line;
    const startChar = editor.selection.start.character;
    const endLine = editor.selection.end.line;
    const endLineLength = editor.document.lineAt(endLine).text.length;
    const extendedSelection = new vscode.Selection(
        new vscode.Position(startLine, startChar),
        new vscode.Position(endLine, endLineLength)
    );
    editor.selection = extendedSelection;
}

module.exports = {
    selectMacro,
    expandSelectionToLineStart,
    expandSelectionToLineEnd
}