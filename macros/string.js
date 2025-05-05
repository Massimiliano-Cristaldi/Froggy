const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function getQuoteType(text, startPosition){
    const lastSingleQuoteIndexBefore = text.substring(0, startPosition.character).lastIndexOf(`'`); 
    const lastDoubleQuoteIndexBefore = text.substring(0, startPosition.character).lastIndexOf(`"`);
    const lastBacktickIndexBefore = text.substring(0, startPosition.character).lastIndexOf('`');

    const firstSingleQuoteIndexAfter = text.substring(startPosition.character, text.length).lastIndexOf(`'`);
    const firstDoubleQuoteIndexAfter = text.substring(startPosition.character, text.length).lastIndexOf(`"`);
    const firstBacktickIndexAfter = text.substring(startPosition.character, text.length).lastIndexOf('`');

    const notSingleQuoteString = lastSingleQuoteIndexBefore == -1 || firstSingleQuoteIndexAfter == -1;
    const notDoubleQuoteString = lastDoubleQuoteIndexBefore == -1 || firstDoubleQuoteIndexAfter == -1;
    const notBacktickString = lastBacktickIndexBefore == -1 || firstBacktickIndexAfter == -1;

    const isSingleQuoteString = notDoubleQuoteString && notBacktickString;
    const isDoubleQuoteString = notSingleQuoteString && notBacktickString;
    const isBacktickString = notSingleQuoteString && notDoubleQuoteString;

    if (isSingleQuoteString){
        return `'`;
    } else if (isDoubleQuoteString){
        return `"`;
    } else if (isBacktickString){
        return '`';
    }

    const singleQuoteIsClosestBefore = lastSingleQuoteIndexBefore > lastDoubleQuoteIndexBefore && lastSingleQuoteIndexBefore > lastBacktickIndexBefore;
    const doubleQuoteIsClosestBefore = lastDoubleQuoteIndexBefore > lastSingleQuoteIndexBefore && lastDoubleQuoteIndexBefore > lastBacktickIndexBefore;
    const backtickIsClosestBefore = lastBacktickIndexBefore > lastSingleQuoteIndexBefore && lastBacktickIndexBefore > lastDoubleQuoteIndexBefore;

    if (singleQuoteIsClosestBefore){
        return `'`;
    } else if (doubleQuoteIsClosestBefore){
        return `"`;
    } else if (backtickIsClosestBefore){
        return '`';
    }
}

function getRangesFromIndices(indices){
    const currentLineIndex = vscode.window.activeTextEditor.selection.start.line;

    let ranges = [];
    for (let i = 0; i < indices.length; i += 2){
        const startPosition = new vscode.Position(currentLineIndex, indices[i] + 1); 
        const endPosition = new vscode.Position(currentLineIndex, indices[i + 1]);
        ranges.push(new vscode.Selection(startPosition, endPosition));
    }
    return ranges;
}

function stringMacro(){
    const editor = vscode.window.activeTextEditor;

    if (!editor){
        return null;
    }

    const startPosition = editor.selection.start;
    const currentLineIndex = startPosition.line;
    const textAtCurrentLine = editor.document.lineAt(currentLineIndex).text.toLowerCase();

    let singleQuoteIndices = [];
    let doubleQuoteIndices = [];
    let backtickIndices = [];
    for (let i = 0; i < textAtCurrentLine.length; i++){
        const currentChar = textAtCurrentLine.charAt(i);
        if (currentChar == `'`){
            singleQuoteIndices.push(i);
        } else if (currentChar == `"`){
            doubleQuoteIndices.push(i);
        } else if (currentChar == '`'){
            backtickIndices.push(i);
        }
    }

    const singleQuoteRanges = getRangesFromIndices(singleQuoteIndices);
    const doubleQuoteRanges = getRangesFromIndices(doubleQuoteIndices);
    const backtickRanges = getRangesFromIndices(backtickIndices);

    const quoteType = getQuoteType(textAtCurrentLine, startPosition);
    
    let rangeArray;
    if (quoteType == `'`){
        rangeArray = singleQuoteRanges;
    } else if (quoteType == `"`){
        rangeArray = doubleQuoteRanges;
    } else if (quoteType == '`'){
        rangeArray = backtickRanges;
    }

    for (let range of rangeArray){
        if (range.contains(startPosition)){
            editor.selection = range;
            const newLastCommand = ()=>{stringMacro()};
            return newLastCommand;
        }
    }

    vscode.window.showWarningMessage('The text cursor needs to be inside a string in order to use this command.');
}

module.exports = {
    stringMacro
}