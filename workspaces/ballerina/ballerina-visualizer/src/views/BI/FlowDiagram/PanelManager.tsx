/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { PanelContainer, NodeList, ExpressionFormField } from "@wso2-enterprise/ballerina-side-panel";
import {
    FlowNode,
    Branch,
    LineRange,
    SubPanel,
    SubPanelView,
    FUNCTION_TYPE,
    Category,
} from "@wso2-enterprise/ballerina-core";
import { InlineDataMapper } from "../../InlineDataMapper";
import { HelperView } from "../HelperView";
import FormGenerator from "../Forms/FormGenerator";
import { getContainerTitle } from "../../../utils/bi";
import { AIToolsList, ToolData } from "./AIToolsList";
import { handleAgentOperations } from "./utils";
import { ModelConfig } from "./ModelConfig";
import { ToolConfig } from "./ToolConfig";
import { AgentConfig } from "./AgentConfig";
import { NewAgent } from "./NewAgent";

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    FORM = "FORM",
    FUNCTION_LIST = "FUNCTION_LIST",
    DATA_MAPPER_LIST = "DATA_MAPPER_LIST",
    NP_FUNCTION_LIST = "NP_FUNCTION_LIST",
    NEW_AGENT = "NEW_AGENT",
    AGENT_TOOL_LIST = "AGENT_TOOL_LIST",
    AGENT_TOOL = "AGENT_TOOL",
    AGENT_MODEL = "AGENT_MODEL",
    AGENT_CONFIG = "AGENT_CONFIG",
}

interface PanelManagerProps {
    showSidePanel: boolean;
    sidePanelView: SidePanelView;
    subPanel: SubPanel;
    categories: any[];
    selectedNode?: FlowNode;
    nodeFormTemplate?: FlowNode;
    selectedClientName?: string;
    showEditForm?: boolean;
    targetLineRange?: LineRange;
    connections?: any[];
    fileName?: string;
    projectPath?: string;
    editForm?: boolean;
    updatedExpressionField?: ExpressionFormField;

    // Action handlers
    onClose: () => void;
    onBack?: () => void;
    onSelectNode: (nodeId: string, metadata?: any) => void;
    onAddConnection?: () => void;
    onAddFunction?: () => void;
    onAddNPFunction?: () => void;
    onAddDataMapper?: () => void;
    onSubmitForm: (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean) => void;
    onDiscardSuggestions: () => void;
    onSubPanel: (subPanel: SubPanel) => void;
    onResetUpdatedExpressionField: () => void;
    onSearchFunction?: (searchText: string, functionType: FUNCTION_TYPE) => void;
    onSearchNpFunction?: (searchText: string, functionType: FUNCTION_TYPE) => void;
    onEditAgent?: () => void;

    // AI Agent handlers
    onSelectTool?: (tool: ToolData, node: FlowNode) => void;
    onDeleteTool?: (tool: ToolData, node: FlowNode) => void;
    onAddTool?: (node: FlowNode) => void;
}

