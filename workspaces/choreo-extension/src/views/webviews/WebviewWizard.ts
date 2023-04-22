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
import * as vscode from "vscode";
import { WebViewRpc } from "./rpc/WebviewRPC";
import { getUri } from "./utils";

export enum WizardTypes {
  projectCreation = "ProjectCreateForm",
  componentCreation = "ComponentCreateForm"
}

export class WebviewWizard {
  public static currentPanel: WebviewWizard | undefined;
  private _panel: vscode.WebviewPanel | undefined;
  private _disposables: vscode.Disposable[] = [];
  private _rpcHandler: WebViewRpc;

  constructor(extensionUri: vscode.Uri, type: WizardTypes) {
    this._panel = WebviewWizard.createWebview(type);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, type);
    this._rpcHandler = new WebViewRpc(this._panel);
  }

  private static createWebview(type: WizardTypes): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(type,
      `Create New ${type === WizardTypes.componentCreation ? 'Component' : 'Project'}`,
      type === WizardTypes.componentCreation ? vscode.ViewColumn.Beside : vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    return panel;
  }

  public getWebview(): vscode.WebviewPanel | undefined {
    return this._panel;
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, wizardType: WizardTypes) {
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "resources",
      "jslibs",
      "main.js"
    ]);

    const codiconUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "resources", "codicons", "codicon.css"));

    return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <title>Choreo Webview Wizard</title>
              <link rel="stylesheet" href="${codiconUri}">
              <script src="${scriptUri}"></script>
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="root"></div>
            </body>
            <script>
              function render() {
                choreoWebviews.renderChoreoWebViews(document.getElementById("root"), "${wizardType.toString()}");
              }
              render();
            </script>
          </html>
        `;
  }

  public dispose() {
    WebviewWizard.currentPanel = undefined;
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
