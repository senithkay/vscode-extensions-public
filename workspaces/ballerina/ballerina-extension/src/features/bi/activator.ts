/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { commands } from "vscode";
import { BI_COMMANDS, DIRECTORY_SUB_TYPE, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { BallerinaExtension } from "../../core";
import { openView } from "../../stateMachine";
import { configGenerator } from "../config-generator/configGenerator";
import { StateMachine } from "../../stateMachine";
import { BIDiagramRpcManager } from "../../rpc-managers/bi-diagram/rpc-manager";

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
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TypeDiagram });
    });

    commands.registerCommand(BI_COMMANDS.ADD_FUNCTION, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BIFunctionForm });
    });

    commands.registerCommand(BI_COMMANDS.ADD_CONFIGURATION, () => {
        // Trigger to open the configuration setup view
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.ViewConfigVariables });
    });

    commands.registerCommand(BI_COMMANDS.SHOW_OVERVIEW, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
    });

    commands.registerCommand(BI_COMMANDS.ADD_PROJECT, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BIComponentView });
    });

    commands.registerCommand(BI_COMMANDS.DELETE_COMPONENT, async (item: any) => {
        console.log(">>> delete component", item);
        if (item.contextValue === DIRECTORY_SUB_TYPE.CONNECTION) {
            const rpcClient = new BIDiagramRpcManager();
            rpcClient.getModuleNodes().then((response) => {
                console.log(">>> moduleNodes", { moduleNodes: response });
                const connector = response?.flowModel?.connections.find(
                    (node) => node.properties.variable.value === item.label.trim()
                );
                if (connector) {
                    rpcClient
                        .deleteFlowNode({
                            filePath: item.info,
                            flowNode: connector,
                        })
                        .then((response) => {
                            console.log(">>> Updated source code after delete", response);
                            if (!response.textEdits) {
                                console.error(">>> Error updating source code", response);
                            }
                        });
                } else {
                    console.error(">>> Error finding connector", { connectionName: item.label });
                }
            });
        }
        // TODO: add support for other constructs
    });
}
