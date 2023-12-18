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
    EggplantModelRequest,
    Flow,
    LangClientInterface,
    MachineStateValue,
    VisualizerLocation,
    WebviewAPI
} from "@wso2-enterprise/eggplant-core";
import { STNode } from "@wso2-enterprise/syntax-tree";
import * as vscode from "vscode";
import { Uri, commands, workspace } from "vscode";
import { workerCodeGen } from "../../LowCode/codeGenerator";
import { getState, openView, stateService } from "../../stateMachine";
import { getSyntaxTreeFromPosition } from "../../utils/navigation";

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

    async getEggplantModel(): Promise<Flow> {
        const snapshot = stateService.getSnapshot();
        const context = snapshot.context;
        const langClient = context.langServer as LangClientInterface;
        if (!context.location) {
            // demo hack
            //@ts-ignore
            return new Promise((resolve) => {
                //@ts-ignore
                resolve(undefined);
            });
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
            //@ts-ignore
            return model.workerDesignModel;
        }).catch((error) => {
            // demo hack
            //@ts-ignore
            return new Promise((resolve) => {
                //@ts-ignore
                resolve(undefined);
            });
        });
    }

    async getState(): Promise<MachineStateValue> {
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

    async updateSource(params: Flow): Promise<void> {
        const snapshot = stateService.getSnapshot();
        const context = snapshot.context;
        const code = workerCodeGen(params);
        const edit = new vscode.WorkspaceEdit();

        const newLinesInCode = (code.match(/\n/g) || []).length;
        const newEndLine = (context.location?.position.startLine ?? 0) + newLinesInCode;

        const newRange = new vscode.Range(
            new vscode.Position(context.location?.position.startLine ?? 0, context.location?.position.startColumn ?? 0),
            new vscode.Position(newEndLine, context.location?.position.endColumn ?? 0)
        );
        edit.replace(vscode.Uri.parse(params.fileName), newRange, code);

        vscode.workspace.applyEdit(edit).then((data) => {
            openView({
                location: {
                    fileName: params.fileName,
                    position: {
                        startLine: context.location?.position.startLine ?? 0,
                        startColumn: context.location?.position.startColumn ?? 0,
                        endLine: newEndLine,
                        endColumn: context.location?.position.endColumn ?? 0
                    }
                }
            });
        });
    }
}
