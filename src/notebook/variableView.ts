import { WebviewViewProvider, WebviewView, WebviewViewResolveContext, CancellationToken, ExtensionContext } from "vscode";
import { BallerinaExtension, ExtendedLangClient } from "../core";

export class VariableViewProvider implements WebviewViewProvider {

	public static readonly viewType = 'ballerinaViewVariables';
	private view?: WebviewView;
	private ballerinaExtension: BallerinaExtension;

    constructor(extensionInstance: BallerinaExtension) {
        this.ballerinaExtension = extensionInstance; 
	}

	public resolveWebviewView(webviewView: WebviewView, _context: WebviewViewResolveContext,
		token: CancellationToken,) {
		const context = <ExtensionContext>this.ballerinaExtension.context;
		const langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
		
		this.view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
		};
		// const html = render(context, langClient);
		webviewView.webview.html = this.getHtmlForWebview();
	}

	private getHtmlForWebview() {
		let langClient: ExtendedLangClient = <ExtendedLangClient>this.ballerinaExtension.langClient;
		let varStrings = ''
        if (langClient) {
			// let variables = await langClient.getNotebookVariables();
			// variables.forEach(element => {
			// 	varStrings += `<li>${element}</li>`;
			// });
        }


		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				
				<title>Variables</title>
			</head>
			<body>
				<ul class="variable-list">${varStrings}</ul>

				<button class="add-color-button">Add Color</button>
			</body>
			</html>`;
	}
}
