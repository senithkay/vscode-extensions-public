import * as vscode from 'vscode';

export function createBalaContentProvider(options: vscode.EventEmitter<vscode.Uri>): vscode.TextDocumentContentProvider {
	return <vscode.TextDocumentContentProvider>{
		onDidChange: options.event,
		provideTextDocumentContent: async (uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> => {
            let fileUri = vscode.Uri.file(uri.path);
            return await (await vscode.workspace.fs.readFile(fileUri)).toString();
		}
	};
} 
