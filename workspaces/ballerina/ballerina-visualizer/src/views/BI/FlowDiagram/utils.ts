/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Category, AvailableNode, FlowNode, BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { cloneDeep } from "lodash";
import { URI, Utils } from "vscode-uri";

// Filter out connections where name starts with _ and module is "ai" or "ai.agent"
export const filterConnections = (categories: Category[]): Category[] => {
    return categories.map((category) => {
        if (category.metadata.label === "Connections") {
            const filteredItems = category.items.filter((item) => {
                if ("metadata" in item && "items" in item && item.items.length > 0 && "codedata" in item.items.at(0)) {
                    const name = item.metadata.label || "";
                    const module = (item.items.at(0) as AvailableNode)?.codedata.module || "";

                    // Filter out items where name starts with _ and module is "ai" or "ai.agent"
                    return !(name.startsWith("_") && (module === "ai" || module === "ai.agent"));
                }
                return true;
            });

            return {
                ...category,
                items: filteredItems,
            };
        }
        return category;
    });
};

export const transformCategories = (categories: Category[]): Category[] => {
    // First filter connections
    let filteredCategories = filterConnections(categories);

    // filter out some categories that are not supported in the diagram
    // TODO: these categories should be supported in the future
    const notSupportedCategories = [
        "PARALLEL_FLOW",
        "LOCK",
        "START",
        "TRANSACTION",
        "COMMIT",
        "ROLLBACK",
        "RETRY",
        "NP_FUNCTION",
    ];

    filteredCategories = filteredCategories.map((category) => ({
        ...category,
        items: category?.items?.filter(
            (item) => !("codedata" in item) || !notSupportedCategories.includes((item as AvailableNode).codedata?.node)
        ),
    })) as Category[];

    // remove agents from categories
    filteredCategories = filteredCategories.filter((category) => category.metadata.label !== "Agents");

    // find statement category
    const statementCategory = filteredCategories.find((category) => category.metadata.label === "Statement");
    // find AGENT_CALL from statement category
    const agentCallNode = statementCategory?.items?.find(
        (item) => (item as AvailableNode).codedata?.node === "AGENT_CALL"
    ) as AvailableNode;
    if (agentCallNode?.codedata) {
        // HACK: update agent call node until LS update with the new agent node
        agentCallNode.codedata.object = "Agent";
        agentCallNode.codedata.parentSymbol = "";
    } else {
        // TODO: this should remove once LS update with the new agent node
        // add new item
        statementCategory.items.push({
            codedata: {
                module: "ai",
                node: "AGENT_CALL",
                object: "Agent",
                org: "ballerinax",
                parentSymbol: "",
                symbol: "run",
                version: "1.0.0",
            },
            enabled: true,
            metadata: {
                label: "Agent",
                description: "Add an AI Agent to the flow",
            },
        });
    }

    return filteredCategories;
};

export const handleAgentOperations = {
    getAgentConfig: (node: any) => {
        if (!node || node.codedata?.node !== "AGENT_CALL") return null;

        const properties = node.properties || {};
        return {
            name: properties.connection?.value || "Unknown Agent",
            model: properties.model?.value || "gpt-3.5-turbo",
            systemPrompt: properties.systemPrompt?.value || "",
            tools: properties.tools?.value || [],
        };
    },

    formatAgentData: (data: any) => {
        // Format AIAgent specific data for display or API calls
        return data;
    },
};

export const getAgentFilePath = async (rpcClient: BallerinaRpcClient) => {
    // Get the agent file path and update the node
    const filePath = await rpcClient.getVisualizerLocation();
    // Create the agent file path
    const agentFilePath = Utils.joinPath(URI.file(filePath.projectUri), "agents.bal").fsPath;
    return agentFilePath;
};

export const findFlowNodeByModuleVarName = async (variableName: string, rpcClient: BallerinaRpcClient) => {
    try {
        // Get all module nodes
        const moduleNodes = await rpcClient.getBIDiagramRpcClient().getModuleNodes();
        // Find the node with matching variable name
        const flowNode = moduleNodes.flowModel.connections.find((node) => {
            const value = node.properties?.variable?.value;
            const sanitizedVarName = variableName.trim().replace(/\n/g, "");
            return typeof value === "string" && value === sanitizedVarName;
        });
        if (!flowNode) {
            console.error(`Flow node with variable name '${variableName}' not found`);
            return null;
        }
        return flowNode;
    } catch (error) {
        console.error("Error finding flow node by variable name:", error);
        return null;
    }
};

export const findAgentNodeFromAgentCallNode = async (agentCallNode: FlowNode, rpcClient: BallerinaRpcClient) => {
    if (!agentCallNode || agentCallNode.codedata?.node !== "AGENT_CALL") return null;

    // get agent name
    const connectionValue = agentCallNode.properties?.connection?.value;
    if (typeof connectionValue !== "string") {
        console.error("Agent connection value is not a string");
        return null;
    }

    // use the new function to find the node
    return await findFlowNodeByModuleVarName(connectionValue, rpcClient);
};

