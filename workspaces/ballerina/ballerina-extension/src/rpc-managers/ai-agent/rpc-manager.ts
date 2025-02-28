/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    AgentTool,
    AIAgentAPI,
    AIAgentRequest,
    AIAgentResponse,
    AIGentToolsRequest,
    AIGentToolsResponse,
    AIModelsRequest,
    AINodesResponse,
    AIToolsRequest,
    AIToolsResponse,
    AvailableNode,
    BallerinaProjectComponents,
    BIFlowModelRequest,
    BINodeTemplateRequest,
    ComponentInfo,
    EntryPointModel,
    FlowNode,
    NodePosition,
    STModification,
    SyntaxTree,
    TextEdit
} from "@wso2-enterprise/ballerina-core";
import { StateMachine } from "../../stateMachine";
import { handleAutomationCreation } from "../../utils/bi";
import { URI, Utils } from "vscode-uri";
import { BiDiagramRpcManager } from "../bi-diagram/rpc-manager";
import { Uri } from "vscode";
import { writeFileSync } from "fs";


interface EntryPosition {
    filePath: string;
    position: NodePosition;
}

export class AiAgentRpcManager implements AIAgentAPI {
    async getAllAgents(): Promise<AINodesResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: AINodesResponse = await context.langClient.getAllAgents();
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getAllModels(params: AIModelsRequest): Promise<AINodesResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: AINodesResponse = await context.langClient.getAllModels(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getModels(params: AIModelsRequest): Promise<AINodesResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: AINodesResponse = await context.langClient.getModels(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getTools(params: AIToolsRequest): Promise<AIToolsResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: AIToolsResponse = await context.langClient.getTools(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async genTool(params: AIGentToolsRequest): Promise<AIGentToolsResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: AIGentToolsResponse = await context.langClient.genTool(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async createAIAgent(params: AIAgentRequest): Promise<AIAgentResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                console.log(params);
                // First we need to create the template/entry point
                const entryPosition = await this.createEntrypoint(params.entryPoint);
                // Then we need to create the AI Model

                // Fetch the all the models first for given agent
                const allModels = (await StateMachine.langClient().getAllModels({ agent: "FunctionCallAgent" })).models;

                // Find the Codedata for the user selected ai model
                const getSelectedModelId = allModels.find(model => model.object === params.agentAIModel.modelName);

                const modelRequest: BINodeTemplateRequest = {
                    filePath: entryPosition.filePath,
                    position: { line: 0, offset: 0 },
                    id: getSelectedModelId
                }

                // Get the Node template for AI Model
                const modelFlowNode = (await StateMachine.langClient().getNodeTemplate(modelRequest)).flowNode;

                // Fill the flowNode properties with user selected data
                for (const key in modelFlowNode.properties) {
                    modelFlowNode.properties[key].value = params.agentAIModel.modelConfigs[key];
                }

                // Generate the model code
                const modelRes = (await new BiDiagramRpcManager().getSourceCode({ filePath: entryPosition.filePath, flowNode: modelFlowNode }));

                // Then we need to create the tools one by one
                for (const tool of params.agentTools.newTools) {
                    await this.createTool(entryPosition, tool);
                }


                // Create the AI Object
                const agentRequest: BINodeTemplateRequest = {
                    filePath: entryPosition.filePath,
                    position: { line: 0, offset: 0 },
                    id: {
                        "node": "AGENT",
                        "org": "wso2",
                        "module": "agent.ai",
                        "object": "FunctionCallAgent",
                        "symbol": "init"
                    }
                }

                // Get the Node template for AI Model
                const agentFlowNode = (await StateMachine.langClient().getNodeTemplate(agentRequest)).flowNode;

                // Fill the agent flowNode properties values
                agentFlowNode.properties["tools"].value = params.agentTools.tools;

                // Generate the model code
                const agentRes = (await new BiDiagramRpcManager().getSourceCode({ filePath: entryPosition.filePath, flowNode: agentFlowNode }));




                // Create AI Agent call
                const agentCallRequest: BINodeTemplateRequest = {
                    filePath: entryPosition.filePath,
                    position: { line: entryPosition.position.startLine + 1, offset: 0 },
                    id: {
                        node: "AGENT_CALL"
                    }
                }

                // Get the Node template for AI Model
                const agentCallFlowNode = (await StateMachine.langClient().getNodeTemplate(agentCallRequest)).flowNode;

                // Generate the agent call code
                const agentCallRes = (await new BiDiagramRpcManager().getSourceCode({ filePath: entryPosition.filePath, flowNode: agentFlowNode }));


                console.log("SUCCESS");

            } catch (error) {
                console.log(error);
            }
        });
    }



