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
    AIChatRequest,
    BIAiSuggestionsRequest,
    BIAiSuggestionsResponse,
    BIAvailableNodesRequest,
    BIAvailableNodesResponse,
    BIConnectorsRequest,
    BIConnectorsResponse,
    BICopilotContextRequest,
    BIDiagramAPI,
    BIFlowModelRequest,
    BIFlowModelResponse,
    BIGetFunctionsRequest,
    BIGetFunctionsResponse,
    BIModuleNodesRequest,
    BIModuleNodesResponse,
    BIGetVisibleVariableTypesRequest,
    BIGetVisibleVariableTypesResponse,
    BINodeTemplateRequest,
    BINodeTemplateResponse,
    BISourceCodeRequest,
    BISourceCodeResponse,
    BISuggestedFlowModelRequest,
    ComponentsRequest,
    ComponentsResponse,
    ComponentRequest,
    CreateComponentResponse,
    DIRECTORY_MAP,
    ExpressionCompletionsRequest,
    ExpressionCompletionsResponse,
    OverviewFlow,
    ProjectComponentsResponse,
    ProjectRequest,
    ProjectStructureResponse,
    ReadmeContentRequest,
    ReadmeContentResponse,
    STModification,
    SignatureHelpRequest,
    SignatureHelpResponse,
    SyntaxTree,
    WorkspaceFolder,
    WorkspacesResponse,
    buildProjectStructure,
} from "@wso2-enterprise/ballerina-core";
import * as fs from "fs";
import { writeFileSync } from "fs";
import * as path from 'path';
import { Uri, ViewColumn, commands, window, workspace } from "vscode";
import { ballerinaExtInstance } from "../../core";
import { StateMachine, updateView } from "../../stateMachine";
import { README_FILE, createBIProjectPure, createBIService, createBIAutomation, handleServiceCreation, sanitizeName, createBIFunction } from "../../utils/bi";

export class BIDiagramRpcManager implements BIDiagramAPI {
    async getFlowModel(): Promise<BIFlowModelResponse> {
        console.log(">>> requesting bi flow model from ls");
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.position) {
                console.log(">>> position not found in the context");
                return new Promise((resolve) => {
                    resolve(undefined);
                });
            }

            const params: BIFlowModelRequest = {
                filePath: Uri.parse(context.documentUri!).fsPath,
                startLine: {
                    line: context.position.startLine ?? 0,
                    offset: context.position.startColumn ?? 0,
                },
                endLine: {
                    line: context.position.endLine ?? 0,
                    offset: context.position.endColumn ?? 0,
                },
                forceAssign: true, // TODO: remove this
            };

