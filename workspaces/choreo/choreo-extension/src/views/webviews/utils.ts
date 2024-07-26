/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import path from "path";
import { Uri, Webview } from "vscode";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
  if (shouldUseCellViewDevMode(pathList)) {
    return process.env.CELL_VIEW_DEV_HOST;
  }
  if (shouldUseWebViewDevMode(pathList)) {
    return process.env.WEB_VIEW_DEV_HOST;
  }
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

function shouldUseCellViewDevMode(pathList: string[]): boolean {
  return pathList[pathList.length - 1] === "cellDiagram.js"
    && process.env.CELL_VIEW_DEV_MODE === "true"
    && process.env.CELL_VIEW_DEV_HOST !== undefined;
}

function shouldUseWebViewDevMode(pathList: string[]): boolean {
  return pathList[pathList.length - 1] === "main.js"
    && process.env.WEB_VIEW_DEV_MODE === "true"
    && process.env.WEB_VIEW_DEV_HOST !== undefined;
}
