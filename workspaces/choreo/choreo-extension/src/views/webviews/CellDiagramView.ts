import * as vscode from 'vscode';
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { getUri } from './utils';
import { Organization } from "@wso2-enterprise/choreo-core";

export class CellDiagramView {
    private static currentPanel: CellDiagramView | undefined;
    private static _rpcHandler: WebViewPanelRpc;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, orgName: string, projectId: string) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, orgName, projectId);
        if (!CellDiagramView._rpcHandler || CellDiagramView._rpcHandler.panel !== panel) {
            CellDiagramView._rpcHandler = new WebViewPanelRpc(this._panel);
        }
    }

    public static render(extensionUri: vscode.Uri, org: Organization, projectId: string) {
        if (CellDiagramView.currentPanel) {
            const panel = CellDiagramView.currentPanel._panel;
            CellDiagramView.currentPanel = new CellDiagramView(panel, extensionUri, org.name, projectId);
            panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                "choreo-cell-view",
                "Cell Diagram View",
                vscode.ViewColumn.One,
                { enableScripts: true, retainContextWhenHidden: true }
            );
            CellDiagramView.currentPanel = new CellDiagramView(panel, extensionUri, org.name, projectId);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, orgName: string, projectId: string) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, extensionUri, [
            "resources",
            "jslibs",
            "main.js"
        ]);

        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                    <meta name="theme-color" content="#000000">
                    <title>Cell Diagram View</title>
                    <script src="${scriptUri}"></script>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                </body>
                <script>
                    function render() {
                        choreoWebviews.renderChoreoWebViews(
							document.getElementById("root"), 
							"ChoreoCellView", 
							"${projectId}", 
							"${orgName}"
						);
                    }
                    render();
                </script>
            </html>
          `;
    }

    private dispose() {
        CellDiagramView.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
