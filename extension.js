const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let lastCommand = ()=>{
		vscode.window.showErrorMessage('Froggy: No last command given');
	};
	let lastStringParam;

	const moveMacro = require('./macros/move').moveMacro;
	const goToMacro = require('./macros/goto').goToMacro;
	const goToLineStart = require('./macros/goto').goToLineStart;
	const goToLineEnd = require('./macros/goto').goToLineEnd;
	const selectMacro = require('./macros/select').selectMacro;
	const expandSelectionToLineStart = require('./macros/select').expandSelectionToLineStart;
	const expandSelectionToLineEnd = require('./macros/select').expandSelectionToLineEnd;
	const shiftMacro = require('./macros/shift').shiftMacro;
	const findMacro = require('./macros/find').findMacro;
	const goToDefMacro = require('./macros/gotodef').goToDefMacro;
	const findErrorMacro = require('./macros/finderror').findErrorMacro;
	const stringMacro = require('./macros/string').stringMacro;
	const bracketMacro = require('./macros/bracket').bracketMacro;

	function startPrompt(){
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		quotes = [
			"The path of the righteous man is beset on all sides...",
			"...by the inequities of the selfish and the tyranny of evil men...",
			"...Blessed is he who, in the name of charity and good will...",
			"...shepherds the weak through the valley of Darkness...",
			"...for he is truly his brother's keeper and the finder of lost children...",
			"...And I will strike down upon thee with great vengeance and furious Anger...",
			"...those who attempt to poison and destroy my brothers....",
			"...And you will know My name is the Lord when I lay my vengeance upon thee."
		];
		randomIndex = Math.round(Math.random() * (quotes.length - 1));
		randomQuote = quotes[randomIndex];

		vscode.window.showInputBox({
			prompt: 'Insert command',
			placeHolder: randomQuote,
		}).then((value)=>{
			handlePromptValue(value);
		})
	}

	async function handlePromptValue(value){
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		switch(true){
			case value == 'start':
				lastCommand = goToMacro(0) || lastCommand;
				break;
			case value == 'end':
				const lastLineIndex = editor.document.lineCount - 1;
				lastCommand = goToMacro(lastLineIndex, false) || lastCommand;
				break;
			case /^goto.*$/.test(value):
				const destinationIndex = Number(value.match(/\d+$/)[0]) - 1;
				lastCommand = goToMacro(destinationIndex) || lastCommand;
				break;
			case /^up.*$/.test(value):
				const upCount = Number(value.match(/\d+$/)[0]);
				lastCommand = moveMacro('up', upCount) || lastCommand;
				break;
			case /^down.*$/.test(value):
				const downCount = Number(value.match(/\d+$/)[0]);
				lastCommand = moveMacro('down', downCount) || lastCommand;
				break;
			case /^shup.*$/.test(value):
				const shiftUpCount = Number(value.match(/\d+$/)[0]);
				lastCommand = await shiftMacro('up', shiftUpCount) || lastCommand;
				break;
			case /^shdown.*$/.test(value):
				const shiftDownCount = Number(value.match(/\d+$/)[0]);
				lastCommand = await shiftMacro('down', shiftDownCount) || lastCommand;
				break;
			case /^s?next.*$/.test(value):
				const nextChars = value.replace(/^s?next/, '');
				const selectNextMatch = /^s/.test(value);

				const [nextMacroCommand, nextMacroParam] = findMacro('next', nextChars, selectNextMatch, lastStringParam);
				lastCommand = nextMacroCommand || lastCommand;
				lastStringParam = nextMacroParam || lastStringParam;
				break;
			case /^s?prev.*$/.test(value):
				const prevChars = value.replace(/^s?prev/, '');
				const selectPrevMatch = /^s/.test(value);

				const [prevMacroCommand, prevMacroParam] = findMacro('prev', prevChars, selectPrevMatch, lastStringParam);
				lastCommand = prevMacroCommand || lastCommand;
				lastStringParam = prevMacroParam || lastStringParam;
				break;
			case /^s?first.*$/.test(value):
				const firstChars = value.replace(/^s?first/, '');
				const selectFirstMatch = /^s/.test(value);

				const [firstMacroCommand, firstMacroParam] = findMacro('first', firstChars, selectFirstMatch, lastStringParam);
				lastCommand = firstMacroCommand || lastCommand;
				lastStringParam = firstMacroParam || lastStringParam;
				break;
			case /^s?last.*$/.test(value):
				const lastChars = value.replace(/^s?last/, '');
				const selectLastMatch = /^s/.test(value);

				const [lastMacroCommand, lastMacroParam] = findMacro('last', lastChars, selectLastMatch, lastStringParam);
				lastCommand = lastMacroCommand || lastCommand;
				lastStringParam = lastMacroParam || lastStringParam;
				break;
			case /^s?def.*$/.test(value):
				const defChars = value.replace(/^s?def/, '');
				const selectDef = /^s/.test(value);

				const [defMacroCommand, defMacroParam] = await goToDefMacro(defChars, selectDef, lastStringParam);
				lastCommand = defMacroCommand || lastCommand;
				lastStringParam = defMacroParam || lastStringParam;
				break;
			case value == 'err':
				lastCommand = findErrorMacro() || lastCommand;
				break;
			case value == 'str':
				lastCommand = stringMacro() || lastCommand;
				break;
			case value == 'bra':
				lastCommand = bracketMacro() || lastCommand;
				break;
			case value != undefined:
				vscode.window.showErrorMessage(`Froggy command '${value}' is unknown, is missing arguments or has wrong argument type.`);
				break;
			default:
				break;
		}
	}

	const subscriptions = [
		vscode.commands.registerCommand(`badlvckinc.UpFive`, ()=>{moveMacro('up', 5)}),
		vscode.commands.registerCommand(`badlvckinc.DownFive`,()=>{moveMacro('down', 5)}),
		vscode.commands.registerCommand(`badlvckinc.UpTen`, ()=>{moveMacro('up', 10)}),
		vscode.commands.registerCommand(`badlvckinc.DownTen`, ()=>{moveMacro('down', 10)}),
		vscode.commands.registerCommand('badlvckinc.GoToLineStart', ()=>{goToLineStart()}),
		vscode.commands.registerCommand('badlvckinc.GoToLineEnd', ()=>{goToLineEnd()}),
		vscode.commands.registerCommand('badlvckinc.SelectUpOne', ()=>{selectMacro('up', 1)}),
		vscode.commands.registerCommand('badlvckinc.SelectDownOne', ()=>{selectMacro('down', 1)}),
		vscode.commands.registerCommand('badlvckinc.SelectUpFive', ()=>{selectMacro('up', 5)}),
		vscode.commands.registerCommand('badlvckinc.SelectDownFive', ()=>{selectMacro('down', 5)}),
		vscode.commands.registerCommand('badlvckinc.SelectUpTen', ()=>{selectMacro('up', 10)}),
		vscode.commands.registerCommand('badlvckinc.SelectDownTen', ()=>{selectMacro('down', 10)}),
		vscode.commands.registerCommand('badlvckinc.ExpandSelectionToLineStart', ()=>{expandSelectionToLineStart()}),
		vscode.commands.registerCommand('badlvckinc.ExpandSelectionToLineEnd', ()=>{expandSelectionToLineEnd}),
		vscode.commands.registerCommand('badlvckinc.FroggyPrompt', ()=>{startPrompt()}),
		vscode.commands.registerCommand('badlvckinc.RepeatLastCommand', ()=>{lastCommand()})
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
