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
    ComponentsRequest,
    ComponentsResponse,
    CreateComponentRequest,
    CreateComponentResponse,
    DIRECTORY_MAP,
    EggplantAiSuggestionsRequest,
    EggplantAiSuggestionsResponse,
    EggplantAvailableNodesRequest,
    EggplantAvailableNodesResponse,
    EggplantConnectorsRequest,
    EggplantConnectorsResponse,
    EggplantCopilotContextRequest,
    EggplantDiagramAPI,
    EggplantFlowModelRequest,
    EggplantFlowModelResponse,
    EggplantNodeTemplateRequest,
    EggplantNodeTemplateResponse,
    EggplantSourceCodeRequest,
    EggplantSourceCodeResponse,
    EggplantSuggestedFlowModelRequest,
    OverviewFlow,
    ProjectComponentsResponse,
    ProjectRequest,
    ProjectStructureResponse,
    ReadmeContentRequest,
    ReadmeContentResponse,
    STModification,
    SyntaxTree,
    WorkspaceFolder,
    WorkspacesResponse,
    buildProjectStructure
} from "@wso2-enterprise/ballerina-core";
import * as fs from "fs";
import { writeFileSync } from "fs";
import * as path from 'path';
import { Uri, workspace } from "vscode";
import { ballerinaExtInstance } from "../../core";
import { StateMachine, updateView } from "../../stateMachine";
import { README_FILE, createEggplantProjectPure, createEggplantService, handleServiceCreation, sanitizeName } from "../../utils/eggplant";

export class EggplantDiagramRpcManager implements EggplantDiagramAPI {
    async getFlowModel(): Promise<EggplantFlowModelResponse> {
        console.log(">>> requesting eggplant flow model from ls");
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
        const modificationRequests: Record<string, { filePath: string; modifications: STModification[] }> = {};

        for (const [key, value] of Object.entries(params.textEdits)) {
            const fileUri = Uri.parse(key);
            const fileUriString = fileUri.toString();
            const edits = value;

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

                if (modificationRequests[fileUriString]) {
                    modificationRequests[fileUriString].modifications.push(...modificationList);
                } else {
                    modificationRequests[fileUriString] = { filePath: fileUri.fsPath, modifications: modificationList };
                }
            }
        }

