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

export class ProjectCreationWizard {

  public static currentPanel: ProjectCreationWizard | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _rpcHandler: WebViewRpc;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._rpcHandler = new WebViewRpc(this._panel);
  }

  public static render(extensionUri: vscode.Uri) {
    if (ProjectCreationWizard.currentPanel) {
      ProjectCreationWizard.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel("create-new-project", "Create new Project", vscode.ViewColumn.One, {
        enableScripts: true
      });

      ProjectCreationWizard.currentPanel = new ProjectCreationWizard(panel, extensionUri);
    }
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "resources",
      "jslibs",
      "choreo-vscode-webviews.js"
    ]);

    return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <title>Choreo Project Wizard</title>
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="root"></div>
              <script src="${scriptUri}"></script>
              <script>
                  // TODO user window.renderChoreoWebViews({ type: "ProjectCreateForm"}) to render on window.ready
              </script>
            </body>
          </html>
        `;
  }

  public dispose() {
    ProjectCreationWizard.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}