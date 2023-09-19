import * as vscode from 'vscode';
import { activateConsole } from './console';
import { setOpenAPI } from './TestEngine';
import axios from 'axios';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Check the content of the active document when the extension is activated
	checkDocumentForOpenAPI(vscode.window.activeTextEditor?.document);

	// Listen for document changes
	vscode.window.onDidChangeActiveTextEditor(editor => {
		checkDocumentForOpenAPI(editor?.document);
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		checkDocumentForOpenAPI(event.document);
	}, null, context.subscriptions);

	activateConsole(context);
}

function checkDocumentForOpenAPI(document?: vscode.TextDocument) {
	if (document) {
		// check if document is yaml or json
		const fileName = document.fileName;
		if (fileName.endsWith('.yaml') || fileName.endsWith('.yml') || fileName.endsWith('.json')) {
			//check if document contains openapi
			const fileContent = document.getText();
			const isOpenAPI = fileContent.includes('openapi');
			vscode.commands.executeCommand('setContext', 'isFileOpenAPI', isOpenAPI);
		}
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
