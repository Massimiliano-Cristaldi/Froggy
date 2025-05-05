const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
async function shiftMacro(direction, leapDistance){
    const editor = vscode.window.activeTextEditor;

    if (!editor){
        return null;
    }

    const selectionStartLine = editor.selection.start.line;
    const selectionEndLine = editor.selection.end.line;
    const selectionEndLastCharIndex = editor.document.lineAt(selectionEndLine).text.length;
    const selectionHeight = selectionEndLine - selectionStartLine + 1;
    const lastLineIndex = editor.document.lineCount - 1;

    if (selectionStartLine == 0 && direction == 'up' ||
        selectionEndLine == lastLineIndex && direction == 'down'){
        return null;
    }
    
    const startPosition = new vscode.Position(selectionStartLine, 0);
    const endPosition = selectionEndLine + 1 < lastLineIndex ?
                        new vscode.Position(selectionEndLine + 1, 0) :
                        new vscode.Position(lastLineIndex, selectionEndLastCharIndex)
    const selectionRange = new vscode.Range(startPosition, endPosition);
    const selectionText = editor.document.getText(selectionRange);

    await editor.edit((editBuilder)=>{
        let newStartLine;
        let newStartCharIndex;
        let newSelectionText;
        if (direction == 'up') {
            newStartLine = Math.max(selectionStartLine - leapDistance, 0);
            newStartCharIndex = 0;
            newSelectionText = selectionText.substring(0, selectionText.length - 1) + '\n';
        } else {
            newStartLine = Math.min(selectionStartLine + leapDistance + selectionHeight - 1, lastLineIndex);
            newStartCharIndex = editor.document.lineAt(newStartLine).text.length + 1;
            newSelectionText = '\n' + selectionText.substring(0, selectionText.length - 2);
        }

        const shiftedPosition = new vscode.Position(newStartLine, newStartCharIndex);

        editBuilder.insert(shiftedPosition, newSelectionText);
        editBuilder.delete(selectionRange);

        setTimeout(() => {
            let newSelectionLastCharIndex;
            let newSelectionStartPosition;
            let newSelectionEndPosition;
            if (selectionStartLine - leapDistance < 0 && direction == 'up') {
                newSelectionLastCharIndex = editor.document.lineAt(selectionHeight - 1).text.length;
                newSelectionStartPosition = new vscode.Position(0, 0);
                newSelectionEndPosition = new vscode.Position(selectionHeight - 1, newSelectionLastCharIndex);
            } else if (selectionEndLine + leapDistance > lastLineIndex && direction == 'down') {
                newSelectionLastCharIndex = editor.document.lineAt(lastLineIndex).text.length;
                newSelectionStartPosition = new vscode.Position(lastLineIndex - selectionHeight + 1, 0);
                newSelectionEndPosition = new vscode.Position(lastLineIndex, newSelectionLastCharIndex);
            } else if (direction == 'up') {
                newSelectionLastCharIndex = editor.document.lineAt(newStartLine + selectionHeight - 1).text.length + 1;
                newSelectionStartPosition = new vscode.Position(newStartLine, 0);
                newSelectionEndPosition = new vscode.Position(newStartLine + selectionHeight - 1, newSelectionLastCharIndex);
            } else if (direction == 'down') {
                newSelectionLastCharIndex = editor.document.lineAt(newStartLine + selectionHeight - 1).text.length + 1;
                newSelectionStartPosition = new vscode.Position(newStartLine - selectionHeight + 1, 0);
                newSelectionEndPosition = new vscode.Position(newStartLine, newSelectionLastCharIndex);
            }
            editor.selection = new vscode.Selection(newSelectionStartPosition, newSelectionEndPosition);

            vscode.commands.executeCommand('revealLine', {
                lineNumber: newStartLine,
                at: 'center'
            });

        }, 10);
    })

    const newLastCommand = ()=>{shiftMacro(direction, leapDistance)};
    return newLastCommand;
}

module.exports = {
    shiftMacro
}