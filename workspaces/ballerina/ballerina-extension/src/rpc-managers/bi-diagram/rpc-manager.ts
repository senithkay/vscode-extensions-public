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
    BIDeleteByComponentInfoRequest,
    BIDeleteByComponentInfoResponse,
    BIDiagramAPI,
    BIFlowModelRequest,
    BIFlowModelResponse,
    BIGetEnclosedFunctionRequest,
    BIGetEnclosedFunctionResponse,
    BIGetFunctionsRequest,
    BIGetFunctionsResponse,
    BIGetVisibleVariableTypesRequest,
    BIGetVisibleVariableTypesResponse,
    BIModuleNodesRequest,
    BIModuleNodesResponse,
    BINodeTemplateRequest,
    BINodeTemplateResponse,
    BISourceCodeRequest,
    BISourceCodeResponse,
    BISuggestedFlowModelRequest,
    BI_COMMANDS,
    BreakpointRequest,
    ComponentRequest,
    ComponentsRequest,
    ComponentsResponse,
    ConfigVariableResponse,
    CreateComponentResponse,
    CurrentBreakpointsResponse,
    DIRECTORY_MAP,
    BIDesignModelResponse,
    EVENT_TYPE,
    ExpressionCompletionsRequest,
    ExpressionCompletionsResponse,
    ExpressionDiagnosticsRequest,
    ExpressionDiagnosticsResponse,
    FlowNode,
    FormDidCloseParams,
    FormDidOpenParams,
    ImportStatement,
    ImportStatements,
    OverviewFlow,
    ProjectComponentsResponse,
    ProjectImports,
    ProjectRequest,
    ProjectStructureResponse,
    ReadmeContentRequest,
    ReadmeContentResponse,
    STModification,
    SignatureHelpRequest,
    SignatureHelpResponse,
    SyntaxTree,
    UpdateConfigVariableRequest,
    UpdateConfigVariableResponse,
    UpdateImportsRequest,
    UpdateImportsResponse,
    VisibleTypesRequest,
    VisibleTypesResponse,
    WorkspaceFolder,
    WorkspacesResponse,
    buildProjectStructure,
} from "@wso2-enterprise/ballerina-core";
import * as fs from "fs";
import { writeFileSync } from "fs";
import * as path from 'path';
import * as vscode from "vscode";

import {
    ShellExecution,
    Task,
    TaskDefinition,
    Uri, ViewColumn, commands,
    tasks,
    window, workspace
} from "vscode";
import { DebugProtocol } from "vscode-debugprotocol";
import { extension } from "../../BalExtensionContext";
import { notifyBreakpointChange } from "../../RPCLayer";
import { ballerinaExtInstance } from "../../core";
import { BreakpointManager } from "../../features/debugger/breakpoint-manager";
import { StateMachine, openView, updateView } from "../../stateMachine";
import { README_FILE, createBIAutomation, createBIFunction, createBIProjectPure, createBIService, createBITrigger, createBITriggerListener, handleServiceCreation, sanitizeName } from "../../utils/bi";
import { writeBallerinaFileDidOpen } from "../../utils/modification";
import { BACKEND_API_URL_V2, refreshAccessToken } from "../ai-panel/utils";
import { DATA_MAPPING_FILE_NAME, getDataMapperNodePosition } from "./utils";

