/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Organization, Project } from "@wso2-enterprise/choreo-core";
import * as vscode from "vscode";
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { ext } from "../../extensionVariables";
import { getUri } from "./utils";
import { FREE_COMPONENT_LIMIT } from "../../auth/config";
import { choreoEnvConfig } from "../../auth/auth";

export class ProjectOverview {

  public static currentPanel: ProjectOverview | undefined;
  private static _rpcHandler: WebViewPanelRpc;
  public static project: Project | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, initialProject: string, orgName: string) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, initialProject, orgName);
    if (!ProjectOverview._rpcHandler) {
      ProjectOverview._rpcHandler = new WebViewPanelRpc(this._panel);
    } else if (ProjectOverview._rpcHandler.panel !== panel) {
      ProjectOverview._rpcHandler = new WebViewPanelRpc(this._panel);
    }
    this._panel.onDidChangeViewState(e => {
      if (e.webviewPanel.visible) {
        ext.api.projectUpdated();
      }
    });
  }

  public static render(extensionUri: vscode.Uri, project: Project, org: Organization) {
    if (ProjectOverview.currentPanel) {
      const panel = ProjectOverview.currentPanel._panel;
      ProjectOverview.currentPanel = new ProjectOverview(panel, extensionUri, project.id, org.handle);
      panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel("project-overview", "Project Overview", vscode.ViewColumn.One, {
        enableScripts: true, retainContextWhenHidden: true
      });
      ProjectOverview.currentPanel = new ProjectOverview(panel, extensionUri, project.id, org.handle);
    }
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, projectId: string, orgName: string) {
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "resources",
      "jslibs",
      "main.js"
    ]);

    const codiconUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "resources", "codicons", "codicon.css"));
    const fontsUri = webview.asWebviewUri(vscode.Uri.joinPath(ext.context.extensionUri, "node_modules", "@wso2-enterprise", "font-wso2-vscode", "dist", "wso2-vscode.css"));

    return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <title>Project Overview</title>
              <link rel="stylesheet" href="${codiconUri}">
              <link rel="stylesheet" href="${fontsUri}">
              <script src="${scriptUri}"></script>
              <script src="${fontsUri}"></script>
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="root"></div>
            </body>
            <script>
              function render() {
                choreoWebviews.renderChoreoWebViews(
                  document.getElementById("root"), 
                  "ProjectOverview", 
                  "${projectId}", 
                  "${orgName}", 
                  ${FREE_COMPONENT_LIMIT}, 
                  "${choreoEnvConfig.getConsoleUrl()}"
                );
              }
              render();
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
