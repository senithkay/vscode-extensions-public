/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { commands } from "vscode";
import { BI_COMMANDS, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { BallerinaExtension } from "../../core";
import { openView } from "../../stateMachine";
import { configGenerator } from "../config-generator/configGenerator";
import { StateMachine } from "../../stateMachine";

export function activate(context: BallerinaExtension) {
    commands.registerCommand(BI_COMMANDS.BI_RUN_PROJECT, () => {
        configGenerator(context, StateMachine.context().projectUri, false, true);
    });

    commands.registerCommand(BI_COMMANDS.ADD_CONNECTIONS, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.AddConnectionWizard });
    });

    commands.registerCommand(BI_COMMANDS.ADD_ENTRY_POINT, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BIComponentView });
    });

    commands.registerCommand(BI_COMMANDS.ADD_TYPE, () => {
        // Trigger to open the schema import view
    });

    commands.registerCommand(BI_COMMANDS.ADD_FUNCTION, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BIFunctionForm });
    });

    commands.registerCommand(BI_COMMANDS.ADD_CONFIGURATION, () => {
        // Trigger to open the configuration setup view
    });
}
