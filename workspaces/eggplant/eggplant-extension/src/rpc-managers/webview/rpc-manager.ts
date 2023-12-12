/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import { BallerinaFunctionSTRequest, BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import {
    EggplantModel,
    LangClientInterface,
    VisualizerLocation,
    WebviewAPI
} from "@wso2-enterprise/eggplant-core";
import { ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { Uri, commands, workspace } from "vscode";
import { getState, openView, stateService } from "../../stateMachine";
import { getSyntaxTreeFromPosition, handleVisualizerView } from "../../utils/navigation";

export class WebviewRpcManager implements WebviewAPI {

    async getVisualizerState(): Promise<VisualizerLocation> {
        const snapshot = stateService.getSnapshot();
        return new Promise((resolve) => {
            resolve(snapshot.context);
        });
    }

    openVisualizerView(params: VisualizerLocation): void {
        if (params.location) {
            handleVisualizerView(params.location);
        } else {
            openView(params);
        }
    }

    async getBallerinaProjectComponents(): Promise<BallerinaProjectComponents> {
        const snapshot = stateService.getSnapshot();
        // Check if there is at least one workspace folder
        if (workspace.workspaceFolders?.length) {
            const workspaceUri: { uri: string }[] = [];
            workspace.workspaceFolders.forEach(folder => {
                workspaceUri.push(
                    {
                        uri: folder.uri.toString(),
                    }
                );
            });
            const context = snapshot.context;
            const langClient = context.langServer as LangClientInterface;
            return langClient.getBallerinaProjectComponents({
                documentIdentifiers: workspaceUri
            });
        } else {
            // Handle the case where there are no workspace folders
            throw new Error("No workspace folders are open");
        }
    }

    async getEggplantModel(): Promise<EggplantModel> {
        return new Promise((resolve) => {
            let model: EggplantModel = {
                id: "1",
                name: "flow1",
                fileName: "path",
                nodes: [
                    {
                        name: "A",
                        templateId: "TRANSFORMER",
                        codeLocation: {
                            start: {
                                line: 4,
                                offset: 4,
                            },
                            end: {
                                line: 8,
                                offset: 5,
                            },
                        },
                        canvasPosition: {
                            x: 0,
                            y: 0,
                        },
                        inputPorts: [],
                        outputPorts: [
                            {
                                id: "ao1",
                                type: "INT",
                                receiver: "B",
                            },
                        ],
                    },
                    {
                        name: "B",
                        templateId: "TRANSFORMER",
                        codeLocation: {
                            start: {
                                line: 10,
                                offset: 4,
                            },
                            end: {
                                line: 16,
                                offset: 5,
                            },
                        },
                        canvasPosition: {
                            x: 100,
                            y: 0,
                        },
                        inputPorts: [
                            {
                                id: "bi1",
                                type: "INT",
                                name: "x1",
                                sender: "A",
                            },
                        ],
                        outputPorts: [],
                    },
                ],
            };
            resolve(model);
        });
    }

    async getState(): Promise<string> {
        const snapshot = stateService.getSnapshot();
        return new Promise((resolve) => {
            resolve(getState());
        });
    }

    executeCommand(params: string): void {
        commands.executeCommand(params);
    }

    async getSTNodeFromLocation(params: VisualizerLocation): Promise<STNode> {
        const location = params.location;
        const req: BallerinaFunctionSTRequest = {
            documentIdentifier: { uri: Uri.file(location!.fileName).toString() },
            lineRange: {
                start: {
                    line: location?.position.startLine as number,
                    character: location?.position.startColumn as number
                },
                end: {
                    line: location?.position.endLine as number,
                    character: location?.position.endColumn as number
                }
            }
        };
        const node = await getSyntaxTreeFromPosition(req);
        return new Promise((resolve) => {
            if (node.parseSuccess) {
                resolve(node.syntaxTree);
            }
        });
    }

}
