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
import { FlowNode, FormField } from "@wso2-enterprise/ballerina-core";
import { URI, Utils } from "vscode-uri";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";

const Container = styled.div`
    padding: 16px;
`;

const NoTools = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    color: var(--vscode-descriptionForeground);
`;

const ToolsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ToolItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 4px;
`;

interface NewToolProps {
    agentCallNode: FlowNode;
    onSave?: () => void;
}

export function NewTool(props: NewToolProps): JSX.Element {
    const { agentCallNode, onSave } = props;
    console.log(">>> NewTool props", props);
    const { rpcClient } = useRpcContext();

    const [agentNode, setAgentNode] = useState<FlowNode | null>(null);
    const [existingTools, setExistingTools] = useState<string[]>([]);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const agentFilePath = useRef<string>("");

    useEffect(() => {
        initPanel();
    }, [agentCallNode]);

    const initPanel = async () => {
        // get agent file path
        const filePath = await rpcClient.getVisualizerLocation();
        agentFilePath.current = Utils.joinPath(URI.file(filePath.projectUri), "agents.bal").fsPath;
        // fetch tools and agent node
        await fetchExistingTools();
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

    const fetchExistingTools = async () => {
        const existingTools = await rpcClient.getAIAgentRpcClient().getTools({ filePath: agentFilePath.current });
        console.log(">>> existing tools", existingTools);
        setExistingTools(existingTools.tools);
    };

    const handleOnSave = async (data: FormField[], rawData: FormValues) => {
        console.log(">>> save value", { data, rawData });
        setSavingForm(true);
        // update the agent node
        const updatedAgentNode = cloneDeep(agentNode);
        const roleValue = (rawData["role"] || "").replace(/"/g, '\\"');
        const instructionValue = (rawData["instruction"] || "").replace(/"/g, '\\"');
        const systemPromptValue = `{role: "${roleValue}", instructions: string \`${instructionValue}\`}`;
        updatedAgentNode.properties.systemPrompt.value = systemPromptValue;

        const agentResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: updatedAgentNode });
        console.log(">>> response getSourceCode with template ", { agentResponse });

        onSave?.();
        setSavingForm(false);
    };

    const hasExistingTools = existingTools.length > 0;

    return (
        <Container>
            {hasExistingTools && (
                <ToolsList>
                    {existingTools.map((tool) => (
                        <ToolItem key={tool}>{tool}</ToolItem>
                    ))}
                </ToolsList>
            )}

            {!hasExistingTools && <NoTools>No tools added. Add tools to enhance your agent's capabilities.</NoTools>}
        </Container>
    );
}
