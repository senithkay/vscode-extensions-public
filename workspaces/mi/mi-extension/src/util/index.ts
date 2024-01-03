import * as path from 'path';
import { ExtensionContext, Uri, Webview } from "vscode";

const isDevMode = process.env.WEB_VIEW_WATCH_MODE === "true";

export function getComposerJSFiles(context: ExtensionContext, componentName: string, webView: Webview): string[] {
	const filePath = path.join(context.extensionPath, 'resources', 'jslibs', componentName + '.js');
	return [
		isDevMode ? path.join(process.env.WEB_VIEW_DEV_HOST!, componentName + '.js')
			: webView.asWebviewUri(Uri.file(filePath)).toString(),
		isDevMode ? 'http://localhost:8097' : '' // For React Dev Tools
	];
}
