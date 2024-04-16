/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as vscode from "vscode";
import { WebViewPanelRpc } from "./rpc/WebviewRPC";
import { getUri } from "./utils";
import { ComponentKind, Organization, Project, WebviewProps } from "@wso2-enterprise/choreo-core";

export class ComponentDetailsView {
    public static currentPanel: ComponentDetailsView | undefined;
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    private _rpcHandler: WebViewPanelRpc;

    constructor(extensionUri: vscode.Uri, organization: Organization, project: Project, component: ComponentKind, directoryPath?: string) {
        this._panel = ComponentDetailsView.createWebview(component);
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, organization, project, component, directoryPath);
        this._rpcHandler = new WebViewPanelRpc(this._panel);
    }

    private static createWebview(component: ComponentKind): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            "ComponentDetailsView",
            `Component: ${component.metadata.name}`,
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        return panel;
    }

    public getWebview(): vscode.WebviewPanel | undefined {
        return this._panel;
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, organization: Organization, project: Project, component: ComponentKind, directoryPath?: string) {
        // The JS file from the React build output
        const scriptUri = getUri(webview, extensionUri, ["resources", "jslibs", "main.js"]);

        const codiconUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, "resources", "codicons", "codicon.css")
        );
        const fontsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, "resources", "fw-vscode", "wso2-vscode.css")
        );

        return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <title>Choreo Webview Wizard</title>
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
                  ${JSON.stringify({
                      type: "ComponentDetailsView",
                      directoryPath,
                      organization,
                      project,
                      component
                  } as WebviewProps)}
                );
              }
              render();
            </script>
          </html>
        `;
    }

    public dispose() {
        ComponentDetailsView.currentPanel = undefined;
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
