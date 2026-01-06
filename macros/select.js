const vscode = require("vscode");
const getNthCharOccurrence = require("./_common").getNthCharOccurrence;

function selectTo(args) {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        return;
    }

    const distance = args["distance"];
    const direction = args["direction"];

    const selectionStartLine = editor.selection.start.line;
    const selectionEndLine = editor.selection.end.line;

    const selectionHeight = selectionEndLine - selectionStartLine + 1;
    const selectionLength = editor.document.getText(editor.selection).length;
    var textLength = 0;

    for (let i = 0; i < selectionHeight; i++) {
        textLength += editor.document.lineAt(editor.selection.end.line - i).text.length;
    }

    const isPartialLineSelection = selectionLength < textLength && distance === 1;

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
            targetLine = Math.max(selectionStartLine - distance, 0);
            targetPosition = new vscode.Position(targetLine, targetColumn)
        } else {
            if (selectionHeight > distance) {
                startColumn = 0;
                startPosition = new vscode.Position(selectionStartLine, startColumn);
                
                targetLine = Math.max(selectionEndLine - distance, 0);
                targetColumn = editor.document.lineAt(targetLine).text.length;
                targetPosition = new vscode.Position(targetLine, targetColumn)
            } else {
                const newStartLine = Math.max(selectionStartLine - 1, 0);
                startColumn = editor.document.lineAt(newStartLine).text.length;
                startPosition = new vscode.Position(newStartLine, startColumn);
                
                targetLine = Math.max(selectionEndLine - distance, 0);
                targetColumn = 0;
                targetPosition = new vscode.Position(targetLine, targetColumn)
            }
        }
    } else if (direction === "down") {
        if (editor.selection.isReversed && !editor.selection.isEmpty) {
            if (selectionHeight > distance) {
                startColumn = editor.document.lineAt(selectionEndLine).text.length;
                startPosition = new vscode.Position(selectionEndLine, startColumn);
                
                targetColumn = 0;
                targetLine = Math.min(selectionStartLine + distance, lastLine);
                targetPosition = new vscode.Position(targetLine, targetColumn)
            } else {
                startColumn = 0;
                startPosition = new vscode.Position(selectionEndLine + 1, startColumn);
                
                targetLine = Math.min(selectionStartLine + distance, lastLine);
                targetColumn = editor.document.lineAt(targetLine).text.length;
                targetPosition = new vscode.Position(targetLine, targetColumn)                
            }
        } else {
            startColumn = 0;
            startPosition = new vscode.Position(selectionStartLine, startColumn);

            targetLine = Math.min(selectionEndLine + distance, lastLine);
            targetColumn = editor.document.lineAt(targetLine).text.length;
            targetPosition = new vscode.Position(targetLine, targetColumn)
        }
    }

    editor.selection = new vscode.Selection(startPosition, targetPosition);

    vscode.commands.executeCommand("revealLine", {
        lineNumber: targetLine,
        at: "center"
    });
}

function caseSmartSelectTo(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const direction = args["direction"];
    const charMatch = "[A-Z_-\\s\"';,\\.\\(\\)\\[\\]\\{\\}]";

    let startLine = editor.selection.start.line;
    let startChar = editor.selection.start.character;

    let endLine = editor.selection.end.line;
    let endChar = editor.selection.end.character;

    if (editor.selection.isReversed) {
        const startPosition = new vscode.Position(endLine, endChar);
        const destPosition = getNthCharOccurrence(charMatch, 1, direction, false);

        editor.selection = new vscode.Selection(startPosition, destPosition);
    } else {
        const startPosition = new vscode.Position(startLine, startChar)
        const destPosition = getNthCharOccurrence(charMatch, 1, direction, true);

        editor.selection = new vscode.Selection(startPosition, destPosition);
    }
}

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
    caseSmartSelectTo,
    expandSelectionToLineStart,
    expandSelectionToLineEnd
}