const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function findErrorMacro(){
    const editor = vscode.window.activeTextEditor;

    if (!editor){
        return null;
    }

    const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);

    if (!diagnostics.length) {
        vscode.window.showWarningMessage('No error found in the current text document.');
        return null;
    }

    const errorPositions = diagnostics.map((error)=>{
        return [error.range.start.line, error.range.start.character];
    }).sort((error1, error2)=>{
        return error1[0] - error2[0];
    });

    const currentLine = editor.selection.start.line;
    const nextError = errorPositions.find((error)=>{
        return error[0] > currentLine;
    });

    const errorLine = nextError ? nextError[0] : errorPositions[0][0];
    const errorChar = nextError ? nextError[1] : errorPositions[0][1];

    const newCursor = new vscode.Selection(
        new vscode.Position(errorLine, errorChar),
        new vscode.Position(errorLine, errorChar)
    );
    editor.selection = newCursor;

    vscode.commands.executeCommand('revealLine', {
        lineNumber: errorLine,
        at: 'center'
    });

    const newLastCommand = ()=>{findErrorMacro()};
    return newLastCommand;
}

module.exports = {
    findErrorMacro
}