/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { commands } from "vscode";
import {
    BI_COMMANDS,
    BIDeleteByComponentInfoRequest,
    ComponentInfo,
    DIRECTORY_SUB_TYPE,
    EVENT_TYPE,
    FlowNode,
    MACHINE_VIEW
} from "@wso2-enterprise/ballerina-core";
import { BallerinaExtension } from "../../core";
import { openView } from "../../stateMachine";
import { prepareAndGenerateConfig } from "../config-generator/configGenerator";
import { StateMachine } from "../../stateMachine";
import { BiDiagramRpcManager } from "../../rpc-managers/bi-diagram/rpc-manager";
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { isPositionEqual } from "../../utils/history/util";

export function activate(context: BallerinaExtension) {
    commands.registerCommand(BI_COMMANDS.BI_RUN_PROJECT, () => {
        prepareAndGenerateConfig(context, StateMachine.context().projectUri, false, true);
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

    commands.registerCommand(BI_COMMANDS.ADD_DATA_MAPPER, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.BIDataMapperForm });
    });

    commands.registerCommand(BI_COMMANDS.SWITCH_PROJECT, async () => {
        // Hack to switch the project. This will reload the window and prompt the user to select the project.
        // This is a temporary solution until we provide the support for multi root workspaces.
        commands.executeCommand('workbench.action.reloadWindow');
    });

    commands.registerCommand(BI_COMMANDS.DELETE_COMPONENT, async (item: any) => {
        console.log(">>> delete component", item);

        if (item.contextValue === DIRECTORY_SUB_TYPE.CONNECTION) {
            await handleConnectionDeletion(item.label, item.info);
        } else if (item.contextValue === DIRECTORY_SUB_TYPE.FUNCTION
            || item.contextValue === DIRECTORY_SUB_TYPE.DATA_MAPPER) {
            await handleComponentDeletion('functions', item.label, item.info);
        } else if (item.contextValue === DIRECTORY_SUB_TYPE.TYPE) {
            await handleComponentDeletion('records', item.label, item.info);
        } else if (item.contextValue === DIRECTORY_SUB_TYPE.SERVICE) {
            await handleComponentDeletion('services', item.tooltip, item.info);
        } else if (item.contextValue === DIRECTORY_SUB_TYPE.LISTENER) {
            await handleComponentDeletion('listeners', item.tooltip, item.info);
        } else if (item.contextValue === DIRECTORY_SUB_TYPE.AUTOMATION) {
            await handleComponentDeletion('automations', item.tooltip, item.info);
        } else if (item.contextValue === DIRECTORY_SUB_TYPE.CONFIGURATION) {
            await handleComponentDeletion('configurableVariables', item.label, item.info);
        }
    });

    //HACK: Open all Ballerina files in the project
    openAllBallerinaFiles(context);
}

function openAllBallerinaFiles(context: BallerinaExtension) {
    const projectRoot = StateMachine.context().projectUri;

    if (context.langClient && projectRoot) {
        try {
            // Find all Ballerina files in the project
            const ballerinaFiles = findBallerinaFiles(projectRoot);
            console.log(`>>> Found ${ballerinaFiles.length} Ballerina files in the project`);

            // Open each Ballerina file
            ballerinaFiles.forEach((filePath) => {
                try {
                    const content = readFileSync(filePath, "utf8");
                    if (content) {
                        context.langClient.didOpen({
                            textDocument: {
                                uri: filePath,
                                languageId: "ballerina",
                                version: 1,
                                text: content,
                            },
                        });
                        console.log(`>>> Opened file: ${filePath}`);
                    } else {
                        console.error(`>>> No content found for file ${filePath}`);
                    }
                } catch (error) {
                    console.error(`Error opening file ${filePath}:`, error);
                }
            });
        } catch (error) {
            console.error("Error finding Ballerina files:", error);
        }
    }
}

