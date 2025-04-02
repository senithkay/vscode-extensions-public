/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Category, AvailableNode, FlowNode, ProjectComponentsResponse, BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { cloneDeep } from "lodash";
import { URI, Utils } from "vscode-uri";

export const transformCategories = (categories: Category[]): Category[] => {
    // filter out some categories that are not supported in the diagram
    // TODO: these categories should be supported in the future
    const notSupportedCategories = ["PARALLEL_FLOW", "LOCK", "START", "TRANSACTION", "COMMIT", "ROLLBACK", "RETRY"];

    let filteredCategories = categories.map((category) => ({
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
        agentCallNode.codedata.version = agentCallNode.codedata.version || "0.7.16";
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

export const findAgentNodeFromAgentCallNode = async (agentCallNode: FlowNode, rpcClient: BallerinaRpcClient) => {
    if (!agentCallNode || agentCallNode.codedata?.node !== "AGENT_CALL") return null;
    // get all module nodes
    const moduleNodes = await rpcClient.getBIDiagramRpcClient().getModuleNodes();
    console.log(">>> module nodes", moduleNodes);
    // get agent name
    const agentName = agentCallNode.properties.connection.value;
    // get agent node
    const agentNode = moduleNodes.flowModel.connections.find((node) => node.properties.variable.value === agentName);
    if (!agentNode) {
        console.error("Agent node not found");
        return;
    }
    return agentNode;
};

export const removeToolFromAgentNode = async (agentNode: FlowNode, toolName: string) => {
    if (!agentNode || agentNode.codedata?.node !== "AGENT") return null;
    // clone the node to avoid modifying the original
    const updatedAgentNode = cloneDeep(agentNode);
    let toolsValue = updatedAgentNode.properties.tools.value;
    // remove new lines from the tools value
    toolsValue = toolsValue.toString().replace(/\n/g, "");
    // Remove the tool from the tools array
    if (typeof toolsValue === "string") {
        if (toolsValue.startsWith("[") && toolsValue.endsWith("]")) {
            // Parse the tools string
            const toolsString = toolsValue.substring(1, toolsValue.length - 1);
            let existingTools = toolsString.split(",").map((t) => t.trim());
            // Remove the tool
            existingTools = existingTools.filter((t) => t !== toolName);
            // Update the tools value
            toolsValue = `[${existingTools.join(", ")}]`;
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
    // remove new lines from the tools value
    toolsValue = toolsValue.toString().replace(/\n/g, "");
    if (typeof toolsValue === "string") {
        if (toolsValue === "[]") {
            toolsValue = `[${toolName}]`;
        } else if (toolsValue.startsWith("[") && toolsValue.endsWith("]")) {
            const toolsString = toolsValue.substring(1, toolsValue.length - 1);
            const existingTools = toolsString.split(",").map((t) => t.trim());

            if (!existingTools.includes(toolName)) {
                toolsValue = toolsValue.substring(0, toolsValue.length - 1);
                if (toolsValue.length > 1) {
                    toolsValue += ", ";
                }
                toolsValue += toolName + "]";
            }
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

export const findFunctionByName = (components: BallerinaProjectComponents, functionName: string) => {
    // Iterate through packages
    for (const pkg of components.packages) {
        // Iterate through modules in each package
        for (const module of pkg.modules) {
            // Search through functions
            const foundFunction = module.functions.find(
                (func: any) => func.name === functionName
            );
            if (foundFunction) {
                // update file path to include package path
                foundFunction.filePath = Utils.joinPath(URI.file(pkg.filePath), foundFunction.filePath).fsPath;
                return foundFunction;
            }
        }
    }
    return null;
}
