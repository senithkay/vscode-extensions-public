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
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantConnectorsRequest,
    EggplantConnectorsResponse,
    EggplantDiagramAPI,
    EggplantFlowModelRequest,
    EggplantFlowModelResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
    ProjectComponentsResponse,
    ProjectStructureResponse,
    STModification,
    SyntaxTree,
    TextEdit,
    WorkspaceFolder,
    WorkspacesResponse,
    buildProjectStructure,
} from "@wso2-enterprise/ballerina-core";
import { writeFileSync } from "fs";
import { Uri, workspace } from "vscode";
import { StateMachine, updateView } from "../../stateMachine";
import { createEggplantProjectPure, createEggplantService } from "../../utils/eggplant";

export class EggplantDiagramRpcManager implements EggplantDiagramAPI {
    async getFlowModel(): Promise<EggplantFlowModelResponse> {
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.position) {
                console.log(">>> position not found in the context");
                return new Promise((resolve) => {
                    resolve(undefined);
                });
            }

            const params: EggplantFlowModelRequest = {
                filePath: Uri.parse(context.documentUri!).fsPath,
                startLine: {
                    line: context.position.startLine ?? 0,
                    offset: context.position.startColumn ?? 0,
                },
                endLine: {
                    line: context.position.endLine ?? 0,
                    offset: context.position.endColumn ?? 0,
                },
            };

            StateMachine.langClient()
                .getFlowModel(params)
                .then((model) => {
                    console.log(">>> eggplant flow model from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching eggplant flow model from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getSourceCode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        console.log(">>> requesting eggplant source code from ls", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getSourceCode(params)
                .then((model) => {
                    console.log(">>> eggplant source code from ls", model);
                    this.updateSource(model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching source code from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async updateSource(params: EggplantSourceCodeResponse): Promise<void> {
        let fileUri: Uri;
        let edits: TextEdit[];

        // HACK: get the first key and value from the object
        // TODO: need to update below logic to support multiple files
        for (const [key, value] of Object.entries(params.textEdits)) {
            fileUri = Uri.parse(key);
            edits = value;
            break;
        }
        console.log(">>> source code gathered data", {
            filePath: fileUri.toString(),
            fileUri,
            edits,
        });

        if (edits && edits.length > 0) {
            const modificationList: STModification[] = [];

            for (const edit of edits) {
                const stModification: STModification = {
                    startLine: edit.range.start.line,
                    startColumn: edit.range.start.character,
                    endLine: edit.range.end.line,
                    endColumn: edit.range.end.character,
                    type: "INSERT",
                    isImport: false,
                    config: {
                        STATEMENT: edit.newText,
                    },
                };
                modificationList.push(stModification);
            }

            console.log(">>> eggplant saving source", {
                documentIdentifier: { uri: fileUri.toString() },
                astModifications: modificationList,
            });

            const { parseSuccess, source } = (await StateMachine.langClient().stModify({
                documentIdentifier: { uri: fileUri.toString() },
                astModifications: modificationList,
            })) as SyntaxTree;

            if (parseSuccess) {
                writeFileSync(fileUri.fsPath, source);
                await StateMachine.langClient().didChange({
                    textDocument: { uri: fileUri.toString(), version: 1 },
                    contentChanges: [
                        {
                            text: source,
                        },
                    ],
                });

                //TODO: notify to diagram
                updateView();
            }
        }
    }

    async getAvailableNodes(params: EggplantAvailableNodesRequest): Promise<EggplantAvailableNodesResponse> {
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getAvailableNodes(params)
                .then((model) => {
                    console.log(">>> eggplant available nodes from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching available nodes from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getNodeTemplate(params: EggplantNodeTemplateRequest): Promise<EggplantNodeTemplateResponse> {
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getNodeTemplate(params)
                .then((model) => {
                    console.log(">>> eggplant node template from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching node template from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async createProject(params: CreateProjectRequest): Promise<void> {
        createEggplantProjectPure(params.projectName, params.projectPath);
    }

    async getWorkspaces(): Promise<WorkspacesResponse> {
        return new Promise(async (resolve) => {
            const workspaces = workspace.workspaceFolders;
            const response: WorkspaceFolder[] = (workspaces ?? []).map((space) => ({
                index: space.index,
                fsPath: space.uri.fsPath,
                name: space.name,
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
            const res: ProjectStructureResponse = await buildProjectStructure(
                projectPath,
                StateMachine.context().langClient
            );
            resolve(res);
        });
    }

    async getProjectComponents(): Promise<ProjectComponentsResponse> {
        return new Promise(async (resolve) => {
            const components = await StateMachine.langClient().getBallerinaProjectComponents({
                documentIdentifiers: [{ uri: Uri.file(StateMachine.context().projectUri).toString() }],
            });
            resolve({ components });
        });
    }

    async getEggplantConnectors(params: EggplantConnectorsRequest): Promise<EggplantConnectorsResponse> {
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getEggplantConnectors(params)
                .then((model) => {
                    console.log(">>> eggplant connectors from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching connectors from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }
}
