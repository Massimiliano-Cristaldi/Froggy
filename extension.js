const vscode = require("vscode");
const jumpTo = require("./macros/move").jumpTo;
const skipTo = require("./macros/move").skipTo;
const selectTo = require("./macros/select").selectTo;
const expandSelectionToLineStart = require("./macros/select").expandSelectionToLineStart;
const expandSelectionToLineEnd = require("./macros/select").expandSelectionToLineEnd;
const goToLineStart = require("./macros/goto").goToLineStart;
const goToLineEnd = require("./macros/goto").goToLineEnd;

function activate(context) {
	const subscriptions = [
		vscode.commands.registerCommand("badlvckinc.Jump", (args) => {jumpTo(args)}),
		vscode.commands.registerCommand("badlvckinc.Skip", (args) => {skipTo(args)}),
		vscode.commands.registerCommand("badlvckinc.Select", (args) => {selectTo(args)}),
		vscode.commands.registerCommand("badlvckinc.ExpandSelectionToLineStart", () => {expandSelectionToLineStart()}),
		vscode.commands.registerCommand("badlvckinc.ExpandSelectionToLineEnd", () => {expandSelectionToLineEnd()}),
		vscode.commands.registerCommand("badlvckinc.GoToLineStart", () => {goToLineStart()}),
		vscode.commands.registerCommand("badlvckinc.GoToLineEnd", () => {goToLineEnd()}),
	]	

	context.subscriptions.push(
		...subscriptions
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
