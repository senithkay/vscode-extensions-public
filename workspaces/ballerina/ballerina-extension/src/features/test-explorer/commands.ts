'use strict';
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { commands, TestItem } from "vscode";
import { openView, StateMachine, history } from "../../stateMachine";
import { BI_COMMANDS, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import path from "path";

export function activateEditKolaTest() {
    // register run project tests handler
    commands.registerCommand(BI_COMMANDS.BI_EDIT_TEST_FUNCTION, async (entry: TestItem) => {
        const fileUri = entry.uri.path;

        if (fileUri) {
            const range = entry.range;
            openView(EVENT_TYPE.OPEN_VIEW, { documentUri: fileUri, 
                position: { startLine: range.start.line, startColumn: range.start.character, 
                    endLine: range.end.line, endColumn: range.end.character } });
            history.clear();
        }        
    });

    commands.registerCommand(BI_COMMANDS.BI_ADD_TEST_FUNCTION, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BITestFunctionForm });
    });
}
