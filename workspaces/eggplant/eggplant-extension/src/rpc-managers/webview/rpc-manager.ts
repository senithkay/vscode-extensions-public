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
<<<<<<< HEAD
import { BallerinaFunctionSTRequest, BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
=======

import * as vscode from "vscode";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
>>>>>>> Update api
import {
    EggplantModel,
    LangClientInterface,
    VisualizerLocation,
    WebviewAPI,
    EggplantModelRequest
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
        // trigger eggplant.openLowCode command
        vscode.commands.executeCommand("eggplant.openLowCode");
        openView(params);
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
        const snapshot = stateService.getSnapshot();
        const context = snapshot.context;
        const langClient = context.langServer as LangClientInterface;
        if (!context.location) {
            throw new Error("Context location is undefined");
        }
        const params: EggplantModelRequest = {
            filePath: context.location.fileName,
            startLine: {
                line: context.location.position.startLine ?? 0,
                offset: context.location.position.startColumn ?? 0
            },
            endLine: {
                line: context.location.position.endLine ?? 0,
                offset: context.location.position.endColumn ?? 0
            }

        }
        return langClient.getEggplantModel(params).then((model) => {
            return model.workerDesignModel;
        }).catch((error) => {
            throw new Error(error);
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
