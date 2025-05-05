const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function findMacro(direction, input, findAndSelect, lastStringParam){
    const editor = vscode.window.activeTextEditor;

    let characters;
    let newLastCommand;
    let newLastStringParam;
    switch (input) {
        case '':
            const selectedText = editor.document.getText(editor.selection);
            if (!selectedText) {
                vscode.window.showWarningMessage('You cannot run this command without arguments if you have no text selected.');
                return null;
            }

            characters = selectedText.toLowerCase();
            newLastStringParam = selectedText.toLowerCase();
            newLastCommand = ()=>{findMacro(direction, selectedText.toLowerCase(), findAndSelect, newLastStringParam)};
            break;
        case '#':
            if (lastStringParam) {
                characters = lastStringParam;
                newLastStringParam = lastStringParam;
                newLastCommand = ()=>{findMacro(direction, newLastStringParam, findAndSelect, newLastStringParam)};
            } else {
                vscode.window.showWarningMessage('No saved string argument was found.');
                return null;
            }
            break;
        case '\\#':
            characters = '#';
            newLastStringParam = '#';
            newLastCommand = ()=>{findMacro(direction, '\\#', findAndSelect, newLastStringParam)};
            break;
        default:
            characters = input.toLowerCase();
            newLastStringParam = input.toLowerCase();
            newLastCommand = ()=>{findMacro(direction, input.toLowerCase(), findAndSelect, newLastStringParam)};
            break;
    }

    const lastLineIndex = editor.document.lineCount - 1;
    let startingLineIndex;
    switch (direction) {
        case 'next':
            startingLineIndex = editor.selection.end.line;
            break;
        case 'prev':
            startingLineIndex = editor.selection.start.line;
            break;
        case 'first':
            startingLineIndex = 0;
            break;
        case 'last':
            startingLineIndex = lastLineIndex;
            break;
    }

    const isIteratingForward = ()=>{return direction == 'next' || direction == 'first'};
    const offset = isIteratingForward() ? characters.length : 0;
    let isFirstLoop = true;

    let currentLineIndex = startingLineIndex;
    let currentCharIndex = editor.selection.start.character + offset;

    let targetLineIndex;
    let targetCharIndex;

    while (!targetLineIndex) {
        const textAtCurrentLine = editor.document.lineAt(currentLineIndex).text.toLowerCase();

        const matchesAfter = textAtCurrentLine.includes(characters, currentCharIndex);
        const matchesBefore = textAtCurrentLine.substring(0, currentCharIndex).includes(characters);
        const matchesInputValue =  isIteratingForward() ? matchesAfter : matchesBefore;                         

        if (matchesInputValue) {
            const nextMatchIndex = textAtCurrentLine.indexOf(characters, currentCharIndex);
            const prevMatchIndex = textAtCurrentLine.substring(0, currentCharIndex).lastIndexOf(characters);
            targetLineIndex = currentLineIndex;
            targetCharIndex = isIteratingForward() ? nextMatchIndex : prevMatchIndex;
                                
        } else {
            currentLineIndex += isIteratingForward() ? 1 : -1;
            currentCharIndex = isIteratingForward() ? 0 : 2147483647;
        }

        const isLastCheck = (isIteratingForward() && currentLineIndex == lastLineIndex) || (!isIteratingForward() && currentLineIndex == 0);
        
        if (isLastCheck && !targetLineIndex) {
            const shouldLoop = vscode.workspace.getConfiguration('froggy').get('findMacroLoops', true) && isFirstLoop;
            
            if (shouldLoop && direction == 'next'){
                currentLineIndex = 0;
                currentCharIndex = 0;
                isFirstLoop = false;
            } else if (shouldLoop && direction == 'prev'){
                currentLineIndex = lastLineIndex;
                currentCharIndex = 2147483647;
                isFirstLoop = false;
            } else {
                vscode.window.showWarningMessage(`No match for '${characters}' with the given parameters.`);
                return null;
            }
        } else if (isLastCheck && !isFirstLoop) {
            break;
        }
    }

    const newCursor = new vscode.Selection(
        new vscode.Position(targetLineIndex, targetCharIndex),
        new vscode.Position(targetLineIndex, targetCharIndex + (findAndSelect ? characters.length : 0))
    )
    editor.selection = newCursor;

    vscode.commands.executeCommand('revealLine', {
        lineNumber: targetLineIndex,
        at: 'center'
    });

    return [newLastCommand, newLastStringParam];
}

module.exports = {
    findMacro
}