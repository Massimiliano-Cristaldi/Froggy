const vscode = require("vscode");
const path = require("path");
const { spawn } = require("child_process");

const jumpTo = require("./macros/move").jumpTo;
const caseSmartJumpTo = require("./macros/move").caseSmartJumpTo;
const skipTo = require("./macros/move").skipTo;
const goToLineStart = require("./macros/move").goToLineStart;
const goToLineEnd = require("./macros/move").goToLineEnd;

const selectTo = require("./macros/select").selectTo;
const caseSmartSelectTo = require("./macros/select").caseSmartSelectTo;
const expandSelectionToLineStart = require("./macros/select").expandSelectionToLineStart;
const expandSelectionToLineEnd = require("./macros/select").expandSelectionToLineEnd;

const handleHighlights = require("./lineHighlightService").handleHighlights;
const refreshHighlights = require("./lineHighlightService").refreshHighlights;
const recalculateMultiselections = require("./macros/_common").recalculateMultiselections;

let keyboardEventListener;
let selectionCount;

function activate(context) {
	const listenerScript = path.join(context.extensionPath, "keyboardEventListener.js");
	keyboardEventListener = spawn("node", [listenerScript], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
	keyboardEventListener.on("message", (event) => { handleHighlights(event); });
	vscode.window.onDidChangeTextEditorSelection(() => { onSelectionChanged(); });

	const register = vscode.commands.registerCommand;
	
	const subscriptions = [
		register("badlvckinc.Jump", (args) => { jumpTo(args) }),
		register("badlvckinc.CaseSmartJump", (args) => { caseSmartJumpTo(args) }),
		register("badlvckinc.Skip", (args) => { skipTo(args) }),
		register("badlvckinc.Select", (args) => { selectTo(args) }),
		register("badlvckinc.CaseSmartSelect", (args) => { caseSmartSelectTo(args) }),
		register("badlvckinc.ExpandSelectionToLineStart", () => { expandSelectionToLineStart() }),
		register("badlvckinc.ExpandSelectionToLineEnd", () => { expandSelectionToLineEnd() }),
		register("badlvckinc.GoToLineStart", () => { goToLineStart() }),
		register("badlvckinc.GoToLineEnd", () => { goToLineEnd() }),
	]

	context.subscriptions.push(
		...subscriptions,
		{ dispose: () => { keyboardEventListener?.kill(); } }
	);
}

function deactivate() {
	keyboardEventListener?.kill();
}

function onSelectionChanged() {
	refreshHighlights(); 
	const editor = vscode.window.activeTextEditor;

	if (!editor || editor.selections.length === selectionCount || editor.selections.length < 2) {
		selectionCount = editor.selections.length;
		return;
	}

	selectionCount = editor.selections.length;
	recalculateMultiselections();
}

module.exports = {
	activate,
	deactivate
}
