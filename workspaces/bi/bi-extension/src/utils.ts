/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Uri, Webview, workspace } from "vscode";

export interface ProjectInfo {
    isBI: boolean;
    isMultiRoot: boolean;
};

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    if (process.env.WEB_VIEW_DEV_MODE === "true") {
        return new URL(pathList[pathList.length - 1], process.env.WEB_VIEW_DEV_HOST as string).href;
    }
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export function fetchProjectInfo(): ProjectInfo {
    const workspaceUris = workspace.workspaceFolders ? workspace.workspaceFolders.map(folder => folder.uri) : [];
    let isBICount = 0; // Counter for workspaces with isBI set to true
    
    // Check each workspace folder's configuration for 'isBI'
    for (const uri of workspaceUris) {
        if (checkIsBI(uri)) {
            isBICount++; // Increment the count if isBI is true
        }
    }

    // Return true if any workspace has isBI set to true
    return {
        isBI: isBICount > 0,
        isMultiRoot: isBICount > 1 // Set to true only if more than one workspace has isBI set to true
    };
}

export function checkIsBI(uri: Uri): boolean {
    const config = workspace.getConfiguration('kolab', uri);
    const inspected = config.inspect<boolean>('isBI');

    if (inspected) {
        const valuesToCheck = [
            inspected.workspaceFolderValue,
            inspected.workspaceValue,
            inspected.globalValue
        ];
        return valuesToCheck.find(value => value === true) !== undefined; // Return true if isBI is set to true
    }
    return false; // Return false if isBI is not set
}
