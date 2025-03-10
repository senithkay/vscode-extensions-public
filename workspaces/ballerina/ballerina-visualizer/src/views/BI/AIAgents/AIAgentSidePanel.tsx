/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    PanelContainer,
    NodeList,
    Category as PanelCategory,
    ExpressionFormField,
    FormField,
    FormValues,
} from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";
import { MemoizedDiagram } from "@wso2-enterprise/bi-diagram";
import {
    BIAvailableNodesRequest,
    Flow,
    FlowNode,
    Branch,
    Category,
    AvailableNode,
    LineRange,
    EVENT_TYPE,
    VisualizerLocation,
    MACHINE_VIEW,
    NodeKind,
    SubPanel,
    SubPanelView,
    CurrentBreakpointsResponse as BreakpointInfo,
    FUNCTION_TYPE,
    ParentPopupData,
    BISearchRequest,
    AgentTool,
    CodeData,
    AgentToolRequest,
} from "@wso2-enterprise/ballerina-core";

import {
    addDraftNodeToDiagram,
    convertBICategoriesToSidePanelCategories,
    convertFunctionCategoriesToSidePanelCategories,
    getContainerTitle,
} from "../../../utils/bi";
import { NodePosition, ResourceAccessorDefinition, STNode } from "@wso2-enterprise/syntax-tree";
import { View, ProgressRing, ProgressIndicator, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { applyModifications, textToModifications } from "../../../utils/utils";
import FormGenerator from "../Forms/FormGenerator";
import { InlineDataMapper } from "../../InlineDataMapper";
import { HelperView } from "../HelperView";
import FormGeneratorNew from "../Forms/FormGeneratorNew";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

interface ColoredTagProps {
    color: string;
}

const ColoredTag = styled(VSCodeTag)<ColoredTagProps>`
    ::part(control) {
        color: var(--button-primary-foreground);
        background-color: ${({ color }: ColoredTagProps) => color};
    }
`;

const SubTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${ThemeColors.ON_SURFACE};
`;

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    TOOL_FORM = "TOOL_FORM",
}

export interface BIFlowDiagramProps {
    showSidePanel: boolean;
    projectPath: string;
    onSubmit: (data: AgentToolRequest) => void;
    onBack?: () => void;
}

export function AIAgentSidePanel(props: BIFlowDiagramProps) {
    const { projectPath, showSidePanel, onBack, onSubmit } = props;
    const { rpcClient } = useRpcContext();

    const [sidePanelView, setSidePanelView] = useState<SidePanelView>(SidePanelView.NODE_LIST);
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [subPanel, setSubPanel] = useState<SubPanel>({ view: SubPanelView.UNDEFINED });
    const [updatedExpressionField, setUpdatedExpressionField] = useState<ExpressionFormField>(undefined);

    const [selectedNodeCodeData, setSelectedNodeCodeData] = useState<CodeData>(undefined);
    const targetRef = useRef<LineRange>({ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } });
    const initialCategoriesRef = useRef<PanelCategory[]>([]);

    useEffect(() => {
        fetchNodes();
    }, []);

    // Use effects to refresh the panel
    useEffect(() => {
        rpcClient.onProjectContentUpdated((state: boolean) => {
            console.log(">>> on project content updated", state);
            fetchNodes();
        });
        rpcClient.onParentPopupSubmitted((parent: ParentPopupData) => {
            console.log(">>> on parent popup submitted", parent);
            fetchNodes();
        });
    }, [rpcClient]);

    const fetchNodes = () => {
        const getNodeRequest: BIAvailableNodesRequest = {
            position: targetRef.current.startLine,
            filePath: projectPath,
        };
        rpcClient
            .getBIDiagramRpcClient()
            .getAvailableNodes(getNodeRequest)
            .then(async (response) => {
                console.log(">>> Available nodes", response);
                if (!response.categories) {
                    console.error(">>> Error getting available nodes", response);
                    return;
                }
                const connectionsCategory = response.categories.filter(
                    (item) => item.metadata.label === "Connections"
                ) as Category[];
                console.log("connectionsCategory", connectionsCategory);
                const convertedCategories = convertBICategoriesToSidePanelCategories(connectionsCategory);
                console.log("convertedCategories", convertedCategories);

                const filteredFunctions = await handleSearchFunction("", FUNCTION_TYPE.REGULAR, false);
                console.log("filteredFunctions", filteredFunctions);

                const filteredCategories = convertedCategories.concat(filteredFunctions);
                setCategories(filteredCategories);
                console.log("filteredCategories", filteredCategories);
                initialCategoriesRef.current = filteredCategories; // Store initial categories
                setSidePanelView(SidePanelView.NODE_LIST);
            });
    };

    const handleSearchFunction = async (
        searchText: string,
        functionType: FUNCTION_TYPE,
        isSearching: boolean = true
    ) => {
        const request: BISearchRequest = {
            position: {
                startLine: targetRef.current.startLine,
                endLine: targetRef.current.endLine,
            },
            filePath: projectPath,
            queryMap: searchText.trim()
                ? {
                      q: searchText,
                      limit: 12,
                      offset: 0,
                      includeAvailableFunctions: "true",
                  }
                : undefined,
            searchKind: "FUNCTION",
        };
        const response = await rpcClient.getBIDiagramRpcClient().search(request);
        if (isSearching && !searchText) {
            setCategories(initialCategoriesRef.current); // Reset the categories list when the search input is empty
            return;
        }
        if (isSearching && searchText) {
            setCategories(
                convertFunctionCategoriesToSidePanelCategories(response.categories as Category[], functionType)
            );
            return;
        }
        if (!response || !response.categories) {
            return [];
        }
        return convertFunctionCategoriesToSidePanelCategories(response.categories as Category[], functionType);
    };

    const handleOnSelectNode = (nodeId: string, metadata?: any) => {
        const { node } = metadata as { node: AvailableNode };
        // default node
        console.log(">>> on select node", { nodeId, metadata });
        setSelectedNodeCodeData(node.codedata);
        setSidePanelView(SidePanelView.TOOL_FORM);
    };

    const handleOnFormBack = () => {
        setSidePanelView(SidePanelView.NODE_LIST);
        setSubPanel({ view: SubPanelView.UNDEFINED });
        setCategories(initialCategoriesRef.current);
    };

    const handleOnAddConnection = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.AddConnectionWizard,
                documentUri: projectPath,
            },
            isPopup: true,
        });
    };

    const handleOnAddFunction = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIFunctionForm,
            },
            isPopup: true,
        });
    };

    const handleSubPanel = (subPanel: SubPanel) => {
        setSubPanel(subPanel);
    };

    const handleToolSubmit = (data: FormValues) => {
        console.log("Tool name", data);
        const toolModel: AgentToolRequest = {
            toolName: data["name"],
            selectedCodeData: selectedNodeCodeData,
        };
        console.log("New Agent Tool:", toolModel);
        onSubmit(toolModel);
        handleOnCancel();
    };

    const updateExpressionField = (data: ExpressionFormField) => {
        setUpdatedExpressionField(data);
    };

    const findSubPanelComponent = (subPanel: SubPanel) => {
        switch (subPanel.view) {
            case SubPanelView.INLINE_DATA_MAPPER:
                return (
                    <InlineDataMapper
                        onClosePanel={handleSubPanel}
                        updateFormField={updateExpressionField}
                        {...subPanel.props?.inlineDataMapper}
                    />
                );
            case SubPanelView.HELPER_PANEL:
                return (
                    <HelperView
                        filePath={subPanel.props.sidePanelData.filePath}
                        position={subPanel.props.sidePanelData.range}
                        updateFormField={updateExpressionField}
                        editorKey={subPanel.props.sidePanelData.editorKey}
                        onClosePanel={handleSubPanel}
                        configurePanelData={subPanel.props.sidePanelData?.configurePanelData}
                    />
                );
            default:
                return null;
        }
    };

    const fields: FormField[] = [
        {
            key: `name`,
            label: "Tool Name",
            type: "IDENTIFIER",
            optional: false,
            editable: true,
            documentation: "Enter the name of the tool.",
            value: "",
            valueTypeConstraint: "",
            enabled: true,
        },
        {
            key: `description`,
            label: "Description",
            type: "EXPRESSION",
            optional: false,
            editable: true,
            documentation: "Enter the description of the tool.",
            value: "",
            valueType: "STRING",
            valueTypeConstraint: "",
            enabled: true,
        },
    ];

    const handleOnCancel = () => {
        setSidePanelView(SidePanelView.NODE_LIST);
    };

    const handleOnBack = () => {
        onBack();
        setSidePanelView(SidePanelView.NODE_LIST);
    };

    return (
        <>
            <PanelContainer
                title={"New Tool Integration"}
                show={showSidePanel}
                onClose={handleOnBack}
                subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
                subPanel={findSubPanelComponent(subPanel)}
            >
                <div>
                    {sidePanelView === SidePanelView.NODE_LIST && categories?.length > 0 && (
                        <NodeList
                            categories={categories}
                            onSelect={handleOnSelectNode}
                            onAddConnection={handleOnAddConnection}
                            onSearchTextChange={(searchText) => handleSearchFunction(searchText, FUNCTION_TYPE.REGULAR)}
                            onAddFunction={handleOnAddFunction}
                            title={"Functions"}
                        />
                    )}
                    {sidePanelView === SidePanelView.TOOL_FORM && (
                        <FormGeneratorNew
                            fileName={projectPath}
                            targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                            fields={fields}
                            onBack={handleOnCancel}
                            onSubmit={handleToolSubmit}
                            submitText={"Save Tool"}
                        />
                    )}
                </div>
            </PanelContainer>
        </>
    );
}
