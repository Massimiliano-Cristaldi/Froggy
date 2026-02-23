const vscode = require('vscode');

let ctrlPressed = false;
let altPressed = false;

let currentRange = 0;

const highlight = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: "rgba(255, 255, 255, 0.03)"
});

function highlightLines(range) {
    resetHighlights();

    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        return;
    }

    const lastSelection = editor.selections[editor.selections.length - 1];
    const currentLineIndex = lastSelection.active.line;
    const lastLineIndex = editor.document.lineCount - 1;
    
    const lineUpIndex = Math.max(currentLineIndex - range, 0);
    const lineDownIndex = Math.min(currentLineIndex + range, lastLineIndex);

    let ranges = [];
    
    if (lineUpIndex !== currentLineIndex) {
        const upRange = new vscode.Range(
            new vscode.Position(lineUpIndex, 0),
            new vscode.Position(lineUpIndex, 0)
        );
        ranges.push(upRange);
    }

    if (lineDownIndex !== currentLineIndex) {
        const downRange = new vscode.Range(
            new vscode.Position(lineDownIndex, 0),
            new vscode.Position(lineDownIndex, 0)
        );
        ranges.push(downRange);
    }

    if (ranges.length > 0) {
        editor.setDecorations(highlight, ranges);
    }
}

function resetHighlights() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    
    editor.setDecorations(highlight, []);
}

function refreshHighlights() {
    if (currentRange === 0) {
        return;
    }
    
    highlightLines(currentRange);
}

function handleHighlights(event) {
    if (event.name === "LEFT ALT") {
        altPressed = event.state === "DOWN";
    } else if (event.name === "LEFT CTRL") {
        ctrlPressed = event.state === "DOWN";
    }

    const newRange = ctrlPressed ? (altPressed ? 10 : 5) : 0;
    
    if (ctrlPressed && currentRange != newRange) {
        currentRange = newRange;
        highlightLines(newRange);
    } else if (currentRange != newRange) {
        resetHighlights();
        currentRange = 0;
    }
}

module.exports = {
    handleHighlights,
    refreshHighlights
}