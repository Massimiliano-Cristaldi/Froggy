const vscode = require('vscode');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let lastCommand = ()=>{
		vscode.window.showErrorMessage('Froggy: No last command given');
	};

	let lastStringParam;

	function moveMacro(direction, leapDistance, updateHistory = false){
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const startLine = editor.selection.start.line;
		const endLine = editor.selection.end.line;
		const lineCount = editor.document.lineCount - 1;
		const newLine = direction == 'up' ? Math.max(startLine - leapDistance, 0) : Math.min(endLine + leapDistance, lineCount);
		const textLength = editor.document.lineAt(startLine).text.length;
		const newPos = new vscode.Position(newLine, textLength);
		editor.selection = new vscode.Selection(newPos, newPos); 
		
		vscode.commands.executeCommand('revealLine', {
			lineNumber: newLine,
			at: 'center'
		});

		if (updateHistory) {
			lastCommand = ()=>{moveMacro(direction, leapDistance, updateHistory)};
		}
	};

	function selectMacro(direction, leapDistance, updateHistory = false){
		const editor = vscode.window.activeTextEditor;
        if (!editor) {
			return;
		}

		const lineCount = editor.document.lineCount;
		const selectionStartLine = editor.selection.start.line;
		const selectionEndLine = editor.selection.end.line;
		const leapLineNumber = direction == 'up' ? Math.max(selectionStartLine - leapDistance, 0) : Math.min(selectionEndLine + leapDistance, lineCount - 1);
		const selectionHeight = selectionEndLine - selectionStartLine + 1;
		const selectionLength = editor.document.getText(editor.selection).length;
		var textLength = 0;
		for (let i = 0; i < selectionHeight; i++) {
			textLength += editor.document.lineAt(editor.selection.end.line - i).text.length;
		}

		if (selectionLength < textLength && leapDistance == 1) {
			const startPosition = new vscode.Position(selectionStartLine, 0);
			const endPosition = new vscode.Position(selectionEndLine, textLength);
			editor.selection = new vscode.Selection(startPosition, endPosition);
		} else {
			const startPosition = new vscode.Position(direction == 'up' ? leapLineNumber : selectionStartLine, 0);
			const endPosition = new vscode.Position(direction == 'up' ? selectionEndLine : leapLineNumber, textLength);
			editor.selection = new vscode.Selection(startPosition, endPosition);
		}

		vscode.commands.executeCommand('revealLine', {
			lineNumber: leapLineNumber,
			at: 'center'
		});

		if (updateHistory) {
			lastCommand = ()=>{selectMacro(direction, leapDistance, updateHistory)};
		}
	};

	function goToMacro(lineNumber){
		const editor = vscode.window.activeTextEditor;

		const destinationIndex = editor.document.lineCount >= lineNumber ? lineNumber : editor.document.lineCount;
		editor.selection = new vscode.Selection(
			new vscode.Position(destinationIndex, 0),
			new vscode.Position(destinationIndex, 0)
		);

		vscode.commands.executeCommand('revealLine', {
			lineNumber: destinationIndex,
			at: 'center'
		});

		lastCommand = ()=>{goToMacro(lineNumber)};
	};

	function shiftMacro(direction, leapDistance){
		const editor = vscode.window.activeTextEditor;

		const selectionStartLine = editor.selection.start.line;
		const selectionEndLine = editor.selection.end.line;
		const selectionEndLastCharIndex = editor.document.lineAt(selectionEndLine).text.length;
		const selectionHeight = selectionEndLine - selectionStartLine + 1;
		const lastLineIndex = editor.document.lineCount - 1;

		if (selectionStartLine == 0 && direction == 'up' ||
			selectionEndLine == lastLineIndex && direction == 'down'){
			return;
		}
		
		const startPosition = new vscode.Position(selectionStartLine, 0);
		const endPosition = selectionEndLine + 1 < lastLineIndex ?
							new vscode.Position(selectionEndLine + 1, 0) :
							new vscode.Position(lastLineIndex, selectionEndLastCharIndex)
		const selectionRange = new vscode.Range(startPosition, endPosition);
		const selectionText = editor.document.getText(selectionRange);

		editor.edit((editBuilder)=>{
			let newStartLine;
			let newStartCharIndex;
			let newSelectionText;
			if (direction == 'up') {
				newStartLine = Math.max(selectionStartLine - leapDistance, 0);
				newStartCharIndex = 0;
				newSelectionText = selectionText.substring(0, selectionText.length - 1) + '\n';
			} else {
				newStartLine = Math.min(selectionStartLine + leapDistance + selectionHeight - 1, lastLineIndex);
				newStartCharIndex = editor.document.lineAt(newStartLine).text.length + 1;
				newSelectionText = '\n' + selectionText.substring(0, selectionText.length - 2);
			}

			const shiftedPosition = new vscode.Position(newStartLine, newStartCharIndex);

			editBuilder.insert(shiftedPosition, newSelectionText);
			editBuilder.delete(selectionRange);

			setTimeout(() => {
				let newSelectionLastCharIndex;
				let newSelectionStartPosition;
				let newSelectionEndPosition;
				if (selectionStartLine - leapDistance < 0 && direction == 'up') {
					newSelectionLastCharIndex = editor.document.lineAt(selectionHeight - 1).text.length;
					newSelectionStartPosition = new vscode.Position(0, 0);
					newSelectionEndPosition = new vscode.Position(selectionHeight - 1, newSelectionLastCharIndex);
				} else if (selectionEndLine + leapDistance > lastLineIndex && direction == 'down') {
					newSelectionLastCharIndex = editor.document.lineAt(lastLineIndex).text.length;
					newSelectionStartPosition = new vscode.Position(lastLineIndex - selectionHeight + 1, 0);
					newSelectionEndPosition = new vscode.Position(lastLineIndex, newSelectionLastCharIndex);
				} else if (direction == 'up') {
					newSelectionLastCharIndex = editor.document.lineAt(newStartLine + selectionHeight - 1).text.length + 1;
					newSelectionStartPosition = new vscode.Position(newStartLine, 0);
					newSelectionEndPosition = new vscode.Position(newStartLine + selectionHeight - 1, newSelectionLastCharIndex);
				} else if (direction == 'down') {
					newSelectionLastCharIndex = editor.document.lineAt(newStartLine + selectionHeight - 1).text.length + 1;
					newSelectionStartPosition = new vscode.Position(newStartLine - selectionHeight + 1, 0);
					newSelectionEndPosition = new vscode.Position(newStartLine, newSelectionLastCharIndex);
				}
				editor.selection = new vscode.Selection(newSelectionStartPosition, newSelectionEndPosition);

				vscode.commands.executeCommand('revealLine', {
					lineNumber: newStartLine,
					at: 'center'
				});

				lastCommand = ()=>{shiftMacro(direction, leapDistance)}
			}, 10);
		})
	}

	function findMacro(direction, input){
		const editor = vscode.window.activeTextEditor;

		let characters;
		switch (input) {
			case '':
				const selectedText = editor.document.getText(editor.selection);
				if (!selectedText) {
					vscode.window.showWarningMessage('You cannot run this command without arguments if you have no text selected.');
					return;
				}

				characters = selectedText.toLowerCase();
				lastStringParam = selectedText.toLowerCase();
				lastCommand = ()=>{findMacro(direction, selectedText.toLowerCase())};
				break;
			case '#':
				if (lastStringParam) {
					characters = lastStringParam;
					lastCommand = ()=>{findMacro(direction, lastStringParam)};
				} else {
					vscode.window.showWarningMessage('No saved string argument was found.');
					return;
				}
				break;
			case '\\#':
				characters = '#';
				lastStringParam = '#';
				lastCommand = ()=>{findMacro(direction, '\\#')};
				break;
			default:
				characters = input.toLowerCase();
				lastStringParam = input.toLowerCase();
				lastCommand = ()=>{findMacro(direction, input.toLowerCase())};
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

		let targetLineIndex;
		let targetCharIndex;
		let currentLineIndex = startingLineIndex;
		const offset = direction == 'next' || direction == 'first' ? characters.length : 0;
		let currentCharIndex = editor.selection.start.character + offset;
		
		while (!targetLineIndex) {
			const textAtCurrentLine = editor.document.lineAt(currentLineIndex).text.toLowerCase();
			const matchesInputValue = direction == 'next' || direction == 'first' ?
									  textAtCurrentLine.includes(characters, currentCharIndex) :
									  textAtCurrentLine.substring(0, currentCharIndex).includes(characters);
			if (matchesInputValue) {
				targetLineIndex = currentLineIndex;
				targetCharIndex = direction == 'next' || direction == 'first' ?
				 				  textAtCurrentLine.indexOf(characters, currentCharIndex) :
								  textAtCurrentLine.substring(0, currentCharIndex).lastIndexOf(characters);
			} else {
				currentLineIndex += direction == 'next' || direction == 'first' ? 1 : -1;
				currentCharIndex = direction == 'next' || direction == 'first' ? 0 : 10000;
			}

			const isInbounds = currentLineIndex >= 0 && currentLineIndex <= lastLineIndex;
			const isLastCheck = ((direction == 'prev' || direction == 'last') && currentLineIndex == 0) ||
								((direction == 'next' || direction == 'first') && currentLineIndex == lastLineIndex);
			if (isLastCheck && !targetLineIndex) {
				vscode.window.showWarningMessage(`Froggy: No ${direction == 'next' ? 'following' : 'previous'} match for '${characters}'`);
				return;
			} else if (!isInbounds) {
				break;
			}
		}

		const newCursor = new vscode.Selection(
			new vscode.Position(targetLineIndex, targetCharIndex),
			new vscode.Position(targetLineIndex, targetCharIndex)
		)
		editor.selection = newCursor;

		vscode.commands.executeCommand('revealLine', {
			lineNumber: targetLineIndex,
			at: 'center'
		});
	}

	async function goToDefMacro(input){
		const editor = vscode.window.activeTextEditor;
		let symbolName;
		switch (input) {
			case '':
				const selectedText = editor.document.getText(editor.selection);
				if (!selectedText) {
					vscode.window.showWarningMessage('You cannot run this command without arguments if you have no text selected.');
					return;
				}
	
				symbolName = selectedText.toLowerCase();
				lastStringParam = selectedText.toLowerCase();
				lastCommand = ()=>{goToDefMacro(selectedText.toLowerCase())};
				break;
			case '#':
				if (lastStringParam) {
					symbolName = lastStringParam;
					lastCommand = ()=>{goToDefMacro(lastStringParam)};
				} else {
					vscode.window.showWarningMessage('No saved string argument was found.');
				}
				break;
			case '\\#':
				symbolName = '#';
				lastStringParam = '\\#';
				lastCommand = ()=>{goToDefMacro('\\#')};
				break;
			default:
				symbolName = input.toLowerCase();
				lastStringParam = input.toLowerCase();
				lastCommand = ()=>{goToDefMacro(input.toLowerCase())};
				break;
		}
		if (input == '') {
			const selectedText = editor.document.getText(editor.selection);
			if (!selectedText) {
				vscode.window.showWarningMessage('You cannot run this command without arguments if you have no text selected.');
				return;
			}

			symbolName = selectedText.toLowerCase();
			lastCommand = ()=>{goToDefMacro(selectedText.toLowerCase())};
		} else {
			symbolName = input.toLowerCase();
			lastCommand = ()=>{goToDefMacro(input.toLowerCase())};
		}

		const symbols = await vscode.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', symbolName);
		
		if (symbols.length) {
			const location = symbols[symbols.length - 1].location;
			const document = await vscode.workspace.openTextDocument(location.uri);
			const editor = await vscode.window.showTextDocument(document);

			editor.selection = new vscode.Selection(
				location.range.start,
				location.range.start
			);

			vscode.commands.executeCommand('revealLine', {
				lineNumber: location.range.start.line,
				at: 'center'
			});
		} else {
			vscode.window.showWarningMessage(`Could not find symbol '${symbolName}'.`);
		}
	}

	function findErrorMacro(){
		const editor = vscode.window.activeTextEditor;

		const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);

		if (!diagnostics.length) {
			vscode.window.showWarningMessage('No error found in the current text document.');
			return;
		}

		const errorPositions = diagnostics.map((error)=>{
			return [error.range.start.line, error.range.start.character];
		}).sort((error1, error2)=>{
			return error1[0] - error2[0];
		});

		const currentLine = editor.selection.start.line;
		const nextError = errorPositions.find((error)=>{
			return error[0] > currentLine;
		});

		const errorLine = nextError ? nextError[0] : errorPositions[0][0];
		const errorChar = nextError ? nextError[1] : errorPositions[0][1];

		const newCursor = new vscode.Selection(
			new vscode.Position(errorLine, errorChar),
			new vscode.Position(errorLine, errorChar)
		);
		editor.selection = newCursor;

		vscode.commands.executeCommand('revealLine', {
			lineNumber: errorLine,
			at: 'center'
		});

		lastCommand = ()=>{findErrorMacro()};
	}

	function handlePromptValue(value){
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		switch(true){
			case value == 'start':
				goToMacro(0);
				break;
			case value == 'end':
				const lastLineIndex = editor.document.lineCount - 1;
				goToMacro(lastLineIndex);
				break;
			case /^goto.*$/.test(value):
				const destinationIndex = Number(value.match(/\d+$/)[0]) - 1;
				goToMacro(destinationIndex);
				break;
			case /^up.*$/.test(value):
				const upCount = Number(value.match(/\d+$/)[0]);
				moveMacro('up', upCount, true);
				break;
			case /^down.*$/.test(value):
				const downCount = Number(value.match(/\d+$/)[0]);
				moveMacro('down', downCount, true);
				break;
			case /^shup.*$/.test(value):
				const shiftUpCount = Number(value.match(/\d+$/)[0]);
				shiftMacro('up', shiftUpCount);
				break;
			case /^shdown.*$/.test(value):
				const shiftDownCount = Number(value.match(/\d+$/)[0]);
				shiftMacro('down', shiftDownCount);
				break;
			case /^next.*$/.test(value):
				const nextChars = value.replace('next', '');
				findMacro('next', nextChars);
				break;
			case /^prev.*$/.test(value):
				const prevChars = value.replace('prev', '');
				findMacro('prev', prevChars);
				break;
			case /^first.*$/.test(value):
				const firstChars = value.replace('first', '');
				findMacro('first', firstChars);
				break;
			case /^last.*$/.test(value):
				const lastChars = value.replace('last', '');
				findMacro('last', lastChars);
				break;
			case /^def.*$/.test(value):
				const defChars = value.replace('def', '');
				goToDefMacro(defChars);
				break;
			case value == 'err':
				findErrorMacro();
				break;
			case value != undefined:
				vscode.window.showErrorMessage(`Froggy command '${value}' is unknown, is missing arguments or has wrong argument type.`);
				break;
			default:
				break;
		}
	}

	const upFive = vscode.commands.registerCommand(`badlvckinc.UpFive`, ()=>{
		moveMacro('up', 5)
	});
	const downFive = vscode.commands.registerCommand(`badlvckinc.DownFive`,()=>{
		moveMacro('down', 5)
	});
	const upTen = vscode.commands.registerCommand(`badlvckinc.UpTen`, ()=>{
		moveMacro('up', 10)
	});
	const downTen = vscode.commands.registerCommand(`badlvckinc.DownTen`, ()=>{
		moveMacro('down', 10)
	});

	const selectUpOne = vscode.commands.registerCommand('badlvckinc.SelectUpOne', ()=>{
		selectMacro('up', 1);
	});
	
	const selectDownOne = vscode.commands.registerCommand('badlvckinc.SelectDownOne', ()=>{
		selectMacro('down', 1);
	});

	const selectUpFive = vscode.commands.registerCommand('badlvckinc.SelectUpFive', ()=>{
		selectMacro('up', 5);
	});
	
	const selectDownFive = vscode.commands.registerCommand('badlvckinc.SelectDownFive', ()=>{
		selectMacro('down', 5);
	});

	const selectUpTen = vscode.commands.registerCommand('badlvckinc.SelectUpTen', ()=>{
		selectMacro('up', 10);
	});
	
	const selectDownTen = vscode.commands.registerCommand('badlvckinc.SelectDownTen', ()=>{
		selectMacro('down', 10);
	});

	const goToLineStart = vscode.commands.registerCommand('badlvckinc.GoToLineStart', ()=>{
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const currentLine = editor.selection.start.line;
		const firstChar = editor.document.lineAt(currentLine).firstNonWhitespaceCharacterIndex;
		const cursorAtStart = new vscode.Selection(
			new vscode.Position(currentLine, firstChar),
			new vscode.Position(currentLine, firstChar),
		);
		editor.selection = cursorAtStart; 
	});

	const goToLineEnd = vscode.commands.registerCommand('badlvckinc.GoToLineEnd', ()=>{
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const currentLine = editor.selection.end.line;
		const lineLength = editor.document.lineAt(currentLine).text.length;
		const cursorAtEnd = new vscode.Selection(
			new vscode.Position(currentLine, lineLength),
			new vscode.Position(currentLine, lineLength),
		);
		editor.selection = cursorAtEnd; 
	});

	const extendSelectionToLineStart = vscode.commands.registerCommand('badlvckinc.ExpandSelectionToLineStart', ()=>{
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const startLine = editor.selection.start.line;
		const endLine = editor.selection.end.line;
		const endChar = editor.selection.end.character;
		const extendedSelection = new vscode.Selection(
			new vscode.Position(startLine, 0),
			new vscode.Position(endLine, endChar)
		);
		editor.selection = extendedSelection;
	});

	const extendSelectionToLineEnd = vscode.commands.registerCommand('badlvckinc.ExpandSelectionToLineEnd', ()=>{
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const startLine = editor.selection.start.line;
		const startChar = editor.selection.start.character;
		const endLine = editor.selection.end.line;
		const endLineLength = editor.document.lineAt(endLine).text.length;
		const extendedSelection = new vscode.Selection(
			new vscode.Position(startLine, startChar),
			new vscode.Position(endLine, endLineLength)
		);
		editor.selection = extendedSelection;
	});

	const startPrompt = vscode.commands.registerCommand('badlvckinc.FroggyPrompt', ()=>{
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		quotes = [
			'Today is your victory over yourself of yesterday, tomorrow is your victory over lesser men',
			'The weak are meat, the strong eat'
		];
		randomIndex = Math.round(Math.random() * (quotes.length - 1));
		randomQuote = quotes[randomIndex];

		vscode.window.showInputBox({
			prompt: 'Insert command',
			placeHolder: randomQuote,
		}).then((value)=>{
			handlePromptValue(value);
		})
	});
	
	const repeatLastCommand = vscode.commands.registerCommand('badlvckinc.RepeatLastCommand', ()=>{
		lastCommand()
	});

	context.subscriptions.push(
		upFive,
		downFive,
		upTen,
		downTen,
		selectUpOne,
		selectDownOne,
		selectUpFive,
		selectDownFive,
		selectUpTen,
		selectDownTen,
		goToLineStart,
		goToLineEnd,
		extendSelectionToLineStart,
		extendSelectionToLineEnd,
		startPrompt,
		repeatLastCommand
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