            StateMachine.langClient()
                .getFlowModel(params)
                .then((model) => {
                    console.log(">>> bi flow model from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching bi flow model from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getSourceCode(params: BISourceCodeRequest): Promise<BISourceCodeResponse> {
        console.log(">>> requesting bi source code from ls", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getSourceCode(params)
                .then(async (model) => {
                    console.log(">>> bi source code from ls", model);
                    if (params?.isConnector) {
                        await this.updateSource(model, true);
                        resolve(model);
                        commands.executeCommand("BI.project-explorer.refresh");
                    } else {
                        this.updateSource(model);
                        resolve(model);
                    }
                })
                .catch((error) => {
                    console.log(">>> error fetching source code from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async updateSource(params: BISourceCodeResponse, isConnector?: boolean): Promise<void> {
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

                if (isConnector) {
                    await StateMachine.langClient().resolveMissingDependencies({
                        documentIdentifier: { uri: fileUriString },
                    });
                    // Temp fix: ResolveMissingDependencies does not work uless we call didOpen, This needs to be fixed in the LS
                    await StateMachine.langClient().didOpen({
                        textDocument: { uri: fileUriString, languageId: "ballerina", version: 1, text: source },
                    });
                }
            }
        }
        if (!isConnector) {
            updateView();
        }
    }

    async getAvailableNodes(params: BIAvailableNodesRequest): Promise<BIAvailableNodesResponse> {
        console.log(">>> requesting bi available nodes from ls", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getAvailableNodes(params)
                .then((model) => {
                    console.log(">>> bi available nodes from ls", model);
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

    async getNodeTemplate(params: BINodeTemplateRequest): Promise<BINodeTemplateResponse> {
        console.log(">>> requesting bi node template from ls", params);
        params.forceAssign = true; // TODO: remove this

        return new Promise((resolve) => {
            StateMachine.langClient()
                .getNodeTemplate(params)
                .then((model) => {
                    console.log(">>> bi node template from ls", model);
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
        createBIProjectPure(params.projectName, params.projectPath);
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

    async createComponent(params: ComponentRequest): Promise<CreateComponentResponse> {
        return new Promise(async (resolve) => {
            let res: CreateComponentResponse;
            switch (params.type) {
                case DIRECTORY_MAP.SERVICES:
                    res = await createBIService(params);
                    break;
                case DIRECTORY_MAP.AUTOMATION:
                    res = await createBIAutomation(params);
                    break;
                case DIRECTORY_MAP.FUNCTIONS:
                    res = await createBIFunction(params);
                    break;
                default:
                    break;
            }
            resolve(res);
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

    async getBIConnectors(params: BIConnectorsRequest): Promise<BIConnectorsResponse> {
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getBIConnectors(params)
                .then((model) => {
                    console.log(">>> bi connectors from ls", model);
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

    async getAiSuggestions(params: BIAiSuggestionsRequest): Promise<BIAiSuggestionsResponse> {
        return new Promise(async (resolve) => {
            const { filePath, position, isOverview } = params;
            if (isOverview) {
                const readmeContent = fs.readFileSync(
                    path.join(StateMachine.context().projectUri, README_FILE),
                    "utf8"
                );
                console.log(">>> readme content", readmeContent);
                const payload = {
                    projectDescription: readmeContent,
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
                const enableAiSuggestions = ballerinaExtInstance.enableAiSuggestions();
                if (!enableAiSuggestions) {
                    resolve(undefined);
                    return;
                }

                // get copilot context form ls
                const copilotContextRequest: BICopilotContextRequest = {
                    filePath: filePath,
                    position: position.startLine,
                };
                console.log(">>> request get copilot context from ls", { request: copilotContextRequest });
                const copilotContext = await StateMachine.langClient().getCopilotContext(copilotContextRequest);
                console.log(">>> copilot context from ls", { response: copilotContext });

                // get suggestions from ai
                const requestBody = {
                    ...copilotContext,
                    singleCompletion: false, // Remove setting and assign constant value since this is handled by the AI BE
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

                const request: BISuggestedFlowModelRequest = {
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
                console.log(">>> request bi suggested flow model", request);

                StateMachine.langClient()
                    .getSuggestedFlowModel(request)
                    .then((model) => {
                        console.log(">>> bi suggested flow model from ls", model);
                        resolve({ flowModel: model.flowModel, suggestion: suggestedContent });
                    })
                    .catch((error) => {
                        console.log(">>> error fetching bi suggested flow model from ls", error);
                        return new Promise((resolve) => {
                            resolve(undefined);
                        });
                    });
            }
        });
    }

    async deleteFlowNode(params: BISourceCodeRequest): Promise<BISourceCodeResponse> {
        console.log(">>> requesting bi delete node from ls", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .deleteFlowNode(params)
                .then((model) => {
                    console.log(">>> bi delete node from ls", model);
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
                    const content = fs.readFileSync(readmePath, "utf8");
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
                params.overviewFlow.entryPoints.forEach(async (entry) => {
                    if (entry.status === "insert") {
                        switch (entry.type) {
                            case "service":
                                const req: ComponentRequest = {
                                    serviceType: {
                                        name: sanitizeName(entry.name),
                                        path: "/",
                                        port: "9090",
                                    },
                                    type: DIRECTORY_MAP.SERVICES,
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
                params.overviewFlow.connections.forEach(async (connection) => {
                    if (connection.status === "insert") {
                        // Create import statement
                        const importStatement = `import ${connection.org}/${connection.package};`;
                        if (!uniqueImports.has(importStatement)) {
                            uniqueImports.add(importStatement); // Add to set if not already present
                            importStatements.push(importStatement); // Add to array
                        }
                        // Create connection line
                        const connectionLine = `${connection.package}:${connection.client} ${sanitizeName(
                            connection.name
                        )} = check new ({});`;
                        connectionLines.push(connectionLine);
                    }
                });

                // Log or return the generated import statements and connection lines
                console.log("Import Statements:", importStatements);
                console.log("Connection Lines:", connectionLines);

                const connectionsBalPath = path.join(StateMachine.context().projectUri, "connections.bal");
                // Write the generated import statements to connections.bal
                fs.writeFileSync(connectionsBalPath, importStatements.join("\n"));
                // Append the generated connection lines to connections.bal
                fs.appendFileSync(connectionsBalPath, `\n\n${connectionLines.join("\n")}`);
                console.log("Generated import statements and connection lines written to connections.bal");
                await new Promise((resolve) => setTimeout(resolve, 3000));
                resolve({ response: true });
            } catch (error) {
                resolve({ response: false });
            }
        });
    }

    async getFunctions(params: BIGetFunctionsRequest): Promise<BIGetFunctionsResponse> {
        console.log(">>> requesting bi function list from ls", params);
        params.queryMap = params?.queryMap || {};

        return new Promise((resolve) => {
            StateMachine.langClient()
                .getFunctions(params)
                .then((model) => {
                    console.log(">>> bi function list from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching function list from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getExpressionCompletions(params: ExpressionCompletionsRequest): Promise<ExpressionCompletionsResponse> {
        return new Promise((resolve, reject) => {
            StateMachine.langClient()
                .getExpressionCompletions(params)
                .then((completions) => {
                    resolve(completions);
                })
                .catch((error) => {
                    reject("Error fetching expression completions from ls");
                });
        });
    }

    async getReadmeContent(): Promise<ReadmeContentResponse> {
        return new Promise((resolve) => {
            const workspaceFolders = workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                resolve({ content: "" });
                return;
            }

            const projectRoot = workspaceFolders[0].uri.fsPath;
            const readmePath = path.join(projectRoot, "README.md");

            if (!fs.existsSync(readmePath)) {
                resolve({ content: "" });
                return;
            }

            fs.readFile(readmePath, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading README.md:", err);
                    resolve({ content: "" });
                } else {
                    resolve({ content: data });
                }
            });
        });
    }

    openReadme(): void {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            window.showErrorMessage("No workspace folder is open.");
            return;
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;
        const readmePath = path.join(projectRoot, "README.md");

        if (!fs.existsSync(readmePath)) {
            // Create README.md if it doesn't exist
            fs.writeFileSync(readmePath, "# Project Overview\n\nAdd your project description here.");
        }

        // Open README.md in the editor
        workspace.openTextDocument(readmePath).then((doc) => {
            window.showTextDocument(doc, ViewColumn.Beside);
        });
    }

    async createChoreoComponent(name: string, type: "service" | "manualTask" | "scheduleTask"): Promise<void> {
        const params = {
            initialValues: {
                name,
                type,
                buildPackLang: "ballerina",
            },
        };

        await commands.executeCommand("wso2.choreo.create.component", params);
    }

    deployProject(): void {
        // Show a quick pick to select deployment option
        window
            .showQuickPick(
                [
                    {
                        label: "$(package) Deploy with an executable",
                        detail: "Create a standalone executable for your Ballerina Integrator project",
                    },
                    {
                        label: "$(package) Deploy with Docker",
                        detail: "Containerize your Ballerina Integrator project using Docker",
                    },
                    {
                        label: "$(cloud) Deploy on Choreo",
                        detail: "Deploy your project to Choreo cloud platform",
                        key: "deploy-on-choreo",
                    },
                ].map((item) => ({
                    ...item,
                })),
                {
                    placeHolder: "Select deployment option",
                }
            )
            .then((selection) => {
                if (!selection) {
                    return; // User cancelled the selection
                }

                switch (selection.label) {
                    case "Deploy with an executable":
                        // Logic for deploying with an executable
                        console.log("Deploying with an executable");
                        // TODO: Implement executable deployment
                        break;
                    case "Deploy with Docker":
                        // Logic for deploying with Docker
                        console.log("Deploying with Docker");
                        // TODO: Implement Docker deployment
                        break;
                    case "$(cloud) Deploy on Choreo":
                        this.createChoreoComponent("test", "service");
                        break;
                    default:
                        window.showErrorMessage("Invalid deployment option selected");
                }
            });
    }

    openAIChat(params: AIChatRequest): void {
        commands.executeCommand("ballerina.open.ai.panel");
    }

    async getModuleNodes(): Promise<BIModuleNodesResponse> {
        console.log(">>> requesting bi module nodes from ls");
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.projectUri) {
                console.log(">>> projectUri not found in the context");
                return new Promise((resolve) => {
                    resolve(undefined);
                });
            }

            const params: BIModuleNodesRequest = {
                filePath: Uri.parse(context.projectUri!).fsPath,
            };

            StateMachine.langClient()
                .getModuleNodes(params)
                .then((model) => {
                    console.log(">>> bi module nodes from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching bi module nodes from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getSignatureHelp(params: SignatureHelpRequest): Promise<SignatureHelpResponse> {
        return new Promise((resolve, reject) => {
            StateMachine.langClient()
                .getSignatureHelp(params)
                .then((signatureHelp) => {
                    resolve(signatureHelp);
                })
                .catch((error) => {
                    reject("Error fetching signature help from ls");
                });
        });
    }

    async getVisibleVariableTypes(params: BIGetVisibleVariableTypesRequest): Promise<BIGetVisibleVariableTypesResponse> {
        return new Promise((resolve, reject) => {
            StateMachine.langClient()
                .getVisibleVariableTypes(params)
                .then((types) => {
                    resolve(types as BIGetVisibleVariableTypesResponse);
                })
                .catch((error) => {
                    reject("Error fetching visible variable types from ls");
                });
        });
    }
}
