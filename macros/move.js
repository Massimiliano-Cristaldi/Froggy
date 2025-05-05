const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function moveMacro(direction, leapDistance){
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }

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

    
    const newLastCommand = ()=>{moveMacro(direction, leapDistance)};
    return newLastCommand;
};

module.exports = {
    moveMacro
}