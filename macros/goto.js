const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function goToMacro(lineNumber, isFixedReference = true){
    const editor = vscode.window.activeTextEditor;

    const destinationIndex = editor.document.lineCount >= lineNumber ? lineNumber : editor.document.lineCount;
    editor.selection = new vscode.Selection(
        new vscode.Position(destinationIndex, 0),
        new vscode.Position(destinationIndex, 0)
    );

    vscode.commands.executeCommand('revealLine', {
        lineNumber: destinationIndex,
        at: 'center'
    });

    const fixedLastCommand = ()=>{goToMacro(lineNumber)};
    const dynamicLastCommand = ()=>{
        const editor = vscode.window.activeTextEditor;
        const lastLineIndex = editor.document.lineCount - 1;
        goToMacro(lastLineIndex, false);
    }
    const newLastCommand = isFixedReference ? fixedLastCommand : dynamicLastCommand;
    return newLastCommand;
};

function goToLineStart(){
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return null;
    }

    const currentLine = editor.selection.start.line;
    const firstChar = editor.document.lineAt(currentLine).firstNonWhitespaceCharacterIndex;
    const cursorAtStart = new vscode.Selection(
        new vscode.Position(currentLine, firstChar),
        new vscode.Position(currentLine, firstChar),
    );
    editor.selection = cursorAtStart; 
}

function goToLineEnd(){
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return null;
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
    goToMacro,
    goToLineStart,
    goToLineEnd,
}