const vscode = require("vscode");
const { fork } = require("child_process");
const path = require("path");

const jumpTo = require("./macros/move").jumpTo;
const skipTo = require("./macros/move").skipTo;
const selectTo = require("./macros/select").selectTo;
const expandSelectionToLineStart = require("./macros/select").expandSelectionToLineStart;
const expandSelectionToLineEnd = require("./macros/select").expandSelectionToLineEnd;
const goToLineStart = require("./macros/goto").goToLineStart;
const goToLineEnd = require("./macros/goto").goToLineEnd;

const lineHighlightService = require("./lineHighlightService");

let keyboardEventListener;

function activate(context) {
	const listenerScript = path.join(context.extensionPath, "keyboardEventListener.js");
	keyboardEventListener = fork(listenerScript, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] });
	keyboardEventListener.on("message", (event) => { lineHighlightService.handleHighlights(event) });
	vscode.window.onDidChangeTextEditorSelection(() => { lineHighlightService.refreshHighlights() });

	const subscriptions = [
		vscode.commands.registerCommand("badlvckinc.Jump", (args) => { jumpTo(args) }),
		vscode.commands.registerCommand("badlvckinc.Skip", (args) => { skipTo(args) }),
		vscode.commands.registerCommand("badlvckinc.Select", (args) => { selectTo(args) }),
		vscode.commands.registerCommand("badlvckinc.ExpandSelectionToLineStart", () => { expandSelectionToLineStart() }),
		vscode.commands.registerCommand("badlvckinc.ExpandSelectionToLineEnd", () => { expandSelectionToLineEnd() }),
		vscode.commands.registerCommand("badlvckinc.GoToLineStart", () => { goToLineStart() }),
		vscode.commands.registerCommand("badlvckinc.GoToLineEnd", () => { goToLineEnd() }),
	]

	context.subscriptions.push(
		...subscriptions,
		{ dispose: () => { keyboardEventListener?.kill(); } }
	);
}

function deactivate() {
	keyboardEventListener?.kill();
}

module.exports = {
	activate,
	deactivate
}
