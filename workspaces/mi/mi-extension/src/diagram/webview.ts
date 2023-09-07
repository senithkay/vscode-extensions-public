/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as path from 'path';

export function createDiagramWebview(context: vscode.ExtensionContext) {
    // Get the path to the `diagram.js` file
    const diagramPath = vscode.Uri.file(
        path.join(context.extensionPath, 'resources', 'jslibs', 'MIDiagram.js')
    );

    // Create a new webview panel
    const panel = vscode.window.createWebviewPanel(
        'diagram',
        'Diagram',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'resources'))]
        }
    );

    panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                    <meta name="theme-color" content="#000000">
                    <title>Choreo Architecture View</title>
                    <script src="${panel.webview.asWebviewUri(diagramPath)}"></script>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="mi-diagram-container"></div>
                </body>
                <script>
                    function render() {
                        MIDiagram.renderMIDiagram(
							document.getElementById("root")
						);
                    }
                    render();
                </script>
            </html>
          `;
}
