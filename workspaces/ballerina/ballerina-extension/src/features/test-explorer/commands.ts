'use strict';
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, TestItem, window, ViewColumn, } from "vscode";
import { openView, StateMachine, history } from "../../stateMachine";
import { BI_COMMANDS, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import path from "path";


export function activateEditKolaTest() {
    // register run project tests handler
    commands.registerCommand("BI.test.edit.function", async (entry: TestItem) => {
        console.log(entry);

        const projectDir = path.join(StateMachine.context().projectUri);
        const functionFile = path.join(projectDir, `tests`, `abc.bal`);

        openView(EVENT_TYPE.OPEN_VIEW, { documentUri: functionFile, position: { startLine: 5, startColumn: 0, endLine: 7, endColumn: 1 } });
        history.clear();
    });

    commands.registerCommand("BI.test.add.function", () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BITestFunctionForm });
    });
}


function openWebviewDiagram(testItem: TestItem) {
    // Create a webview panel
    const panel = window.createWebviewPanel(
        'testDiagram', // Unique ID for the panel
        `Diagram for ${testItem.label}`, // Title of the panel
        ViewColumn.One, // Column to show the panel in
        {
            enableScripts: true, // Enable JavaScript in the webview
            retainContextWhenHidden: true, // Retain the webview context even when hidden
        }
    );

    // Set the HTML content for the webview
    panel.webview.html = getWebviewContent(testItem);
}

function getWebviewContent(testItem: TestItem): string {
    // Generate HTML content for the webview
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Diagram for ${testItem.label}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f0f0f0;
                }
                .diagram {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
            <div class="diagram">
                <h1>Diagram for ${testItem.label}</h1>
                <p>This is a placeholder diagram for the test case.</p>
                <!-- Add your diagram content here -->
            </div>
        </body>
        </html>
    `;
}
