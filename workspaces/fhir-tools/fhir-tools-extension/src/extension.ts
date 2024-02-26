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
import { ext } from "./fhirToolsExtentionContext";
import { activateCommands } from "./activateCommands";
import { checkDocumentContext } from "./utils";
import { Logger } from "./logger/logger";
import { listenToConfigurationChanges } from "./constants/config";

export function activate(context: vscode.ExtensionContext) {
  Logger.init(context);
  ext.context = context;

  checkDocumentContext(
    vscode.window.activeTextEditor?.document.getText(),
    vscode.window.activeTextEditor?.document.fileName
  );

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      checkDocumentContext(
        editor?.document.getText(),
        editor?.document.fileName
      );
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidSaveTextDocument(
    (event) => {
      checkDocumentContext(event.getText(), event.fileName);
    },
    null,
    context.subscriptions
  );

  activateCommands(context);
  listenToConfigurationChanges();

}

export function deactivate() {}
