/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from "vscode";
import { Messenger } from "vscode-messenger";
import { NotificationType, RequestType } from "vscode-messenger-common";
import { retryConversion, getService } from "./stateMachine";
import { error } from "console";
import { WebView } from "./WebView/WebView";

export const messenger = new Messenger();

interface StateChangeEvent {
  state: string;
  theme: string;
  outputData?: string;
  errorMessage?: string;
}

const stateChanged: NotificationType<StateChangeEvent> = {
  method: "stateChanged",
};
const retryRequest: NotificationType<void> = { method: "retryRequest" };

getService().onTransition((state) => {
  const snapshot: StateChangeEvent = {
    state: stateString(state.value),
    theme: getTheme(),
    outputData: state.context.outputData,
    errorMessage: state.context.error,
  };
  messenger.sendNotification(
    stateChanged,
    { type: "webview", webviewType: "FHIRToolsWebview" },
    snapshot
  );
});

messenger.onRequest(retryRequest, () => {
  retryConversion();
});

function stateString(state: any): string {
  let curState = '';
  if (typeof state === "string") {
    curState = state;
  } else if (typeof state === "object") {
    const stateString = Object.entries(state)
      .map(([key, value]) => `${key}.${value}`)
      .at(0);
    if (stateString === undefined) {
      throw error("Undefined state");
    } else {
      curState = stateString;
    }
  } else {
    throw error("Undefined state");
  }
  if (curState === "DisplayOutput" || curState === "Loading" || curState === "Error"){
    WebView.currentPanel?.setState(curState);
  }
  return curState;
}

function getTheme(): string {
  if (
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light ||
    vscode.window.activeColorTheme.kind ===
      vscode.ColorThemeKind.HighContrastLight
  ) {
    return "light";
  }
  return "dark";
}

vscode.workspace.onDidChangeConfiguration((e) => {
  if (e.affectsConfiguration("workbench.colorTheme")) {
    if (WebView.isPanelActive()) {
      let colorTheme = getTheme();
      messenger.sendNotification(
        stateChanged,
        { type: "webview", webviewType: "FHIRToolsWebview" },
        { state: "themeChanged", theme: colorTheme }
      );
    }
  }
});
