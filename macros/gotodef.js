const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
async function goToDefMacro(input, findAndSelect, lastStringParam){
    const editor = vscode.window.activeTextEditor;
    let symbolName;
    let newLastCommand;
    let newLastStringParam;

    switch (input) {
        case '':
            const selectedText = editor.document.getText(editor.selection);
            if (!selectedText) {
                vscode.window.showWarningMessage('You cannot run this command without arguments if you have no text selected.');
                return null;
            }

            symbolName = selectedText.toLowerCase();
            newLastStringParam = selectedText.toLowerCase();
            newLastCommand = ()=>{goToDefMacro(selectedText.toLowerCase(), findAndSelect)};
            break;
        case '#':
            if (lastStringParam) {
                symbolName = lastStringParam;
                newLastStringParam = lastStringParam;
                newLastCommand = ()=>{goToDefMacro(newLastStringParam, findAndSelect, newLastStringParam)};
            } else {
                vscode.window.showWarningMessage('No saved string argument was found.');
            }
            break;
        case '\\#':
            symbolName = '#';
            newLastStringParam = '\\#';
            newLastCommand = ()=>{goToDefMacro('\\#', findAndSelect, newLastStringParam)};
            break;
        default:
            symbolName = input.toLowerCase();
            newLastStringParam = input.toLowerCase();
            newLastCommand = ()=>{goToDefMacro(input.toLowerCase(), findAndSelect, newLastStringParam)};
            break;
    }

    const symbols = await vscode.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', symbolName);
    
    if (symbols.length) {
        const location = symbols[symbols.length - 1].location;
        const document = await vscode.workspace.openTextDocument(location.uri);
        const editor = await vscode.window.showTextDocument(document);

        const selectionEndLine = location.range.start.line;
        const selectionEndChar = findAndSelect ? (location.range.start.character + symbolName.length) : location.range.start.character;
        const endPosition = new vscode.Position(selectionEndLine, selectionEndChar);
        editor.selection = new vscode.Selection(
            location.range.start,
            endPosition
        );

        vscode.commands.executeCommand('revealLine', {
            lineNumber: location.range.start.line,
            at: 'center'
        });
    } else {
        vscode.window.showWarningMessage(`Could not find symbol '${symbolName}'.`);
    }

    return [newLastCommand, newLastStringParam];
}

module.exports = {
    goToDefMacro
}