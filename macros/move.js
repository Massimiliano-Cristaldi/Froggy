const vscode = require('vscode');

function moveMacro(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const leapDistance = args["leapDistance"];
    const direction = args["direction"];

    const startLine = editor.selection.start.line;
    const endLine = editor.selection.end.line;
    const lineCount = editor.document.lineCount - 1;
    const newLine = direction == 'up' ? Math.max(startLine - leapDistance, 0) : Math.min(endLine + leapDistance, lineCount);
    const textLength = editor.document.lineAt(startLine).text.length;
    const newPos = new vscode.Position(newLine, textLength);
    editor.selection = new vscode.Selection(newPos, newPos); 
    
    vscode.commands.executeCommand('revealLine', {
        lineNumber: newLine,
        at: 'center'
    });
};

function getNthWhitespaceOffset(currentLineIndex, n, direction) {
    const editor = vscode.window.activeTextEditor;

    const startingCharIndex = editor.selection.start.character;
    const textAtCurrentLine = editor.document.lineAt(currentLineIndex).text;

    const zeroIndex = editor.document.lineAt(currentLineIndex).firstNonWhitespaceCharacterIndex;
    const lastCharIndex = textAtCurrentLine.length;
    let currentCharIndex = startingCharIndex;

    while (true) {
        currentCharIndex += direction == "right" ? 1 : -1;
        
        if (currentCharIndex < zeroIndex) {
            return zeroIndex;
        } else if (currentCharIndex > lastCharIndex) {
            return lastCharIndex;
        }

        const currentChar = textAtCurrentLine[currentCharIndex];

        if (currentChar == " ") {
            n--;
        }

        if (n == 0) {
            return currentCharIndex;
        }
    }
}

function skipWordMacro(args) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const skipCount = args["skipCount"];
    const direction = args["direction"];

    const currentLineIndex = editor.selection.start.line;

    const destCharIndex = getNthWhitespaceOffset(currentLineIndex, skipCount, direction);
    const destPosition = new vscode.Position(currentLineIndex, destCharIndex);

    editor.selection = new vscode.Selection(destPosition, destPosition);
}

module.exports = {
    moveMacro,
    skipWordMacro
}