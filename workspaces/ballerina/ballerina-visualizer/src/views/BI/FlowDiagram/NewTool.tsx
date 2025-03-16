/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { AgentToolRequest, FlowNode } from "@wso2-enterprise/ballerina-core";
import { URI, Utils } from "vscode-uri";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { cloneDeep } from "lodash";
import { AIAgentSidePanel } from "../AIAgents/AIAgentSidePanel";
import { RelativeLoader } from "../../../components/RelativeLoader";

const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

interface NewToolProps {
    agentCallNode: FlowNode;
    onBack?: () => void;
    onSave?: () => void;
}

export function NewTool(props: NewToolProps): JSX.Element {
    const { agentCallNode, onSave, onBack } = props;
    console.log(">>> NewTool props", props);
    const { rpcClient } = useRpcContext();

    const [agentNode, setAgentNode] = useState<FlowNode | null>(null);
    const [existingTools, setExistingTools] = useState<string[]>([]);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const agentFilePath = useRef<string>("");
    const projectUri = useRef<string>("");

    useEffect(() => {
        initPanel();
    }, [agentCallNode]);

    const initPanel = async () => {
        // get agent file path
        const filePath = await rpcClient.getVisualizerLocation();
        agentFilePath.current = Utils.joinPath(URI.file(filePath.projectUri), "agents.bal").fsPath;
        projectUri.current = filePath.projectUri;
        // fetch tools and agent node
        await fetchAgentNode();
    };

    const fetchAgentNode = async () => {
        // get module nodes
        const moduleNodes = await rpcClient.getBIDiagramRpcClient().getModuleNodes();
        console.log(">>> module nodes", moduleNodes);
        // get agent name
        const agentName = agentCallNode.properties.connection.value;
        // get agent node
        const agentNode = moduleNodes.flowModel.connections.find(
            (node) => node.properties.variable.value === agentName
        );
        if (!agentNode) {
            console.error("Agent node not found");
            return;
        }
        console.log(">>> agent node", agentNode);
        setAgentNode(agentNode);
    };

    const handleOnSubmit = async (data: AgentToolRequest) => {
        console.log(">>> submit value", { data });
        setSavingForm(true);

        // agent node with tools
        // update the agent node
        const updatedAgentNode = cloneDeep(agentNode);
        console.log(">>> updatedAgentNode tools", { tools: cloneDeep(updatedAgentNode.properties.tools.value) });
        let toolsValue = cloneDeep(updatedAgentNode.properties.tools.value);
        // Simple string manipulation to add the new tool
        const selectedTool = data.toolName;
        if (selectedTool) {
            // if toolsValue is empty, and selectedTool is empty, create a new empty array
            if (!toolsValue) {
                toolsValue = [];
            }

            // remove all \n newlines from toolsValue
            toolsValue = toolsValue.toString().replace(/\n/g, "");
            // if toolsValue is not empty, and selectedTool is empty, create a new array with the selected tool
            if (toolsValue === "[]") {
                toolsValue = `[${selectedTool}]`;
            } else if (typeof toolsValue === "string") {
                if (toolsValue.startsWith("[") && toolsValue.endsWith("]")) {
                    // let's replace end bracket with the selected tool
                    toolsValue = toolsValue.substring(0, toolsValue.length - 1) + "," + selectedTool + "]";
                } else if (toolsValue.startsWith("[") && toolsValue.endsWith("]\n")) {
                    // let's replace end bracket with the selected tool
                    toolsValue = toolsValue.substring(0, toolsValue.length - 2) + "," + selectedTool + "]";
                }
            }
        }
        console.log(">>> toolsValue", { toolsValue });
        updatedAgentNode.properties.tools.value = toolsValue;
        updatedAgentNode.codedata.isNew = false;

        const agentResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: updatedAgentNode });
        console.log(">>> response getSourceCode with template ", { agentResponse });

        // wait for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // add tools
        if (data.selectedCodeData.node === "FUNCTION_CALL") {
            // create tool from existing function
            // get function definition
            const functionDefinition = await rpcClient.getBIDiagramRpcClient().getFunctionNode({
                functionName: data.selectedCodeData.symbol,
                fileName: "functions.bal",
                projectPath: projectUri.current,
            });
            console.log(">>> response get function definition", { functionDefinition });
            if (!functionDefinition.functionDefinition) {
                console.error("Function definition not found");
                return;
            }
            if (functionDefinition.functionDefinition?.codedata) {
                functionDefinition.functionDefinition.codedata.isNew = true;
            }
            // save tool
            const toolResponse = await rpcClient.getAIAgentRpcClient().genTool({
                toolName: data.toolName,
                description: data.description,
                filePath: agentFilePath.current,
                flowNode: functionDefinition.functionDefinition as FlowNode,
                connection: "",
            });
            console.log(">>> response save tool", { toolResponse });
        } else {
            // create tool from existing connection
            // get nodeTemplate
            const nodeTemplate = await rpcClient.getBIDiagramRpcClient().getNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: agentFilePath.current,
                id: data.selectedCodeData,
            });
            console.log(">>> node template", { nodeTemplate });
            if (!nodeTemplate.flowNode) {
                console.error("Node template not found");
                return;
            }
            if (nodeTemplate.flowNode?.codedata) {
                nodeTemplate.flowNode.codedata.isNew = true;
            }
            // save tool
            const toolResponse = await rpcClient.getAIAgentRpcClient().genTool({
                toolName: data.toolName,
                description: data.description,
                filePath: agentFilePath.current,
                flowNode: nodeTemplate.flowNode,
                connection: data.selectedCodeData.parentSymbol || "",
            });
            console.log(">>> response save tool", { toolResponse });
        }

        setSavingForm(false);
        onSave?.();
    };

    return (
        <>
            {agentFilePath.current && !savingForm && (
                <AIAgentSidePanel projectPath={agentFilePath.current} onSubmit={handleOnSubmit} />
            )}
            {(!agentFilePath.current || savingForm) && (
                <LoaderContainer>
                    <RelativeLoader />
                </LoaderContainer>
            )}
        </>
    );
}