export class BiDiagramRpcManager implements BIDiagramAPI {

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
                filePath: context.documentUri,
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
        const { flowNode, isDataMapperFormUpdate } = params;
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getSourceCode(params)
                .then(async (model) => {
                    console.log(">>> bi source code from ls", model);
                    if (params?.isConnector) {
                        await this.updateSource(model, flowNode, true, isDataMapperFormUpdate);
                        resolve(model);
                        commands.executeCommand("BI.project-explorer.refresh");
                    } else {
                        this.updateSource(model, flowNode, false, isDataMapperFormUpdate);
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

    async updateSource(
        params: BISourceCodeResponse,
        flowNode?: FlowNode,
        isConnector?: boolean,
        isDataMapperFormUpdate?: boolean
    ): Promise<void> {
        const modificationRequests: Record<string, { filePath: string; modifications: STModification[] }> = {};

        for (const [key, value] of Object.entries(params.textEdits)) {
            let fileUri = Uri.file(key);
            if (params.isExpression) {
                fileUri = fileUri.with({ scheme: "expr" });
            }
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
        try {
            for (const [fileUriString, request] of Object.entries(modificationRequests)) {
                const { parseSuccess, source, syntaxTree } = (await StateMachine.langClient().stModify({
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
                    } else if (isDataMapperFormUpdate && fileUriString.endsWith(DATA_MAPPING_FILE_NAME)) {
                        const functionPosition = getDataMapperNodePosition(flowNode.properties, syntaxTree);
                        openView(EVENT_TYPE.OPEN_VIEW, {
                            documentUri: request.filePath,
                            position: functionPosition,
                        });
                    }
                }
            }
        } catch (error) {
            console.log(">>> error updating source", error);
        }
        if (!isConnector && !isDataMapperFormUpdate) {
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
                case DIRECTORY_MAP.TRIGGERS:
                    if (params.triggerType.listenerOnly) {
                        res = await createBITriggerListener(params);
                    } else {
                        res = await createBITrigger(params);
                    }
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
                const token = await extension.context.secrets.get('BallerinaAIUser');
                if (!token) {
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
                    headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(requestBody),
                };
                console.log(">>> request ai suggestion", { request: requestBody });
                let response;
                try {
                    response = await fetchWithToken(BACKEND_API_URL_V2 + "/completion", requestOptions);
                } catch (error) {
                    console.log(">>> error fetching ai suggestion", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                }
                if (!response.ok) {
                    console.log(">>> ai completion api call failed ", response);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                }
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
                    filePath: context.documentUri,
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
                    this.updateSource(model, params.flowNode);
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
                writeBallerinaFileDidOpen(connectionsBalPath, importStatements.join("\n"));
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
            if (!params.filePath) {
                params.filePath = StateMachine.context().documentUri;
            }
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

    async getConfigVariables(): Promise<ConfigVariableResponse> {
        return new Promise(async (resolve) => {
            const projectPath = path.join(StateMachine.context().projectUri);
            const variables = await StateMachine.langClient().getConfigVariables({ projectPath: projectPath }) as ConfigVariableResponse;
            resolve(variables);
        });
    }

    async updateConfigVariables(params: UpdateConfigVariableRequest): Promise<UpdateConfigVariableResponse> {
        return new Promise(async (resolve) => {
            const req: UpdateConfigVariableRequest = params;

            if (!fs.existsSync(params.configFilePath)) {

                // Create config.bal if it doesn't exist
                writeBallerinaFileDidOpen(params.configFilePath, "\n");
            }

            const response = await StateMachine.langClient().updateConfigVariables(req) as BISourceCodeResponse;
            this.updateSource(response, undefined, false);
            resolve(response);
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
                    case "$(cloud) Deploy on Choreo":
                        this.createChoreoComponent("test", "service");
                        break;
                    default:
                        window.showErrorMessage("Invalid deployment option selected");
                }
            });
    }

    openAIChat(params: AIChatRequest): void {
        if (params.readme) {
            commands.executeCommand("kolab.open.ai.panel", "Generate an integration according to the given Readme file");
        } else {
            commands.executeCommand("kolab.open.ai.panel");
        }
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
                filePath: context.projectUri,
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

    async runBallerinaBuildTask(docker: boolean): Promise<void> {
        const taskDefinition: TaskDefinition = {
            type: 'shell',
            task: 'run'
        };

        let buildCommand = docker ? 'bal build --cloud="docker"' : 'bal build';

        // Get Ballerina home path from settings
        const config = workspace.getConfiguration('kolab');
        const ballerinaHome = config.get<string>('home');
        if (ballerinaHome) {
            // Add ballerina home to build path only if it's configured
            buildCommand = path.join(ballerinaHome, 'bin', buildCommand);
        }

        const execution = new ShellExecution(buildCommand);

        const task = new Task(
            taskDefinition,
            workspace.workspaceFolders![0], // Assumes at least one workspace folder is open
            'Ballerina Build',
            'ballerina',
            execution
        );

        try {
            await tasks.executeTask(task);
        } catch (error) {
            window.showErrorMessage(`Failed to build Ballerina package: ${error}`);
        }
    }

    buildProject(): void {
        window.showQuickPick([
            {
                label: "$(package) Executable JAR",
                detail: "Build a self-contained, runnable JAR file for your project",
            },
            {
                label: "$(docker) Docker Image",
                detail: "Create a Docker image to containerize your Ballerina Integration",
            }
        ].map(item => ({
            ...item,
        })), {
            placeHolder: "Choose a build option"
        })
            .then((selection) => {
                if (!selection) {
                    return; // User cancelled the selection
                }

                switch (selection.label) {
                    case "$(package) Executable JAR":
                        console.log(selection);
                        this.runBallerinaBuildTask(false);
                        break;
                    case "$(docker) Docker Image":
                        this.runBallerinaBuildTask(true);
                        break;
                    default:
                        window.showErrorMessage("Invalid deployment option selected");
                }
            });
    }

    runProject(): void {
        commands.executeCommand(BI_COMMANDS.BI_RUN_PROJECT);
    }

    async getVisibleTypes(params: VisibleTypesRequest): Promise<VisibleTypesResponse> {
        return new Promise((resolve, reject) => {
            StateMachine.langClient()
                .getVisibleTypes(params)
                .then((visibleTypes) => {
                    resolve(visibleTypes);
                })
                .catch((error) => {
                    reject("Error fetching visible types from ls");
                });
        });
    }

    async deleteByComponentInfo(params: BIDeleteByComponentInfoRequest): Promise<BIDeleteByComponentInfoResponse> {
        console.log(">>> requesting bi delete node from ls by componentInfo", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .deleteByComponentInfo(params)
                .then((model) => {
                    console.log(">>> bi delete node from ls by componentInfo", model);
                    this.updateSource(model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching delete node from ls by componentInfo", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async getExpressionDiagnostics(params: ExpressionDiagnosticsRequest): Promise<ExpressionDiagnosticsResponse> {
        return new Promise((resolve, reject) => {
            StateMachine.langClient()
                .getExpressionDiagnostics(params)
                .then((diagnostics) => {
                    resolve(diagnostics);
                })
                .catch((error) => {
                    reject("Error fetching expression diagnostics from ls");
                });
        });
    }

    async addBreakpointToSource(params: BreakpointRequest): Promise<void> {
        return new Promise(async (resolve) => {
            console.log(">>> adding breakpoint to source", params);
            const breakpoint = new vscode.SourceBreakpoint(
                new vscode.Location(vscode.Uri.file(params.filePath), new vscode.Position(params.breakpoint.line, params.breakpoint?.column)));
            vscode.debug.addBreakpoints([breakpoint]);

            notifyBreakpointChange();
        });
    }

    async removeBreakpointFromSource(params: BreakpointRequest): Promise<void> {
        return new Promise(async (resolve) => {
            console.log(">>> removing breakpoint from source", params);
            const breakpointsForFile: vscode.SourceBreakpoint[] = vscode.debug.breakpoints.filter((breakpoint) => {
                const sourceBreakpoint = breakpoint as vscode.SourceBreakpoint;
                return sourceBreakpoint.location.uri.fsPath === params.filePath;
            }) as vscode.SourceBreakpoint[];

            const breakpoints = breakpointsForFile.filter((breakpoint) => {
                return breakpoint.location.range.start.line === params.breakpoint.line &&
                breakpoint.location.range.start?.character === params.breakpoint?.column;
            });

            // If there are no breakpoints found,
            // then it could be due the breakpoint has been added from the sourceCode, where the column is not provided
            // so we need to check for breakpoint with the same line and remove
            if (breakpoints.length === 0) {
                const breakpointsToRemove = breakpointsForFile.filter((breakpoint) => {
                    return breakpoint.location.range.start.line === params.breakpoint.line;
                });
                vscode.debug.removeBreakpoints(breakpointsToRemove);
            } else {
                vscode.debug.removeBreakpoints(breakpoints);
            }

            notifyBreakpointChange();
        });
    }

    async getBreakpointInfo(): Promise<CurrentBreakpointsResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();

            const breakpointsForFile: vscode.SourceBreakpoint[] = vscode.debug.breakpoints.filter((breakpoint) => {
                const sourceBreakpoint = breakpoint as vscode.SourceBreakpoint;
                return sourceBreakpoint.location.uri.fsPath === context?.documentUri;
            }) as vscode.SourceBreakpoint[];

            const breakpoints: DebugProtocol.Breakpoint[] = breakpointsForFile.map((breakpoint) => {
                return {
                    verified: true,
                    line: breakpoint.location.range.start.line,
                    column: breakpoint.location.range.start?.character
                };
            });
            // TODO: Check the need of using breakpoints with verified status
            // const breakppoints = BreakpointManager.getInstance().getBreakpoints();
            // if there is an instance then call get ActiveBreakpoint

            const activeBreakpoint = BreakpointManager.getInstance()?.getActiveBreakpoint();
            resolve({ breakpoints: breakpoints, activeBreakpoint: activeBreakpoint });
        });
    }

    async getAllImports(): Promise<ProjectImports> {
        const projectUri = StateMachine.context().projectUri;
        const ballerinaFiles = await getBallerinaFiles(Uri.file(projectUri).fsPath);
        const imports: ImportStatements[] = [];

        for (const file of ballerinaFiles) {
            const fileContent = fs.readFileSync(file, "utf8");
            const fileImports = await extractImports(fileContent, file);
            imports.push(fileImports);
        }
        return {
            projectPath: projectUri,
            imports,
        };
    }

    async getEnclosedFunction(params: BIGetEnclosedFunctionRequest): Promise<BIGetEnclosedFunctionResponse> {
        console.log(">>> requesting parent functin definition", params);
        return new Promise((resolve) => {
            StateMachine.langClient()
                .getEnclosedFunctionDef(params)
                .then((response) => {
                    if(response?.filePath && response?.startLine && response?.endLine) {
                        console.log(">>> parent function position ", response);
                        resolve(response);
                    } else {
                        console.log(">>> parent function position not found");
                        resolve(undefined);
                    }
                    
                })
                .catch((error) => {
                    console.log(">>> error fetching parent function position", error);
                    resolve(undefined);
                });
        });
    }

    async formDidOpen(params: FormDidOpenParams): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const { filePath } = params;
                const fileUri = Uri.file(filePath);
                const textDocument = await workspace.openTextDocument(fileUri);
                const exprFileSchema = fileUri.with({ scheme: 'expr' });

                StateMachine.langClient().didOpen({
                    textDocument: {
                        uri: exprFileSchema.toString(),
                        languageId: textDocument.languageId,
                        version: textDocument.version,
                        text: textDocument.getText()
                    }
                });
                resolve();
            } catch (error) {
                console.error("Error opening file in didOpen", error);
                reject(error);
            }
        });
    }

    async formDidClose(params: FormDidCloseParams): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const { filePath } = params;
                const fileUri = Uri.file(filePath);
                const exprFileSchema = fileUri.with({ scheme: 'expr' });
                StateMachine.langClient().didClose({
                    textDocument: {
                        uri: exprFileSchema.toString()
                    }
                });
                resolve();
            } catch (error) {
                console.error("Error closing file in didClose", error);
                reject(error);
            }
        });
    }

    async getDesignModel(): Promise<BIDesignModelResponse> {
        console.log(">>> requesting design model from ls");
        return new Promise((resolve) => {
            const projectUri = StateMachine.context().projectUri;

            StateMachine.langClient()
                .getDesignModel({ projectPath: projectUri })
                .then((model) => {
                    console.log(">>> design model from ls", model);
                    resolve(model);
                })
                .catch((error) => {
                    console.log(">>> error fetching design model from ls", error);
                    return new Promise((resolve) => {
                        resolve(undefined);
                    });
                });
        });
    }

    async updateImports(params: UpdateImportsRequest): Promise<UpdateImportsResponse> {
        return new Promise((resolve, reject) => {
            const { filePath, importStatement } = params;
            const trimmedImportStatement = importStatement.trim();
            const textEdits = {
                [filePath]: [{
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 }
                    },
                    newText: trimmedImportStatement
                }]
            };
            console.log(">>> text edits", textEdits);

            try {
                this.updateSource({ textEdits, isExpression: true });
                resolve({ importStatementOffset: trimmedImportStatement.length });
            } catch (error) {
                console.error("Error updating imports", error);
                reject(error);
            }
        });
    }
}

