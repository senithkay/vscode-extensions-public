/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { FlowNode } from "@wso2-enterprise/ballerina-core";
import { Button, ThemeColors, Icon } from "@wso2-enterprise/ui-toolkit";

// Define the ToolData interface to match what we're using
export interface ToolData {
    id?: string;
    name: string;
    description: string;
}

const Container = styled.div`
    padding: 16px;
`;

const ToolsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
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
    background-color: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-widget-border);
`;

const ToolInfo = styled.div`
    flex: 1;
`;

const ToolName = styled.div`
    font-weight: 500;
    margin-bottom: 4px;
`;

const ToolDescription = styled.div`
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
`;

const NoTools = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    color: var(--vscode-descriptionForeground);
`;

interface AIToolsListProps {
    node: FlowNode;
    tools: ToolData[];
    onSelectTool: (tool: ToolData, node: FlowNode) => void;
    onDeleteTool: (tool: ToolData, node: FlowNode) => void;
    onAddTool: (node: FlowNode) => void;
}

/**
 * AIToolsList - Displays a list of tools for an AI agent and allows adding, configuring, and removing tools
 */
export function AIToolsList({ node, tools, onSelectTool, onDeleteTool, onAddTool }: AIToolsListProps): JSX.Element {
    return (
        <Container>
            <NoTools>No tools added. Add tools to enhance your agent's capabilities.</NoTools>
        </Container>
    );
}