        // Iterate through modificationRequests and apply modifications
        for (const [fileUriString, request] of Object.entries(modificationRequests)) {
            const { parseSuccess, source } = (await StateMachine.langClient().stModify({
                documentIdentifier: { uri: fileUriString },
                astModifications: request.modifications,
            })) as SyntaxTree;

            if (parseSuccess) {
                writeFileSync(request.filePath, source);
                await StateMachine.langClient().didChange({
                    textDocument: { uri: fileUriString, version: 1 },
                    contentChanges: [
                        {
                            text: source,
                        },
                    ],
                });
            }
        }
        updateView();
    }

    async getAvailableNodes(params: EggplantAvailableNodesRequest): Promise<EggplantAvailableNodesResponse> {
        console.log(">>> requesting eggplant available nodes from ls", params);
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
        console.log(">>> requesting eggplant node template from ls", params);
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

    async createProject(params: ProjectRequest): Promise<void> {
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

    async getAiSuggestions(params: EggplantAiSuggestionsRequest): Promise<EggplantAiSuggestionsResponse> {
        return new Promise(async (resolve) => {
            const { filePath, position, isOverview } = params;
            if (isOverview) {
                const readmeContent = fs.readFileSync(path.join(StateMachine.context().projectUri, README_FILE), 'utf8');
                console.log(">>> readme content", readmeContent);
                const payload = {
                    projectDescription: readmeContent
                };
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                };
                console.log(">>> request ai suggestion", { request: payload });
                const response = await fetch(
                    "https://e95488c8-8511-4882-967f-ec3ae2a0f86f-dev.e1-us-east-azure.choreoapis.dev/ballerina-copilot/architecture-api/v1.0/generate",
                    requestOptions
                );
                const data = await response.json();
                console.log(">>> ai suggestion", { response: data });
                resolve({ flowModel: null, suggestion: null, overviewFlow: data as OverviewFlow });
            } else {
                // check multi line AI completion setting
                const multiLineCompletion = ballerinaExtInstance.multilineAiSuggestions();
                console.log(">>> multi line AI completion setting", multiLineCompletion);

                // get copilot context form ls
                const copilotContextRequest: EggplantCopilotContextRequest = {
                    filePath: filePath,
                    position: position.startLine,
                };
                console.log(">>> request get copilot context from ls", { request: copilotContextRequest });
                const copilotContext = await StateMachine.langClient().getCopilotContext(copilotContextRequest);
                console.log(">>> copilot context from ls", { response: copilotContext });

                // get suggestions from ai
                const requestBody = {
                    ...copilotContext,
                    singleCompletion: !multiLineCompletion,
                };
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                };
                console.log(">>> request ai suggestion", { request: requestBody });
                const response = await fetch(
                    "https://e95488c8-8511-4882-967f-ec3ae2a0f86f-dev.e1-us-east-azure.choreoapis.dev/ballerina-copilot/completion-api/v1.0/completion",
                    requestOptions
                );
                const data = await response.json();
                console.log(">>> ai suggestion", { response: data });
                const suggestedContent = (data as any).completions.at(0);
                if (!suggestedContent) {
                    console.log(">>> ai suggested content not found");
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                }

                // get flow model from ls
                const context = StateMachine.context();
                if (!context.position) {
                    console.log(">>> position not found in the context");
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                }

                const request: EggplantSuggestedFlowModelRequest = {
                    filePath: Uri.parse(context.documentUri!).fsPath,
                    startLine: {
                        line: context.position.startLine ?? 0,
                        offset: context.position.startColumn ?? 0,
                    },
                    endLine: {
                        line: context.position.endLine ?? 0,
                        offset: context.position.endColumn ?? 0,
                    },
                    text: suggestedContent,
                    position: position.startLine,
                };
                console.log(">>> request eggplant suggested flow model", request);

                StateMachine.langClient()
                    .getSuggestedFlowModel(request)
                    .then((model) => {
                        console.log(">>> eggplant suggested flow model from ls", model);
                        resolve({ flowModel: model.flowModel, suggestion: suggestedContent });
                    })
                    .catch((error) => {
                        console.log(">>> error fetching eggplant suggested flow model from ls", error);
                        return new Promise((resolve) => {
                            resolve(undefined);
                        });
                    });
            }
        });
    }

    async deleteFlowNode(params: EggplantSourceCodeRequest): Promise<EggplantSourceCodeResponse> {
        console.log(">>> requesting eggplant delete node from ls", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .deleteFlowNode(params)
                .then((model) => {
                    console.log(">>> eggplant delete node from ls", model);
                    this.updateSource(model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching delete node from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async handleReadmeContent(params: ReadmeContentRequest): Promise<ReadmeContentResponse> {
        // console.log(">>> Savineadme.md", params);
        return new Promise((resolve) => {
            const projectUri = StateMachine.context().projectUri;
            const readmePath = path.join(projectUri, README_FILE);
            if (params.read) {
                if (!fs.existsSync(readmePath)) {
                    resolve({ content: "" });
                } else {
                    const content = fs.readFileSync(readmePath, 'utf8');
                    console.log(">>> Read content:", content);
                    resolve({ content });
                }
            } else {
                if (!fs.existsSync(readmePath)) {
                    fs.writeFileSync(readmePath, params.content);
                    console.log(">>> Created and saved readme.md with content:", params.content);
                } else {
                    fs.writeFileSync(readmePath, params.content);
                    console.log(">>> Updated readme.md with content:", params.content);
                }
            }
        });
    }

    async createComponents(params: ComponentsRequest): Promise<ComponentsResponse> {
        return new Promise(async (resolve) => {
            try {
                // Create the entry point services
                params.overviewFlow.entryPoints.forEach(async entry => {
                    if (entry.status === "insert") {
                        switch (entry.type) {
                            case "service":
                                const req: CreateComponentRequest = {
                                    name: sanitizeName(entry.name),
                                    path: "/",
                                    port: "9090",
                                    type: DIRECTORY_MAP.SERVICES
                                };
                                await handleServiceCreation(req);
                                break;
                            default:
                                break;
                        }
                    }
                });
                // Create the connections
                const importStatements: string[] = [];
                const connectionLines: string[] = [];
                const uniqueImports = new Set<string>(); // Track unique import statements
                params.overviewFlow.connections.forEach(async connection => {
                    if (connection.status === "insert") {
                        // Create import statement
                        const importStatement = `import ${connection.org}/${connection.package};`;
                        if (!uniqueImports.has(importStatement)) {
                            uniqueImports.add(importStatement); // Add to set if not already present
                            importStatements.push(importStatement); // Add to array
                        }
                        // Create connection line
                        const connectionLine = `${connection.package}:${connection.client} ${sanitizeName(connection.name)} = check new ({});`;
                        connectionLines.push(connectionLine);
                    }
                });

                // Log or return the generated import statements and connection lines
                console.log("Import Statements:", importStatements);
                console.log("Connection Lines:", connectionLines);

                const connectionsBalPath = path.join(StateMachine.context().projectUri, 'connections.bal');
                // Write the generated import statements to connections.bal
                fs.writeFileSync(connectionsBalPath, importStatements.join('\n'));
                // Append the generated connection lines to connections.bal
                fs.appendFileSync(connectionsBalPath, `\n\n${connectionLines.join('\n')}`);
                console.log('Generated import statements and connection lines written to connections.bal');
                await new Promise(resolve => setTimeout(resolve, 3000));
                resolve({ response: true });
            } catch (error) {
                resolve({ response: false });
            }
        });
    }
}
