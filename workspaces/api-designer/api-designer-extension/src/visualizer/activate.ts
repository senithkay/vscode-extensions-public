/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { commands, window } from 'vscode';
import { StateMachine, openView } from '../stateMachine';
import { COMMANDS } from '../constants';
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/api-designer-core';
import { extension } from '../APIDesignerExtensionContext';

export function activateVisualizer(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(COMMANDS.OPEN_WELCOME, () => {
            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Welcome });
        })
    );
}
