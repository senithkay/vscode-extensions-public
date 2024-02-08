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
import { ExtensionContext, Uri } from "vscode";
// import { WebViewViewRPC } from "../rpc/WebviewRPC";
import { getUri } from '../utils';
import { ext } from '../eggplantExtentionContext';
import { RPCLayer } from '../webRPCRegister';
// import { ext } from '../../../extensionVariables';
// import { choreoEnvConfig } from '../../../auth/auth';
// import { FREE_COMPONENT_LIMIT } from '../../../auth/config';



export class LowCode {
    public static currentPanel: LowCode | undefined;
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    //private _rpcHandler: WebViewPanelRpc;

    constructor() {
        this._panel = LowCode.createWebview();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this.getWebviewContent(this._panel.webview);
        RPCLayer.create(this._panel);
        //this._rpcHandler = new WebViewPanelRpc(this._panel);
    }

    private static createWebview(): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'lowcode',
            'Eggplant View',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        return panel;
    }

    public getWebview(): vscode.WebviewPanel | undefined {
        return this._panel;
    }

    private getWebviewContent(webview: vscode.Webview) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, ext.context.extensionUri, [
            "resources",
            "jslibs",
            "Visualizer.js"
        ]);

        const codiconUri = webview.asWebviewUri(Uri.joinPath(ext.context.extensionUri, "resources", "codicons", "codicon.css"));
        const fontsUri = webview.asWebviewUri(Uri.joinPath(ext.context.extensionUri, "node_modules", "@wso2-enterprise", "font-wso2-vscode", "dist", "wso2-vscode.css"));

        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>Eggplant Overview</title>
          <link rel="stylesheet" href="${codiconUri}">
          <link rel="stylesheet" href="${fontsUri}">
          <script src="${scriptUri}"></script>
        </head>
        <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root">
                Loading ....
            </div>
            <script>
            function render() {
                visualizerWebview.renderWebview(
                    document.getElementById("root"), "lowcode"
                );
            }
            render();
        </script>
        </body>
        </html>
      `;
    }

    public dispose() {
        LowCode.currentPanel = undefined;
        this._panel?.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }

        this._panel = undefined;
    }
}
