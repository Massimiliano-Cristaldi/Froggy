const vscode = require("vscode");
const selectToNextCharOccurrence = require("./_common").selectToNextCharOccurrence;
const selectToLineEdge = require("./_common").selectToLineEdge;
const focusLastSelection = require("./_common").focusLastSelection;

function selectTo(args) {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        return;
    }

    const distance = args["distance"];
    const direction = args["direction"];

    let selections = [];
    for (const selection of editor.selections) {
        selections.push(moveSelectionCaret(selection, distance, direction));
    }

    editor.selections = selections;
    focusLastSelection();
}

function moveSelectionCaret(selection, distance, direction) {
    const editor = vscode.window.activeTextEditor;
    
    const selectionStartLine = selection.start.line;
    const selectionEndLine = selection.end.line;

    const selectionHeight = selectionEndLine - selectionStartLine + 1;
    const selectionLength = editor.document.getText(selection).length;
    var textLength = 0;

    for (let i = 0; i < selectionHeight; i++) {
        textLength += editor.document.lineAt(selection.end.line - i).text.length;
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

        return new vscode.Selection(startPosition, targetPosition);
    }

    const lastLine = editor.document.lineCount - 1;
    
    let startColumn;
    let startPosition;
    let targetColumn;
    let targetLine;
    let targetPosition;

    if (direction === "up") {
        if (selection.isReversed) {
            startColumn = editor.document.lineAt(selectionEndLine).text.length;
            startPosition = new vscode.Position(selectionEndLine, startColumn);

            targetColumn = 0;
            targetLine = Math.max(selectionStartLine - distance, 0);
            targetPosition = new vscode.Position(targetLine, targetColumn);
        } else {
            if (selectionHeight > distance) {
                startColumn = 0;
                startPosition = new vscode.Position(selectionStartLine, startColumn);
                
                targetLine = Math.max(selectionEndLine - distance, 0);
                targetColumn = editor.document.lineAt(targetLine).text.length;
                targetPosition = new vscode.Position(targetLine, targetColumn);
            } else {
                const newStartLine = Math.max(selectionStartLine - 1, 0);
                startColumn = editor.document.lineAt(newStartLine).text.length;
                startPosition = new vscode.Position(newStartLine, startColumn);
                
                targetLine = Math.max(selectionEndLine - distance, 0);
                targetColumn = 0;
                targetPosition = new vscode.Position(targetLine, targetColumn);
            }
        }
    } else if (direction === "down") {
        if (selection.isReversed && !selection.isEmpty) {
            if (selectionHeight > distance) {
                startColumn = editor.document.lineAt(selectionEndLine).text.length;
                startPosition = new vscode.Position(selectionEndLine, startColumn);
                
                targetColumn = 0;
                targetLine = Math.min(selectionStartLine + distance, lastLine);
                targetPosition = new vscode.Position(targetLine, targetColumn);
            } else {
                startColumn = 0;
                startPosition = new vscode.Position(selectionEndLine + 1, startColumn);
                
                targetLine = Math.min(selectionStartLine + distance, lastLine);
                targetColumn = editor.document.lineAt(targetLine).text.length;
                targetPosition = new vscode.Position(targetLine, targetColumn);               
            }
        } else {
            startColumn = 0;
            startPosition = new vscode.Position(selectionStartLine, startColumn);

            targetLine = Math.min(selectionEndLine + distance, lastLine);
            targetColumn = editor.document.lineAt(targetLine).text.length;
            targetPosition = new vscode.Position(targetLine, targetColumn);
        }
    }

    return new vscode.Selection(startPosition, targetPosition);
}

function caseSmartSelectTo(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const direction = args["direction"];

    editor.selections = selectToNextCharOccurrence("caseSmart", direction);
    focusLastSelection();
}

function expandSelectionToLineStart() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    let selections = [];

    for (const selection of editor.selections) {
        selections.push(selectToLineEdge(selection, "start"));
    }

    editor.selections = selections;
    focusLastSelection();
}

function expandSelectionToLineEnd() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    let selections = [];

    for (const selection of editor.selections) {
        selections.push(selectToLineEdge(selection, "end"));
    }

    editor.selections = selections;
    focusLastSelection();
}

module.exports = {
    selectTo,
    caseSmartSelectTo,
    expandSelectionToLineStart,
    expandSelectionToLineEnd
}