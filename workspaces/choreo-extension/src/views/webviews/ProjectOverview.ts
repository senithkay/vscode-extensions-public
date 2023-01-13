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
import { Project } from "@wso2-enterprise/choreo-core";
import * as vscode from "vscode";
import { WebViewRpc } from "./rpc/WebviewRPC";
import { getUri } from "./utils";

export class ProjectOverview {

    public static currentPanel: ProjectOverview | undefined;
    public static project: Project | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _rpcHandler: WebViewRpc;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, initialProject: string) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, initialProject);
        this._rpcHandler = new WebViewRpc(this._panel);
    }

    public static render(extensionUri: vscode.Uri, project: Project) {
        if (ProjectOverview.currentPanel) {
            ProjectOverview.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("project-overview", "Project Overview", vscode.ViewColumn.One, {
                enableScripts: true, retainContextWhenHidden: true
            });

            ProjectOverview.currentPanel = new ProjectOverview(panel, extensionUri, project.id);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, projectId: string) {
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
              <title>Project Overview</title>
              <script src="${scriptUri}"></script>
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="root"></div>
            </body>
            <script>
              function render() {
                window.renderChoreoWebViews({ type: "ProjectOverview", projectId: "${projectId}" });
              }
              window.onload = () => {
                render();
              }
            </script>
          </html>
        `;
    }

    public dispose() {
        ProjectOverview.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
