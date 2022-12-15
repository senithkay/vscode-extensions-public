/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import * as vscode from "vscode";
import { getUri } from "./utils";

export class ProjectCreationWizard {

  public static currentPanel: ProjectCreationWizard | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);
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
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "static",
      "css",
      "main.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "static",
      "js",
      "main.js",
    ]);

    return /*html*/ `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <link rel="stylesheet" type="text/css" href="${stylesUri}">
              <title>Choreo Project Wizard</title>
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="root"></div>
              <script src="${scriptUri}"></script>
            </body>
          </html>
        `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            // Code that should run in response to the hello message command
            vscode.window.showInformationMessage(text);
            return;
        }
      },
      undefined,
      this._disposables
    );
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