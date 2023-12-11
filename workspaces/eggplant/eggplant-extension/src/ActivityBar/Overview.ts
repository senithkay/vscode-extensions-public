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
import { ExtensionContext } from "vscode";
// import { WebViewViewRPC } from "../rpc/WebviewRPC";
import { getUri } from '../utils';
import { ext } from '../eggplantExtentionContext';
import { RPCLayer } from '../webRPCRegister';
// import { ext } from '../../../extensionVariables';
// import { choreoEnvConfig } from '../../../auth/auth';
// import { FREE_COMPONENT_LIMIT } from '../../../auth/config';


export class Overview implements vscode.WebviewViewProvider {

    public static readonly viewType = 'eggplant.activity.overview';

    private _view?: vscode.WebviewView;
    // private _rpc?: WebViewViewRPC;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this.getWebviewContent(webviewView.webview);
        RPCLayer.create(webviewView);
        // this._rpc = new WebViewViewRPC(webviewView);
    }

    private getWebviewContent(webview: vscode.Webview) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, ext.context.extensionUri, [
            "resources",
            "jslibs",
            "Visualizer.js"
        ]);


        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>Eggplant Overview</title>
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
                    document.getElementById("root"), "overview"
                );
            }
            render();
        </script>
        </body>
        </html>
      `;
    }
}
