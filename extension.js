const vscode = require("vscode");
const { fork } = require("child_process");
const path = require("path");

const jumpTo = require("./macros/move").jumpTo;
const caseSmartJumpTo = require("./macros/move").caseSmartJumpTo;
const skipTo = require("./macros/move").skipTo;

const selectTo = require("./macros/select").selectTo;
const caseSmartSelectTo = require("./macros/select").caseSmartSelectTo;
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

module.exports = {
	activate,
	deactivate
}