export async function fetchWithToken(url: string, options: RequestInit) {
    let response = await fetch(url, options);
    console.log("Response status: ", response.status);
    if (response.status === 401) {
        console.log("Token expired. Refreshing token...");
        const newToken = await refreshAccessToken();
        console.log("refreshed token : " + newToken);
        if (newToken) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
            };
            response = await fetch(url, options);
        }
    }
    return response;
}

export async function getBallerinaFiles(dir: string): Promise<string[]> {
    let files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getBallerinaFiles(entryPath));
        } else if (entry.isFile() && entry.name.endsWith(".bal")) {
            files.push(entryPath);
        }
    }
    return files;
}

export async function extractImports(content: string, filePath: string): Promise<ImportStatements> {
    const withoutSingleLineComments = content.replace(/\/\/.*$/gm, "");
    const withoutComments = withoutSingleLineComments.replace(/\/\*[\s\S]*?\*\//g, "");

    const importRegex = /import\s+([\w\.\/]+)(?:\s+as\s+([\w]+))?;/g;
    const imports: ImportStatement[] = [];
    let match;

    while ((match = importRegex.exec(withoutComments)) !== null) {
        const importStatement: ImportStatement = { moduleName: match[1] };
        if (match[2]) {
            importStatement.alias = match[2];
        }
        imports.push(importStatement);
    }

    return { filePath, statements: imports };
}
