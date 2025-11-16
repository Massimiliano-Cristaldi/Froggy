const vscode = require("vscode");

function selectTo(args) {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        return;
    }

    const leapDistance = args["leapDistance"];
    const direction = args["direction"];

    const selectionStartLine = editor.selection.start.line;
    const selectionEndLine = editor.selection.end.line;

    const selectionHeight = selectionEndLine - selectionStartLine + 1;
    const selectionLength = editor.document.getText(editor.selection).length;
    var textLength = 0;

    for (let i = 0; i < selectionHeight; i++) {
        textLength += editor.document.lineAt(editor.selection.end.line - i).text.length;
    }

    const isPartialLineSelection = selectionLength < textLength && leapDistance === 1;

    if (isPartialLineSelection) {
        let startPosition;
        let targetPosition;
        
        if (direction === "up") {
            const startColumn = editor.document.lineAt(selectionEndLine).text.length;
            startPosition = new vscode.Position(selectionEndLine, startColumn);
            targetPosition = new vscode.Position(selectionStartLine, 0);
        } else if (direction === "down") {
            startPosition = new vscode.Position(selectionStartLine, 0);
            const targetColumn = editor.document.lineAt(selectionEndLine).text.length;
            targetPosition = new vscode.Position(selectionEndLine, targetColumn);
        }

        editor.selection = new vscode.Selection(startPosition, targetPosition);

        vscode.commands.executeCommand("revealLine", {
            lineNumber: direction === "up" ? editor.selection.start.line : editor.selection.end.line,
            at: "center"
        });

        return;
    }

    const lastLine = editor.document.lineCount - 1;
    
    let startColumn;
    let startPosition;
    let targetColumn;
    let targetLine;
    let targetPosition;

    if (direction === "up") {
        if (editor.selection.isReversed) {
            startColumn = editor.document.lineAt(selectionEndLine).text.length;
            startPosition = new vscode.Position(selectionEndLine, startColumn);

            targetColumn = 0;
            targetLine = Math.max(selectionStartLine - leapDistance, 0);
            targetPosition = new vscode.Position(targetLine, targetColumn)
        } else {
            if (selectionHeight > leapDistance) {
                startColumn = 0;
                startPosition = new vscode.Position(selectionStartLine, startColumn);
                
                targetLine = Math.max(selectionEndLine - leapDistance, 0);
                targetColumn = editor.document.lineAt(targetLine).text.length;
                targetPosition = new vscode.Position(targetLine, targetColumn)
            } else {
                const newStartLine = Math.max(selectionStartLine - 1, 0);
                startColumn = editor.document.lineAt(newStartLine).text.length;
                startPosition = new vscode.Position(newStartLine, startColumn);
                
                targetLine = Math.max(selectionEndLine - leapDistance, 0);
                targetColumn = 0;
                targetPosition = new vscode.Position(targetLine, targetColumn)
            }
        }
    } else if (direction === "down") {
        if (editor.selection.isReversed) {
            if (selectionHeight > leapDistance) {
                startColumn = editor.document.lineAt(selectionEndLine).text.length;
                startPosition = new vscode.Position(selectionEndLine, startColumn);
                
                targetColumn = 0;
                targetLine = Math.min(selectionStartLine + leapDistance, lastLine);
                targetPosition = new vscode.Position(targetLine, targetColumn)
            } else {
                startColumn = 0;
                startPosition = new vscode.Position(selectionEndLine + 1, startColumn);
                
                targetLine = Math.min(selectionStartLine + leapDistance, lastLine);
                targetColumn = editor.document.lineAt(targetLine).text.length;
                targetPosition = new vscode.Position(targetLine, targetColumn)                
            }
        } else {
            startColumn = 0;
            startPosition = new vscode.Position(selectionStartLine, startColumn);

            targetLine = Math.min(selectionEndLine + leapDistance, lastLine);
            targetColumn = editor.document.lineAt(targetLine).text.length;
            targetPosition = new vscode.Position(targetLine, targetColumn)
        }
    }

    editor.selection = new vscode.Selection(startPosition, targetPosition);

    vscode.commands.executeCommand("revealLine", {
        lineNumber: targetLine,
        at: "center"
    });
};

function expandSelectionToLineStart() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const startLine = editor.selection.start.line;
    const startChar = 0;

    const endLine = editor.selection.end.line;
    const endChar = editor.selection.end.character;
    
    const extendedSelection = new vscode.Selection(
        new vscode.Position(startLine, startChar),
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
    selectTo,
    expandSelectionToLineStart,
    expandSelectionToLineEnd
}