/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import * as vscode from 'vscode';
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { getUri } from './utils';
import { Organization } from "@wso2-enterprise/choreo-core";
import { ext } from "../../extensionVariables";
import { Project } from "@wso2-enterprise/ballerina-languageclient";

export class CellDiagramView {
    private static currentPanel: CellDiagramView | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _rpcHandler: WebViewPanelRpc;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, project: Project) {
        this._panel = panel;
        this._rpcHandler = new WebViewPanelRpc(panel);

        this._panel.onDidDispose(() => this.dispose());
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, project);
    }


    public static render(extensionUri: vscode.Uri, project: Project) {
        if (CellDiagramView.currentPanel) {
            const panel = CellDiagramView.currentPanel._panel;
            CellDiagramView.currentPanel._rpcHandler.dispose();
            CellDiagramView.currentPanel = new CellDiagramView(panel, extensionUri, project);
            panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'cell-diagram',
                'Cell Diagram',
                vscode.ViewColumn.One,
                { enableScripts: true, retainContextWhenHidden: true }
            );
            CellDiagramView.currentPanel = new CellDiagramView(panel, extensionUri, project);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, project: Project) {
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
                    <title>Choreo Cell Diagram View</title>
                    <script src="${scriptUri}"></script>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                </body>
                <script>
                    function render() {
                        cellDiagram.renderDiagram(
                            ${JSON.stringify(project)},
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
