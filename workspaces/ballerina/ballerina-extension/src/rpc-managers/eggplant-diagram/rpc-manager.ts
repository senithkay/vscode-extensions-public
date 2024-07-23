/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    CreateComponentRequest,
    CreateComponentResponse,
    CreateProjectRequest,
    DIRECTORY_MAP,
    EggplantDiagramAPI,
    EggplantModelRequest,
    EggplantModelResponse,
    Flow,
    Node,
    ProjectComponentsResponse,
    ProjectStructureArtifactResponse,
    ProjectStructureResponse,
    STModification,
    SyntaxTree,
    UpdateNodeRequest,
    UpdateNodeResponse,
    WorkspaceFolder,
    WorkspacesResponse,
} from "@wso2-enterprise/ballerina-core";
import { readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { Uri, workspace } from "vscode";
import { StateMachine } from "../../stateMachine";
import { createEggplantProjectPure, createEggplantService } from "../../utils/eggplant";

export class EggplantDiagramRpcManager implements EggplantDiagramAPI {
    async getEggplantModel(): Promise<EggplantModelResponse> {
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.position) {
                // demo hack
                //@ts-ignore
                return new Promise((resolve) => {
                    //@ts-ignore
                    resolve(undefined);
                });
            }
            const params: EggplantModelRequest = {
                filePath: Uri.parse(context.documentUri!).fsPath,
                startLine: {
                    line: context.position.startLine ?? 0,
                    offset: context.position.startColumn ?? 0
                },
                endLine: {
                    line: context.position.endLine ?? 0,
                    offset: context.position.endColumn ?? 0
                }

            };


            StateMachine.langClient().getEggplantModel(params).then((model) => {
                console.log("===BackEndModel", model);
                resolve(model);
            }).catch((error) => {
                // demo hack
                //@ts-ignore
                return new Promise((resolve) => {
                    //@ts-ignore
                    resolve(undefined);
                });
            });
        });
    }

    async updateEggplantModel(params: Flow): Promise<void> {
        return new Promise(async (resolve) => {
            //     const context = StateMachine.context();
            //     const code: CodeGeneartionData = workerCodeGen(params);
            //     const modificationList: STModification[] = [];

            //     const modification: STModification = {
            //         startLine: params.bodyCodeLocation?.start.line,
            //         startColumn: params.bodyCodeLocation?.start.offset,
            //         endLine: params.bodyCodeLocation?.end.line,
            //         endColumn: params.bodyCodeLocation?.end.offset,
            //         type: "INSERT",
            //         isImport: false,
            //         config: {
            //             "STATEMENT": code.workerBlocks
            //         }
            //     };

            //     modificationList.push(modification);

            //     if (code.transformFunctions && code.transformFunctions.length > 0) {
            //         code.transformFunctions.forEach((transformFunction) => {

            //             const modification: STModification = {
            //                 startLine: transformFunction.location ? transformFunction.location.start.line : params.fileSourceRange?.end.line,
            //                 startColumn: transformFunction.location ? transformFunction.location.start.offset : params.fileSourceRange?.end.offset,
            //                 endLine: transformFunction.location ? transformFunction.location.end.line : params.fileSourceRange?.end.line,
            //                 endColumn: transformFunction.location ? transformFunction.location.end.offset : params.fileSourceRange?.end.offset,
            //                 type: "INSERT",
            //                 isImport: false,
            //                 config: {
            //                     "STATEMENT": transformFunction.code
            //                 }
            //             };

            //             modificationList.push(modification);
            //         });

            //         // TODO: Remove this logic once verified with the LS team
            //         // const { parseSuccess, source, syntaxTree: newST } = await langClient.stModify({
            //         //     documentIdentifier: { uri: Uri.file(params.fileName).toString() },
            //         //     astModifications: [modification]
            //         // });

            //         // if (parseSuccess) {
            //         //     writeFileSync(params.fileName, source);
            //         //     await langClient.didChange({
            //         //         textDocument: { uri: Uri.file(params.fileName).toString(), version: 1 },
            //         //         contentChanges: [
            //         //             {
            //         //                 text: source
            //         //             }
            //         //         ],
            //         //     });
            //         // }
            //     }

            //     // TODO: Remove this logic once verified with the LS team
            //     // const modification: STModification = {
            //     //     startLine: params.bodyCodeLocation?.start.line,
            //     //     startColumn: params.bodyCodeLocation?.start.offset,
            //     //     endLine: params.bodyCodeLocation?.end.line,
            //     //     endColumn: params.bodyCodeLocation?.end.offset,
            //     //     type: "INSERT",
            //     //     isImport: false,
            //     //     config: {
            //     //         "STATEMENT": code.workerBlocks
            //     //     }
            //     // };

            //     // modificationList.push(modification);

            //     const { parseSuccess, source, syntaxTree: newST } = await StateMachine.langClient().stModify({
            //         documentIdentifier: { uri: Uri.file(params.fileName).toString() },
            //         astModifications: modificationList
            //     });

            //     if (parseSuccess) {
            //         writeFileSync(params.fileName, source);
            //         await StateMachine.langClient().didChange({
            //             textDocument: { uri: Uri.file(params.fileName).toString(), version: 1 },
            //             contentChanges: [
            //                 {
            //                     text: source
            //                 }
            //             ],
            //         });


            //         const st = newST as ModulePart;
            //         outerLoop: for (const member of st.members) {
            //             if (STKindChecker.isServiceDeclaration(member)) {
            //                 const service = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
            //                 for (const resource of member.members) {
            //                     if (STKindChecker.isResourceAccessorDefinition(resource)) {
            //                         let resourcePath = "";
            //                         resource.relativeResourcePath?.forEach((res: any) => {
            //                             resourcePath += res.source ? res.source : res.value;
            //                         })
            //                         const identifier = service + `/${resource.functionName.value}/${resourcePath}`;
            //                         if (identifier === context.identifier) {
            //                             openView("OPEN_VIEW", { position: resource.position });
            //                             break outerLoop;  // Break out of the inner loop
            //                         }
            //                     }
            //                 }
            //             } else if (STKindChecker.isFunctionDefinition(member)) {
            //                 const identifier = member.functionName.value;
            //                 if (identifier === context.identifier) {
            //                     openView("OPEN_VIEW", { position: member.position });
            //                     break outerLoop;
            //                 }
            //             }
            //         }
            //     }
            //     resolve();
        });
    }

    async updateNode(params: UpdateNodeRequest): Promise<void> {
        const node: Node = params.diagramNode;

        const newNode: Node = { ...node };
        delete newNode?.viewState;

        const updatedNodeRequest = {
            diagramNode: newNode
        };
        const response: UpdateNodeResponse = await StateMachine.langClient().getUpdatedNodeModifications(updatedNodeRequest);

        if (response.textEdits && response.textEdits.length > 0) {
            const modificationList: STModification[] = [];

            for (const edit of response.textEdits) {
                const stModification: STModification = {
                    startLine: edit.range.start.line,
                    startColumn: edit.range.start.character,
                    endLine: edit.range.end.line,
                    endColumn: edit.range.end.character,
                    type: "INSERT",
                    isImport: false,
                    config: {
                        "STATEMENT": edit.newText
                    }
                };

                modificationList.push(stModification);
            }

            const context = StateMachine.context();
            const fileUri = Uri.parse(context.documentUri!);

            const { parseSuccess, source, syntaxTree: newST } =
                await StateMachine.langClient().stModify({
                    documentIdentifier: { uri: fileUri.toString() },
                    astModifications: modificationList
                }) as SyntaxTree;

            if (parseSuccess) {
                writeFileSync(fileUri.fsPath, source);
                await StateMachine.langClient().didChange({
                    textDocument: { uri: fileUri.toString(), version: 1 },
                    contentChanges: [
                        {
                            text: source
                        }
                    ],
                });
            }
        }
    }

    async createProject(params: CreateProjectRequest): Promise<void> {
        createEggplantProjectPure(params.projectName);
    }

    async getWorkspaces(): Promise<WorkspacesResponse> {
        return new Promise(async (resolve) => {
            const workspaces = workspace.workspaceFolders;
            const response: WorkspaceFolder[] = (workspaces ?? []).map(space => ({
                index: space.index,
                fsPath: space.uri.fsPath,
                name: space.name
            }));
            resolve({ workspaces: response });
        });
    }

    async createComponent(params: CreateComponentRequest): Promise<CreateComponentResponse> {
        return new Promise(async (resolve) => {
            switch (params.type) {
                case DIRECTORY_MAP.SERVICES:
                    createEggplantService(params);
                    break;
                default:
                    break;
            }
        });
    }

    async getProjectStructure(): Promise<ProjectStructureResponse> {
        return new Promise(async (resolve) => {
            const projectPath = StateMachine.context().projectUri;
            const res: ProjectStructureResponse = this.buildProjectStructure(projectPath);
            resolve(res);
        });
    }

    private buildProjectStructure(dir: string): ProjectStructureResponse {
        const result: ProjectStructureResponse = {
            directoryMap: {
                [DIRECTORY_MAP.SERVICES]: [],
                [DIRECTORY_MAP.TASKS]: [],
                [DIRECTORY_MAP.TRIGGERS]: [],
                [DIRECTORY_MAP.CONNECTIONS]: [],
                [DIRECTORY_MAP.SCHEMAS]: [],
                [DIRECTORY_MAP.CONFIGURATIONS]: []
            }
        };

        const projectItems = readdirSync(dir);
        for (const item of projectItems) {
            const folderPath = join(dir, item);
            const stats = statSync(folderPath);

            if (stats.isDirectory()) {
                this.traverseDirectory(folderPath, result, item as DIRECTORY_MAP);
            }
        }

        return result;
    }

    private traverseDirectory(dir: string, result: ProjectStructureResponse, folder: DIRECTORY_MAP) {
        const items = readdirSync(dir);
        for (const item of items) {
            const fullPath = join(dir, item);
            const stats = statSync(fullPath);
            if (stats.isFile()) {
                const artifact: ProjectStructureArtifactResponse = {
                    name: item.replace(".bal", ""),
                    path: fullPath,
                    context: "HTTP Service",
                    type: 'file'
                };
                result.directoryMap[folder].push(artifact);
            }
        }
    }

    async getProjectComponents(): Promise<ProjectComponentsResponse> {
        return new Promise(async (resolve) => {
            const components = await StateMachine.langClient().getBallerinaProjectComponents({
                documentIdentifiers: [{ uri: StateMachine.context().projectUri }]
            });
            resolve({ components });
        });
    }
}


