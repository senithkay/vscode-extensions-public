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
import { FlowNode } from "@wso2-enterprise/ballerina-core";
import { URI, Utils } from "vscode-uri";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { cloneDeep } from "lodash";
import { Button, Codicon, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { RelativeLoader } from "../../../components/RelativeLoader";

const Container = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100%;
    box-sizing: border-box;
`;

const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Description = styled.div`
    font-size: var(--vscode-font-size);
    color: ${ThemeColors.ON_SURFACE_VARIANT};
    margin-bottom: 8px;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    overflow-y: auto;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const Title = styled.div`
    font-size: 14px;
    font-family: GilmerBold;
`;

const ToolItem = styled.div<{ isSelected?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    padding: 5px;
    border: 1px solid
        ${(props: { isSelected: boolean }) => (props.isSelected ? ThemeColors.PRIMARY : ThemeColors.OUTLINE_VARIANT)};
    border-radius: 5px;
    height: 36px;
    cursor: "pointer";
    font-size: 14px;
    &:hover {
        background-color: ${ThemeColors.PRIMARY_CONTAINER};
        border: 1px solid ${ThemeColors.PRIMARY};
    }
`;

const PrimaryButton = styled(Button)`
    appearance: "primary";
`;

const HighlightedButton = styled.div`
    margin-top: 10px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 2px;
    color: ${ThemeColors.PRIMARY};
    border: 1px dashed ${ThemeColors.PRIMARY};
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        border: 1px solid ${ThemeColors.PRIMARY};
        background-color: ${ThemeColors.PRIMARY_CONTAINER};
    }
`;

const Footer = styled.div`
    position: fixed;
    bottom: 0;
    left: 0;

    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px;
    background-color: ${ThemeColors.SURFACE_DIM};
    margin-top: auto;
`;

interface AddToolProps {
    agentCallNode: FlowNode;
    onAddNewTool: () => void;
    onSave?: () => void;
}

export function AddTool(props: AddToolProps): JSX.Element {
    const { agentCallNode, onAddNewTool, onSave } = props;
    console.log(">>> AddTool props", props);
    const { rpcClient } = useRpcContext();

    const [agentNode, setAgentNode] = useState<FlowNode | null>(null);
    const [existingTools, setExistingTools] = useState<string[]>([]);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [savingForm, setSavingForm] = useState<boolean>(false);

    const agentFilePath = useRef<string>("");

    useEffect(() => {
        initPanel();
    }, [agentCallNode]);

    const initPanel = async () => {
        setLoading(true);
        // get agent file path
        const filePath = await rpcClient.getVisualizerLocation();
        agentFilePath.current = Utils.joinPath(URI.file(filePath.projectUri), "agents.bal").fsPath;
        // fetch tools and agent node
        await fetchExistingTools();
        await fetchAgentNode();
        setLoading(false);
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

    const handleToolSelection = (tool: string) => {
        setSelectedTool(tool);
    };

    const handleAddNewTool = () => {
        onAddNewTool();
    };

    const handleOnSave = async () => {
        console.log(">>> save value", { selectedTool });
        setSavingForm(true);
        // update the agent node
        const updatedAgentNode = cloneDeep(agentNode);
        let toolsValue = updatedAgentNode.properties.tools.value;

        // Simple string manipulation to add the new tool
        if (!selectedTool) {
        } else if (!toolsValue || toolsValue === "[]") {
            toolsValue = `[${selectedTool}]`;
        } else if (typeof toolsValue === "string") {
            if (toolsValue.startsWith("[") && toolsValue.endsWith("]")) {
                const toolsString = toolsValue.substring(1, toolsValue.length - 1);
                const existingTools = toolsString.split(",").map((t) => t.trim());

                if (!existingTools.includes(selectedTool)) {
                    toolsValue = toolsValue.substring(0, toolsValue.length - 1);
                    if (toolsValue.length > 1) {
                        toolsValue += ", ";
                    }
                    toolsValue += selectedTool + "]";
                }
            } else {
                toolsValue = `[${selectedTool}]`;
            }
        } else if (Array.isArray(toolsValue)) {
            if (!toolsValue.includes(selectedTool)) {
                toolsValue.push(selectedTool);
            }
            toolsValue = `[${toolsValue.join(", ")}]`;
        } else {
            toolsValue = `[${selectedTool}]`;
        }

        updatedAgentNode.properties.tools.value = toolsValue;

        const agentResponse = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath: agentFilePath.current, flowNode: updatedAgentNode });
        console.log(">>> response getSourceCode with template ", { agentResponse });

        onSave?.();
        setSavingForm(false);
    };

    const hasExistingTools = existingTools.length > 0;
    const isToolSelected = selectedTool !== null;

    console.log(">>> rendering conditions", { hasExistingTools, isToolSelected });

    return (
        <Container>
            {loading && (
                <LoaderContainer>
                    <RelativeLoader />
                </LoaderContainer>
            )}
            {!loading && hasExistingTools && (
                <>
                    <Column>
                        <Description>Choose a tool to add to the Agent or create a new one.</Description>
                        <Row>
                            <Title>Tools</Title>
                            <Button appearance="icon" tooltip={"Create New Tool"} onClick={handleAddNewTool}>
                                <Codicon name="add" />
                            </Button>
                        </Row>
                        {existingTools.map((tool) => (
                            <ToolItem
                                onClick={() => handleToolSelection(tool)}
                                key={tool}
                                isSelected={selectedTool === tool}
                            >
                                {tool}
                            </ToolItem>
                        ))}
                    </Column>
                    <Footer>
                        <PrimaryButton onClick={handleOnSave} disabled={!isToolSelected || savingForm}>
                            {"Add to Agent"}
                        </PrimaryButton>
                    </Footer>
                </>
            )}
            {!loading && !hasExistingTools && !selectedTool && (
                <Column>
                    <Description>
                        No tools are currently available in your integration. Add a new tool to improve your agent's
                        capabilities.
                    </Description>
                    <HighlightedButton onClick={handleAddNewTool}>
                        <Codicon name="add" iconSx={{ fontSize: 12 }} sx={{ display: "flex", alignItems: "center" }} />
                        Create New Tool
                    </HighlightedButton>
                </Column>
            )}
        </Container>
    );
}
