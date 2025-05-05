const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function getBracketIndex(text, direction){
    let parenthesisMatchCount = 0;
    let squareBracketMatchCount = 0;
    let curlyBracketMatchCount = 0;

    let bracket;
    let matchIndex = 0;
    
    const start = direction == 'forward' ? 0 : text.length - 1;
    const stop = direction == 'forward' ? (i)=>{return i < text.length} : (i)=>{return i >= 0};
    const next = direction == 'forward' ? (i)=>{return i + 1} : (i)=>{return i - 1};

    for (let i = start; stop(i); i = next(i)){
        const char = text.charAt(i);
        switch (char) {
            case '(':
                parenthesisMatchCount += (direction == 'forward' ? -1 : 1);
                break;
                case ')':
                parenthesisMatchCount += (direction == 'forward' ? 1 : -1);
                break;
            case '[':
                squareBracketMatchCount += (direction == 'forward' ? -1 : 1);
                break;
                case ']':
                squareBracketMatchCount += (direction == 'forward' ? 1 : -1);
                break;
            case '{':
                curlyBracketMatchCount += (direction == 'forward' ? -1 : 1);
                break;
            case '}':
                curlyBracketMatchCount += (direction == 'forward' ? 1 : -1);
                break;
        }

        if (parenthesisMatchCount == 1 || squareBracketMatchCount == 1 || curlyBracketMatchCount == 1) {
            return matchIndex;
        }

        matchIndex++;
    }

    return null;
}

function bracketMacro(){
    
    const editor = vscode.window.activeTextEditor;
    
    if (!editor){
        return null;
    }
    
    const startPosition = editor.selection.start;
    const startOffset = editor.document.offsetAt(startPosition);
    
    const text = editor.document.getText();
    const textBefore = text.substring(0, startOffset);
    const textAfter = text.substring(startOffset, text.length);
    
    const openBracketIndex = getBracketIndex(textBefore, 'back');
    const closedBracketIndex = getBracketIndex(textAfter, 'forward');

    if (closedBracketIndex == null || openBracketIndex == null){
        vscode.window.showWarningMessage('This command can only be called from inside brackets or parentheses.')
        return null;
    }

    const openBracketPosition = editor.document.positionAt(textBefore.length - openBracketIndex);
    const closedBracketPosition = editor.document.positionAt(textBefore.length + closedBracketIndex);
    editor.selection = new vscode.Selection(openBracketPosition, closedBracketPosition);

    const newLastCommand = ()=>{bracketMacro()}; 
    return newLastCommand;
}

module.exports = {
    bracketMacro
}