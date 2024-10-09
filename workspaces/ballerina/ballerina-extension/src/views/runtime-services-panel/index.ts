/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands } from 'vscode';
import { BI_COMMANDS } from '@wso2-enterprise/ballerina-core';
import { BallerinaExtension } from '../../core';
import { RuntimeServicesWebview } from './webview';

export function activateRuntimeServicePanel(ballerinaExtInstance: BallerinaExtension) {
    ballerinaExtInstance.context.subscriptions.push(
        commands.registerCommand(BI_COMMANDS.BI_OPEN_RUNTIME_VIEW, () => {
            openRuntimeServicesWebview();
        })
    );
}

export function openRuntimeServicesWebview() {
    if (!RuntimeServicesWebview.currentPanel) {
        RuntimeServicesWebview.currentPanel = new RuntimeServicesWebview();
    } else {
        RuntimeServicesWebview.currentPanel!.getWebview()?.reveal();
    }
}