export function PanelManager({
    showSidePanel,
    sidePanelView,
    subPanel,
    categories,
    selectedNode,
    nodeFormTemplate,
    selectedClientName,
    showEditForm,
    targetLineRange,
    connections,
    fileName,
    projectPath,
    editForm,
    updatedExpressionField,
    onClose,
    onBack,
    onSelectNode,
    onAddConnection,
    onAddFunction,
    onAddNPFunction,
    onAddDataMapper,
    onSubmitForm,
    onDiscardSuggestions,
    onSubPanel,
    onResetUpdatedExpressionField,
    onSearchFunction,
    onSearchNpFunction,
    onEditAgent,
    onSelectTool,
    onDeleteTool,
    onAddTool,
}: PanelManagerProps) {
    const findSubPanelComponent = (subPanel: SubPanel) => {
        switch (subPanel.view) {
            case SubPanelView.INLINE_DATA_MAPPER:
                return (
                    <InlineDataMapper
                        onClosePanel={onSubPanel}
                        updateFormField={(data) => onResetUpdatedExpressionField()}
                        {...subPanel.props?.inlineDataMapper}
                    />
                );
            case SubPanelView.HELPER_PANEL:
                return (
                    <HelperView
                        filePath={subPanel.props.sidePanelData.filePath}
                        position={subPanel.props.sidePanelData.range}
                        updateFormField={(data) => onResetUpdatedExpressionField()}
                        editorKey={subPanel.props.sidePanelData.editorKey}
                        onClosePanel={onSubPanel}
                        configurePanelData={subPanel.props.sidePanelData?.configurePanelData}
                    />
                );
            default:
                return null;
        }
    };

    // Helper function to get AI agent tools
    const getAgentTools = (): ToolData[] => {
        if (!selectedNode || selectedNode.codedata.node !== "AGENT_CALL") return [];

        const agentConfig = handleAgentOperations.getAgentConfig(selectedNode);
        return agentConfig?.tools || [];
    };

    const renderPanelContent = () => {
        switch (sidePanelView) {
            case SidePanelView.NODE_LIST:
                return (
                    <NodeList
                        categories={categories}
                        onSelect={onSelectNode}
                        onAddConnection={onAddConnection}
                        onClose={onClose}
                    />
                );

            case SidePanelView.NEW_AGENT:
                return <NewAgent agentCallNode={selectedNode} fileName={fileName} lineRange={targetLineRange} onSave={onClose} />;

            case SidePanelView.AGENT_TOOL_LIST:
                return (
                    <AIToolsList
                        node={selectedNode}
                        tools={getAgentTools()}
                        onSelectTool={onSelectTool}
                        onDeleteTool={onDeleteTool}
                        onAddTool={onAddTool}
                    />
                );

            case SidePanelView.AGENT_TOOL:
                const selectedTool = selectedNode.metadata.data.tools?.find((tool) => tool.name === selectedClientName);
                return <ToolConfig agentCallNode={selectedNode} toolData={selectedTool} onSave={onClose} />;

            case SidePanelView.AGENT_MODEL:
                return <ModelConfig agentCallNode={selectedNode} onSave={onClose} />;

            case SidePanelView.AGENT_CONFIG:
                return <AgentConfig agentCallNode={selectedNode} fileName={fileName} onSave={onClose} />;

            case SidePanelView.FUNCTION_LIST:
                return (
                    <NodeList
                        categories={categories}
                        onSelect={onSelectNode}
                        onSearchTextChange={(searchText) => onSearchFunction(searchText, FUNCTION_TYPE.REGULAR)}
                        onAddFunction={onAddFunction}
                        onClose={onClose}
                        title={"Functions"}
                        onBack={onBack}
                    />
                );

            case SidePanelView.NP_FUNCTION_LIST:
                return (
                    <NodeList
                        categories={categories}
                        onSelect={onSelectNode}
                        onSearchTextChange={(searchText) => onSearchNpFunction(searchText, FUNCTION_TYPE.REGULAR)}
                        onAddFunction={onAddNPFunction}
                        onClose={onClose}
                        title={"Prompt as code"}
                        onBack={onBack}
                    />
                );

            case SidePanelView.DATA_MAPPER_LIST:
                return (
                    <NodeList
                        categories={categories}
                        onSelect={onSelectNode}
                        onSearchTextChange={(searchText) =>
                            onSearchFunction(searchText, FUNCTION_TYPE.EXPRESSION_BODIED)
                        }
                        onAddFunction={onAddDataMapper}
                        onClose={onClose}
                        title={"Data Mappers"}
                        onBack={onBack}
                    />
                );

            case SidePanelView.FORM:
                return (
                    <FormGenerator
                        fileName={fileName}
                        node={selectedNode}
                        nodeFormTemplate={nodeFormTemplate}
                        connections={connections}
                        clientName={selectedClientName}
                        targetLineRange={targetLineRange}
                        projectPath={projectPath}
                        editForm={editForm}
                        onSubmit={onSubmitForm}
                        subPanelView={subPanel.view}
                        openSubPanel={onSubPanel}
                        updatedExpressionField={updatedExpressionField}
                        resetUpdatedExpressionField={onResetUpdatedExpressionField}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <PanelContainer
            title={getContainerTitle(sidePanelView, selectedNode, selectedClientName)}
            show={showSidePanel}
            onClose={onClose}
            onBack={sidePanelView === SidePanelView.FORM && !showEditForm ? onBack : undefined}
            subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
            subPanel={findSubPanelComponent(subPanel)}
        >
            <div onClick={onDiscardSuggestions}>{renderPanelContent()}</div>
        </PanelContainer>
    );
}