    async createEntrypoint(entryPoint: EntryPointModel): Promise<EntryPosition> {
        // Check for the correct template to create the entry point
        if (entryPoint.entryPoint === 'automation') {
            const functionFile = await handleAutomationCreation({ type: undefined });
            const components = await StateMachine.langClient().getBallerinaProjectComponents({
                documentIdentifiers: [{ uri: URI.file(StateMachine.context().projectUri).toString() }]
            }) as BallerinaProjectComponents;
            const position: NodePosition = {};
            for (const pkg of components.packages) {
                for (const module of pkg.modules) {
                    module.automations.forEach(func => {
                        position.startColumn = func.startColumn;
                        position.startLine = func.startLine;
                        position.endLine = func.endLine;
                        position.endColumn = func.endColumn;
                    });
                }
            }
            const res: EntryPosition = {
                filePath: functionFile,
                position
            }
            return res;
        }
    }

    async createTool(entryPosition: EntryPosition, tool: AgentTool): Promise<void> {
        try {
            if (tool.toolType === "Connector") {
                // Handle connector tool creation
                const connectionName = tool.connectorName;
                const connectionMethod = tool.connectorResource;

                if (tool.connectorState === 1) {
                    // Create a new connection with given values if the state is 1
                } else {
                    // Using the existing connection if the state is 2
                }
            } else {
                //Handle function tool creation
                // User has selected an existing function to be mapped to the tool
                if (tool.functionType.includes("Current")) {
                    // Fetch the functions list from project components
                    const projectUri = StateMachine.context().projectUri;
                    const components: BallerinaProjectComponents = await StateMachine.langClient().getBallerinaProjectComponents({
                        documentIdentifiers: [{ uri: URI.file(projectUri).toString() }]
                    });

                    let selectedFunction: ComponentInfo;

                    // Go through the functions and find the user selected function
                    for (const pkg of components.packages) {
                        for (const module of pkg.modules) {
                            module.functions.forEach(func => {
                                if (func.name === tool.functionName) {
                                    selectedFunction = func;
                                }
                            })
                        }
                    }

                    // Get the function flow node

                    // const params: BIFlowModelRequest = {
                    //     filePath: Utils.joinPath(URI.file(projectUri), selectedFunction.filePath).fsPath,
                    //     startLine: {
                    //         line: selectedFunction.startLine,
                    //         offset: selectedFunction.startColumn,
                    //     },
                    //     endLine: {
                    //         line: selectedFunction.endLine,
                    //         offset: selectedFunction.endColumn,
                    //     },
                    //     forceAssign: true, // TODO: remove this
                    // };

                    // const funcFlowNode = (await StateMachine.langClient().getFlowModel(params)).flowModel;

                    const functionList = (await StateMachine.langClient().getFunctions({
                        position: { startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } },
                        filePath: entryPosition.filePath,
                        queryMap: {
                            q: "",
                            limit: 12,
                            offset: 0
                        }
                    })).categories;


                    const userFunctionsList = functionList.find(cat => cat.metadata.label.includes("Current")).items;

                    const selectedFunctionCodeData = userFunctionsList.find(func => func.metadata.label === tool.functionName) as AvailableNode;


                    // const functionFlowNode = (await StateMachine.langClient().getNodeTemplate({
                    //     position: { line: selectedFunction.startLine, offset: selectedFunction.startColumn },
                    //     filePath: Utils.joinPath(URI.file(projectUri), selectedFunction.filePath).fsPath,
                    //     id: { ...selectedFunctionCodeData.codedata, node: "FUNCTION_DEFINITION" }
                    // })).flowNode

                    const functionFlowNode = (await StateMachine.langClient().getFunctionNode({
                        functionName: tool.functionName,
                        fileName: selectedFunction.filePath,
                        projectPath: projectUri
                    })).functionDefinition as FlowNode;

                    // // Create the tool for the given function
                    const toolTextEdits = await StateMachine.langClient().genTool({ filePath: entryPosition.filePath, flowNode: functionFlowNode, toolName: tool.toolName });
                    await this.updateSource(toolTextEdits.textEdits);

                } else {
                    // Selected function is coming from imported functions

                    // Get all the available function categories
                    // const getFunctions = await StateMachine.langClient().getFunctions({
                    //     position: { startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } },
                    //     filePath: filePath,
                    //     queryMap: {
                    //         q: "",
                    //         limit: 12,
                    //         offset: 0
                    //     }
                    // })
                    // Find the user selected category
                    // const functionCategory = getFunctions.categories.find(func => func.metadata.label === tool.functionType);

                    // Find the user selected function
                    // const userSelectedFunction = functionCategory.items.find(func => func.metadata.label === tool.functionName);
                }
            }
        } catch (error) {
            console.error(`Failed to create tool: ${error}`);
        }
    }

    async updateSource(textEdits: { [key: string]: TextEdit[] }): Promise<void> {
        const modificationRequests: Record<string, { filePath: string; modifications: STModification[] }> = {};

        for (const [key, value] of Object.entries(textEdits)) {
            const fileUri = Uri.file(key);
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
                }
            }
        } catch (error) {
            console.log(">>> error updating source", error);
        }
    }


}

