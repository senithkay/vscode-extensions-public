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