// Function to recursively find all Ballerina files
const findBallerinaFiles = (dir: string, fileList: string[] = []): string[] => {
    const files = readdirSync(dir);

    files.forEach((file: string) => {
        const filePath = path.join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory() && !file.startsWith(".")) {
            // Recursively search directories, skip hidden directories
            fileList = findBallerinaFiles(filePath, fileList);
        } else if (file.endsWith(".bal")) {
            // Add Ballerina files to the list
            fileList.push(filePath);
        }
    });

    return fileList;
};

const handleComponentDeletion = async (componentType: string, itemLabel: string, filePath: string) => {
    const rpcClient = new BiDiagramRpcManager();

    rpcClient.getProjectComponents().then((response) => {
        console.log("====>>> projectComponents", { projectComponents: response });
        response.components.packages.forEach((pkg) => {
            pkg.modules.forEach((module) => {
                module[componentType].forEach((component) => {
                    if (component.name === itemLabel) {
                        deleteComponent(component, rpcClient, filePath);
                    }
                });
            });
        });
    });
};

const handleConnectionDeletion = async (itemLabel: string, filePath: string) => {
    const rpcClient = new BiDiagramRpcManager();
    rpcClient.getModuleNodes().then((response) => {
        console.log(">>> moduleNodes", { moduleNodes: response });
        const connector = response?.flowModel?.connections.find(
            (node) => node.properties.variable.value === itemLabel.trim()
        );
        if (connector) {
            rpcClient
                .deleteFlowNode({
                    filePath: filePath,
                    flowNode: connector,
                })
                .then((response) => {
                    console.log(">>> Updated source code after delete", response);
                    if (response.textEdits) {
                        if (hasNoComponentsOpenInDiagram() || isFlowNodeOpenInDiagram(connector)) {
                            openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
                        }
                    } else {

                        console.error(">>> Error updating source code", response);
                    }
                });
        } else {
            console.error(">>> Error finding connector", { connectionName: itemLabel });
        }
    });
};

async function deleteComponent(component: ComponentInfo, rpcClient: BiDiagramRpcManager, filePath: string) {
    const req: BIDeleteByComponentInfoRequest = {
        filePath: filePath,
        component: component,
    };

    console.log(">>> delete component request", req);

    await rpcClient.deleteByComponentInfo(req);

    if (hasNoComponentsOpenInDiagram() || isComponentOpenInDiagram(component)) {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview });
    }
}

function isComponentOpenInDiagram(component: ComponentInfo) {
    const openedCompoentPosition = StateMachine.context().position;
    const openedComponentFilePath = StateMachine.context().documentUri;

    if (!openedCompoentPosition) {
        return false;
    }

    const componentPosition = {
        startLine: component.startLine,
        startColumn: component.startColumn,
        endLine: component.endLine,
        endColumn: component.endColumn
    };
    const componentFilePath = path.join(StateMachine.context().projectUri, component.filePath);

    return isFilePathsEqual(openedComponentFilePath, componentFilePath)
        && isPositionEqual(openedCompoentPosition, componentPosition);
}

function isFlowNodeOpenInDiagram(connector: FlowNode) {
    const openedCompoentPosition = StateMachine.context().position;
    const openedComponentFilePath = StateMachine.context().documentUri;

    if (!openedCompoentPosition) {
        return false;
    }

    const flowNodePosition = {
        startLine: connector.codedata.lineRange.startLine.line,
        startColumn: connector.codedata.lineRange.startLine.offset,
        endLine: connector.codedata.lineRange.endLine.line,
        endColumn: connector.codedata.lineRange.endLine.offset
    };
    const flowNodeFilePath = path.join(StateMachine.context().projectUri, connector.codedata.lineRange.fileName);

    return isFilePathsEqual(openedComponentFilePath, flowNodeFilePath)
        && isPositionEqual(openedCompoentPosition, flowNodePosition);
}

function hasNoComponentsOpenInDiagram() {
    return !StateMachine.context().position;
}

function isFilePathsEqual(filePath1: string, filePath2: string) {
    return path.normalize(filePath1) === path.normalize(filePath2);
}
