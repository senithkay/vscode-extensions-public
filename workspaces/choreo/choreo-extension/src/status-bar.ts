/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { StatusBarAlignment, window} from "vscode";
import { ext } from "./extensionVariables";

// TODO: update
export async function activateStatusBarItem() {
    ext.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
	ext.context.subscriptions.push(ext.statusBarItem);
    // if (await ext.api.isChoreoProject()) {
    //     const project = await ext.api.getChoreoProject();
    //     if (project) {
    //         ext.statusBarItem.text = `Choreo: ${project.name}`;
    //         ext.statusBarItem.show();
    //     }
    // }
}