export const removeToolFromAgentNode = async (agentNode: FlowNode, toolName: string) => {
    if (!agentNode || agentNode.codedata?.node !== "AGENT") return null;
    // clone the node to avoid modifying the original
    const updatedAgentNode = cloneDeep(agentNode);
    let toolsValue = updatedAgentNode.properties.tools.value;
    // remove new lines from the tools value
    toolsValue = toolsValue.toString().replace(/\n/g, "");
    // Remove the tools from the tools array
    if (typeof toolsValue === "string") {
        const toolsArray = parseToolsString(toolsValue);
        if (toolsArray.length > 0) {
            // Remove the tool
            const existingTools = toolsArray.filter((t) => t !== toolName);
            // Update the tools value
            toolsValue = existingTools.length === 1 ?
                `[${existingTools[0]}]` :
                `[${existingTools.join(", ")}]`;
        } else {
            toolsValue = `[]`;
        }
    } else {
        console.error("Tools value is not a string", toolsValue);
        return agentNode;
    }
    // update the node
    updatedAgentNode.properties.tools.value = toolsValue;
    updatedAgentNode.codedata.isNew = false;
    return updatedAgentNode;
};


export const addToolToAgentNode = async (agentNode: FlowNode, toolName: string) => {
    if (!agentNode || agentNode.codedata?.node !== "AGENT") return null;
    // clone the node to avoid modifying the original
    const updatedAgentNode = cloneDeep(agentNode);
    let toolsValue = updatedAgentNode.properties.tools.value;
    // remove new lines and normalize whitespace from the tools value
    toolsValue = toolsValue.toString().replace(/\s+/g, "");
    if (typeof toolsValue === "string") {
        const toolsArray = parseToolsString(toolsValue);
        if (toolsArray.length > 0) {
            // Add the tool if not exists
            if (!toolsArray.includes(toolName)) {
                toolsArray.push(toolName);
            }
            // Update the tools value
            toolsValue = toolsArray.length === 1 ?
                `[${toolsArray[0]}]` :
                `[${toolsArray.join(", ")}]`;
        } else {
            toolsValue = `[${toolName}]`;
        }
    } else {
        console.error("Tools value is not a string", toolsValue);
        return agentNode;
    }
    // update the node
    updatedAgentNode.properties.tools.value = toolsValue;
    updatedAgentNode.codedata.isNew = false;
    return updatedAgentNode;
};

// remove agent node, model node when removing ag
export const removeAgentNode = async (agentCallNode: FlowNode, rpcClient: BallerinaRpcClient): Promise<boolean> => {
    if (!agentCallNode || agentCallNode.codedata?.node !== "AGENT_CALL") return false;
    // get module nodes
    const moduleNodes = await rpcClient.getBIDiagramRpcClient().getModuleNodes();
    // get agent name
    const agentName = agentCallNode.properties.connection.value;
    // get agent node
    const agentNode = moduleNodes.flowModel.connections.find((node) => node.properties.variable.value === agentName);
    console.log(">>> agent node", agentNode);
    if (!agentNode) {
        console.error("Agent node not found", agentCallNode);
        return false;
    }
    // get model name
    const modelName = agentNode?.properties.model.value;
    console.log(">>> model name", modelName);
    // get model node
    const modelNode = moduleNodes.flowModel.connections.find((node) => node.properties.variable.value === modelName);
    console.log(">>> model node", modelNode);
    if (!modelNode) {
        console.error("Model node not found", agentCallNode);
        return false;
    }
    // get file path
    const projectPath = await rpcClient.getVisualizerLocation();
    const agentFileName = agentNode.codedata.lineRange.fileName;
    const filePath = Utils.joinPath(URI.file(projectPath.projectUri), agentFileName).fsPath;
    // delete the agent node
    await rpcClient.getBIDiagramRpcClient().deleteFlowNode({
        filePath: filePath,
        flowNode: agentNode,
    });
    // delete the model node
    await rpcClient.getBIDiagramRpcClient().deleteFlowNode({
        filePath: filePath,
        flowNode: modelNode,
    });
    return true;
};

export const findFunctionByName = (components: BallerinaProjectComponents, functionName: string) => {
    for (const pkg of components.packages) {
        for (const module of pkg.modules) {
            const foundFunction = module.functions.find((func: any) => func.name === functionName);
            if (foundFunction) {
                const pkgUri = URI.parse(pkg.filePath);
                const joinedUri = Utils.joinPath(pkgUri, foundFunction.filePath);
                foundFunction.filePath = joinedUri.fsPath;
                return foundFunction;
            }
        }
    }
    return null;
};

export const updateFlowNodePropertyValuesWithKeys = (flowNode: FlowNode) => {
    const excludedKeys = ["variable", "type", "checkError", "targetType"];
    for (const key in flowNode.properties) {
        if (!excludedKeys.includes(key)) {
            (flowNode.properties as Record<string, { value: string }>)[key].value = key;
        }
    }
}

const parseToolsString = (toolsStr: string): string[] => {
    // Remove brackets and split by comma
    const trimmed = toolsStr.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
        return [];
    }
    const inner = trimmed.substring(1, trimmed.length - 1);
    // Handle empty array case
    if (!inner.trim()) {
        return [];
    }
    // Split by comma and trim each element
    return inner.split(",").map(tool => tool.trim());
};