const vscode = require("vscode");
const moveToLineEdge = require("./_common").moveToLineEdge;
const moveToNextCharOccurrence = require("./_common").moveToNextCharOccurrence;
const focusLastSelection = require("./_common").focusLastSelection;

function jumpTo(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const distance = args["distance"];
    const direction = args["direction"];

    let selections = [];

    for (const selection of editor.selections) {
        selections.push(moveCaret(selection, direction, distance));
    }

    editor.selections = selections;
    focusLastSelection();
}

function moveCaret(selection, direction, distance) {
    const editor = vscode.window.activeTextEditor;
    
    const startLine = selection.start.line;
    const endLine = selection.end.line;
    const lastLineIndex = editor.document.lineCount - 1;
    
    const currLine = selection.isReversed ? startLine : endLine;
    const newLine =
        direction === "up" ? 
        Math.max(currLine - distance, 0) : 
        Math.min(currLine + distance, lastLineIndex);
    
    const lastCharAtCurrLine = editor.document.lineAt(currLine).text.length;
    const newPosition = new vscode.Position(newLine, lastCharAtCurrLine);
    
    return new vscode.Selection(newPosition, newPosition);
}

function caseSmartJumpTo(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const direction = args["direction"];

    editor.selections = moveToNextCharOccurrence("caseSmart", direction);
    focusLastSelection();
}

function skipTo(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const skipCount = args["skipCount"];
    const direction = args["direction"];

    for (let i = 0; i < skipCount; i++) {
        editor.selections = moveToNextCharOccurrence("whitespace", direction);
    }
}

function goToLineStart() {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        return;
    }

    let selections = [];

    for (const selection of editor.selections) {
        selections.push(moveToLineEdge(selection, "start"));
    }
    
    editor.selections = selections; 
}

function goToLineEnd() {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        return;
    }

    let selections = [];

    for (const selection of editor.selections) {
        selections.push(moveToLineEdge(selection, "end"));
    }
    
    editor.selections = selections; 
}

module.exports = {
    goToLineStart,
    goToLineEnd,
    jumpTo,
    caseSmartJumpTo,
    skipTo
}