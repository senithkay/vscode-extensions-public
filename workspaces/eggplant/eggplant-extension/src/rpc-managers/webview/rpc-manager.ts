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
import { BallerinaFunctionSTRequest, BallerinaProjectComponents, STModification } from "@wso2-enterprise/ballerina-core";

import {
    EggplantModelRequest,
    Flow,
    LangClientInterface,
    MachineEvent,
    MachineStateValue,
    VisualizerLocation,
    CommandProps,
    WebviewAPI,
    workerCodeGen,
    CodeGeneartionData
} from "@wso2-enterprise/eggplant-core";
import { ModulePart, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { writeFileSync } from "fs";
import * as vscode from "vscode";
import { Uri, commands, workspace } from "vscode";
import { StateMachine, openView } from "../../stateMachine";
import { getSyntaxTreeFromPosition } from "../../utils/navigation";
import { createEggplantProject, openEggplantProject } from "../../utils/project";

export class WebviewRpcManager implements WebviewAPI {

    async getVisualizerState(): Promise<VisualizerLocation> {
        const context = StateMachine.context();
        return new Promise((resolve) => {
            resolve({ view: context.view, fileName: context.fileName, position: context.position });
        });
    }

    openVisualizerView(params: VisualizerLocation): void {
        // trigger eggplant.openLowCode command
        vscode.commands.executeCommand("eggplant.openLowCode");

        openView(params);
    }

    async getBallerinaProjectComponents(): Promise<BallerinaProjectComponents> {
        const context = StateMachine.context();
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
        const context = StateMachine.context();
        const langClient = context.langServer as LangClientInterface;
        if (!context.position) {
            // demo hack
            //@ts-ignore
            return new Promise((resolve) => {
                //@ts-ignore
                resolve(undefined);
            });
        }
        const params: EggplantModelRequest = {
            filePath: context.fileName!,
            startLine: {
                line: context.position.startLine ?? 0,
                offset: context.position.startColumn ?? 0
            },
            endLine: {
                line: context.position.endLine ?? 0,
                offset: context.position.endColumn ?? 0
            }

        }

        console.log("===ParamsForBackend", params);
        return langClient.getEggplantModel(params).then((model) => {
            console.log("===BackEndModel", model);
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
        return new Promise((resolve) => {
            resolve(StateMachine.state());
        });
    }

    executeCommand(params: CommandProps): void {
        switch (params.command) {
            case "OPEN_LOW_CODE":
                commands.executeCommand("eggplant.openLowCode");
                break;
            case "OPEN_PROJECT":
                openEggplantProject();
                break;
            case "CREATE_PROJECT":
                createEggplantProject(params.projectName!, params.isService!);
                break;
            default:
                break;
        }
    }

    async getSTNodeFromLocation(location: VisualizerLocation): Promise<STNode> {

        const req: BallerinaFunctionSTRequest = {
            documentIdentifier: { uri: Uri.file(location.fileName!).toString() },
            lineRange: {
                start: {
                    line: location.position!.startLine as number,
                    character: location.position!.startColumn as number
                },
                end: {
                    line: location.position!.endLine as number,
                    character: location.position!.endColumn as number
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

    async updateSource(flowModel: Flow): Promise<void> {
        const context = StateMachine.context();
        const code: CodeGeneartionData = workerCodeGen(flowModel);
        console.log("===code", code);
        console.log("===flowModel file Position", flowModel.fileSourceRange);
        console.log("===flowModel bodyCodeLocation", flowModel.bodyCodeLocation);

        const langClient = context.langServer as LangClientInterface;

        const modificationList: STModification[] = [];

        const modification: STModification = {
            startLine: flowModel.bodyCodeLocation?.start.line,
            startColumn: flowModel.bodyCodeLocation?.start.offset,
            endLine: flowModel.bodyCodeLocation?.end.line,
            endColumn: flowModel.bodyCodeLocation?.end.offset,
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": code.workerBlocks
            }
        };

        modificationList.push(modification);

        // If the transformFunction is found inject it first to the end of the file
        if (code.transformFunction) {
            const modification: STModification = {
                startLine: flowModel.fileSourceRange?.end.line,
                startColumn: flowModel.fileSourceRange?.end.offset,
                endLine: flowModel.fileSourceRange?.end.line,
                endColumn: flowModel.fileSourceRange?.end.offset,
                type: "INSERT",
                isImport: false,
                config: {
                    "STATEMENT": code.transformFunction
                }
            };

            modificationList.push(modification);

            // TODO: Remove this logic once verified with the LS team
            // const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
            //     documentIdentifier: { uri: Uri.file(flowModel.fileName).toString() },
            //     astModifications: [modification]
            // });

            // if (parseSuccess) {
            //     writeFileSync(flowModel.fileName, source);
            //     await langClient.didChange({
            //         textDocument: { uri: Uri.file(flowModel.fileName).toString(), version: 1 },
            //         contentChanges: [
            //             {
            //                 text: source
            //             }
            //         ],
            //     });
            // }
        }

        // TODO: Remove this logic once verified with the LS team
        // const modification: STModification = {
        //     startLine: flowModel.bodyCodeLocation?.start.line,
        //     startColumn: flowModel.bodyCodeLocation?.start.offset,
        //     endLine: flowModel.bodyCodeLocation?.end.line,
        //     endColumn: flowModel.bodyCodeLocation?.end.offset,
        //     type: "INSERT",
        //     isImport: false,
        //     config: {
        //         "STATEMENT": code.workerBlocks
        //     }
        // };

        // modificationList.push(modification);
        console.log("===modificationList", modificationList);

        const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
            documentIdentifier: { uri: Uri.file(flowModel.fileName).toString() },
            astModifications: modificationList
        });

        console.log("===parseSuccess", parseSuccess);
        if (parseSuccess) {
            writeFileSync(flowModel.fileName, source);
            await langClient.didChange({
                textDocument: { uri: Uri.file(flowModel.fileName).toString(), version: 1 },
                contentChanges: [
                    {
                        text: source
                    }
                ],
            });


            const st = newST as ModulePart;
            outerLoop: for (const member of st.members) {
                if (STKindChecker.isServiceDeclaration(member)) {
                    const service = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                    for (const resource of member.members) {
                        if (STKindChecker.isResourceAccessorDefinition(resource)) {
                            const fnName = resource.functionName.value;
                            const identifier = service + "/" + fnName;
                            if (identifier === context.identifier) {
                                openView({ position: resource.position });
                                break outerLoop;  // Break out of the inner loop
                            }
                        }
                    }
                }
            }
        }
    }

    async sendMachineEvent(params: MachineEvent): Promise<void> {
        if (params.type === "GET_STARTED") {
            // trigger eggplant.openLowCode command
            vscode.commands.executeCommand("eggplant.openLowCode");
        }
        StateMachine.sendEvent(params.type);
    }
}
