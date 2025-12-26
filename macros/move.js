const vscode = require("vscode");
const getNthCharOccurrence = require("./_common").getNthCharOccurrence;

function jumpTo(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const distance = args["distance"];
    const direction = args["direction"];

    const startLine = editor.selection.start.line;
    const endLine = editor.selection.end.line;

    const currentLine = editor.selection.isReversed ? startLine : endLine;
    const lineCount = editor.document.lineCount - 1;

    const newLine = direction === "up" ? 
                    Math.max(currentLine - distance, 0) : 
                    Math.min(currentLine + distance, lineCount);
    
    const textLength = editor.document.lineAt(currentLine).text.length;
    const newPos = new vscode.Position(newLine, textLength);

    editor.selection = new vscode.Selection(newPos, newPos);
    
    vscode.commands.executeCommand("revealLine", {
        lineNumber: newLine,
        at: "center"
    });
}

function caseSmartJumpTo(args) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const direction = args["direction"];

    const currentLineIndex = editor.selection.start.line;
    const destPosition = getNthCharOccurrence("[A-Z_\\s\"',\\.\\(\\)\\[\\]\\{\\}]", 1, direction, false, true);

    editor.selection = new vscode.Selection(destPosition, destPosition);
}

function skipTo(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const skipCount = args["skipCount"];
    const direction = args["direction"];

    const currentLineIndex = editor.selection.start.line;
    const destPosition = getNthCharOccurrence(" ", skipCount, direction, false);

    editor.selection = new vscode.Selection(destPosition, destPosition);
}

module.exports = {
    jumpTo,
    caseSmartJumpTo,
    skipTo
}