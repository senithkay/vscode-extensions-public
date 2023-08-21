import * as vscode from 'vscode';
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { getUri } from './utils';

export class CellDiagramView {
    private static currentPanel: CellDiagramView | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _rpcHandler: WebViewPanelRpc;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._rpcHandler = new WebViewPanelRpc(panel);

        this._panel.onDidDispose(() => this.dispose());

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    }

    public static render(extensionUri: vscode.Uri) {
        if (CellDiagramView.currentPanel) {
            const panel = CellDiagramView.currentPanel._panel;
            CellDiagramView.currentPanel._rpcHandler.dispose();
            CellDiagramView.currentPanel = new CellDiagramView(panel, extensionUri);
            panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'cell-diagram',
                'Cell Diagram',
                vscode.ViewColumn.One,
                { enableScripts: true, retainContextWhenHidden: true }
            );
            CellDiagramView.currentPanel = new CellDiagramView(panel, extensionUri);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, extensionUri, [
            "resources",
            "jslibs",
            "cellDiagram.js"
        ]);
        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                    <meta name="theme-color" content="#000000">
                    <title>Choreo Cell diagram View</title>
                    <script src="${scriptUri}"></script>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                </body>
                <script>
                    function render() {
                        cellDiagram.renderDiagram(
							document.getElementById("root")
						);
                    }
                    render();
                </script>
            </html>
          `;
    }

    private dispose() {
        CellDiagramView.currentPanel = undefined;
        this._rpcHandler.dispose();
        this._panel.dispose();
    }
}
