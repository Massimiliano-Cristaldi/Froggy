const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const moveMacro = require('./macros/move').moveMacro;
	const skipWordMacro = require('./macros/move').skipWordMacro;
	const selectMacro = require('./macros/select').selectMacro;
	const goToLineStart = require('./macros/goto').goToLineStart;
	const goToLineEnd = require('./macros/goto').goToLineEnd;
	const expandSelectionToLineStart = require('./macros/select').expandSelectionToLineStart;
	const expandSelectionToLineEnd = require('./macros/select').expandSelectionToLineEnd;

	const subscriptions = [
		vscode.commands.registerCommand(`badlvckinc.Move`, (args) => {moveMacro(args)}),
		vscode.commands.registerCommand('badlvckinc.Skip', (args)=>{skipWordMacro(args)}),
		vscode.commands.registerCommand('badlvckinc.Select', (args)=>{selectMacro(args)}),
		vscode.commands.registerCommand('badlvckinc.GoToLineStart', ()=>{goToLineStart()}),
		vscode.commands.registerCommand('badlvckinc.GoToLineEnd', ()=>{goToLineEnd()}),
		vscode.commands.registerCommand('badlvckinc.ExpandSelectionToLineStart', ()=>{expandSelectionToLineStart()}),
		vscode.commands.registerCommand('badlvckinc.ExpandSelectionToLineEnd', ()=>{expandSelectionToLineEnd()}),
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
