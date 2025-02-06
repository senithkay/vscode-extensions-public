/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    PanelContainer,
    NodeList,
    Category as PanelCategory,
    ExpressionFormField,
} from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";
import { Diagram } from "@wso2-enterprise/bi-diagram";
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
    BIGetFunctionsRequest,
    SubPanel,
    SubPanelView,
    CurrentBreakpointsResponse as BreakpointInfo,
    FUNCTION_TYPE
} from "@wso2-enterprise/ballerina-core";

import {
    addDraftNodeToDiagram,
    convertBICategoriesToSidePanelCategories,
    convertFunctionCategoriesToSidePanelCategories,
    getContainerTitle,
} from "../../../utils/bi";
import { NodePosition, ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import {
    View,
    ViewContent,
    ViewHeader,
    ProgressRing,
    ProgressIndicator,
} from "@wso2-enterprise/ui-toolkit";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { applyModifications, getColorByMethod, textToModifications } from "../../../utils/utils";
import FormGenerator from "../Forms/FormGenerator";
import { InlineDataMapper } from "../../InlineDataMapper";
import { Colors } from "../../../resources/constants";
import { HelperView } from "../HelperView";

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

const ColoredTag = styled(VSCodeTag) <ColoredTagProps>`
    ::part(control) {
        color: var(--button-primary-foreground);
        background-color: ${({ color }: ColoredTagProps) => color};
    }
`;

const SubTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${Colors.ON_SURFACE};
`;

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    FORM = "FORM",
    FUNCTION_LIST = "FUNCTION_LIST",
    DATA_MAPPER_LIST = "DATA_MAPPER_LIST",
}

export interface BIFlowDiagramProps {
    syntaxTree: STNode; // INFO: this is used to make the diagram rerender when code changes
    projectPath: string;
}

export function BIFlowDiagram(props: BIFlowDiagramProps) {
    const { syntaxTree, projectPath } = props;
    const { rpcClient } = useRpcContext();

    const [model, setModel] = useState<Flow>();
    const [suggestedModel, setSuggestedModel] = useState<Flow>();
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelView, setSidePanelView] = useState<SidePanelView>(SidePanelView.NODE_LIST);
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [fetchingAiSuggestions, setFetchingAiSuggestions] = useState(false);
    const [showProgressIndicator, setShowProgressIndicator] = useState(false);
    const [subPanel, setSubPanel] = useState<SubPanel>({ view: SubPanelView.UNDEFINED });
    const [updatedExpressionField, setUpdatedExpressionField] = useState<ExpressionFormField>(undefined);
    const [breakpointInfo, setBreakpointInfo] = useState<BreakpointInfo>();

    const selectedNodeRef = useRef<FlowNode>();
    const nodeTemplateRef = useRef<FlowNode>();
    const topNodeRef = useRef<FlowNode | Branch>();
    const targetRef = useRef<LineRange>();
    const originalFlowModel = useRef<Flow>();
    const suggestedText = useRef<string>();
    const selectedClientName = useRef<string>();
    const initialCategoriesRef = useRef<PanelCategory[]>([]);
    const showEditForm = useRef<boolean>(false);

    useEffect(() => {
        getFlowModel();
    }, [syntaxTree]);

    rpcClient.onParentPopupSubmitted(() => {
        const parent = topNodeRef.current;
        const target = targetRef.current;
        fetchNodesAndAISuggestions(parent, target, false, false);
    });

    const getFlowModel = () => {
        setShowProgressIndicator(true);
        rpcClient.getBIDiagramRpcClient().getBreakpointInfo().then((response) => {
            setBreakpointInfo(response);
            rpcClient
                .getBIDiagramRpcClient()
                .getFlowModel()
                .then((model) => {
                    if (model?.flowModel) {
                        setModel(model.flowModel);
                    }
                })
                .finally(() => {
                    setShowProgressIndicator(false);
                });
        });
    };

    const handleOnCloseSidePanel = () => {
        setShowSidePanel(false);
        setSidePanelView(SidePanelView.NODE_LIST);
        setSubPanel({ view: SubPanelView.UNDEFINED });
        selectedNodeRef.current = undefined;
        nodeTemplateRef.current = undefined;
        topNodeRef.current = undefined;
        targetRef.current = undefined;
        selectedClientName.current = undefined;
        showEditForm.current = false;

        // restore original model
        if (originalFlowModel.current) {
            // const updatedModel = removeDraftNodeFromDiagram(model);
            // setModel(updatedModel);
            getFlowModel();
            originalFlowModel.current = undefined;
            setSuggestedModel(undefined);
            suggestedText.current = undefined;
        }
    };

    const fetchNodesAndAISuggestions = (
        parent: FlowNode | Branch,
        target: LineRange,
        fetchAiSuggestions = true,
        updateFlowModel = true
    ) => {
        const getNodeRequest: BIAvailableNodesRequest = {
            position: target.startLine,
            filePath: model.fileName,
        };
        console.log(">>> get available node request", getNodeRequest);
        // save original model
        originalFlowModel.current = model;
        // show side panel with available nodes
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getAvailableNodes(getNodeRequest)
            .then((response) => {
                console.log(">>> Available nodes", response);
                if (!response.categories) {
                    console.error(">>> Error getting available nodes", response);
                    return;
                }
                const convertedCategories = convertBICategoriesToSidePanelCategories(response.categories as Category[]);
                setCategories(convertedCategories);
                initialCategoriesRef.current = convertedCategories; // Store initial categories
                // add draft node to model
                if (updateFlowModel) {
                    const updatedFlowModel = addDraftNodeToDiagram(model, parent, target);
                    setModel(updatedFlowModel);
                }
                setShowSidePanel(true);
                setSidePanelView(SidePanelView.NODE_LIST);
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });

        if (!fetchAiSuggestions) {
            return;
        }
        // get ai suggestions
        setFetchingAiSuggestions(true);
        const suggestionFetchingTimeout = setTimeout(() => {
            console.log(">>> AI suggestion fetching timeout");
            setFetchingAiSuggestions(false);
        }, 10000); // 10 seconds

        rpcClient
            .getBIDiagramRpcClient()
            .getAiSuggestions({ position: target, filePath: model.fileName })
            .then((model) => {
                console.log(">>> ai suggested new flow", model);
                if (model?.flowModel?.nodes?.length > 0) {
                    setSuggestedModel(model.flowModel);
                    suggestedText.current = model.suggestion;
                }
            })
            .finally(() => {
                clearTimeout(suggestionFetchingTimeout);
                setFetchingAiSuggestions(false);
            });
    };

    const handleOnAddNode = (parent: FlowNode | Branch, target: LineRange) => {
        // clear previous click if had
        if (topNodeRef.current || targetRef.current) {
            console.log(">>> Clearing previous click", {
                topNodeRef: topNodeRef.current,
                targetRef: targetRef.current,
            });
            handleOnCloseSidePanel();
            return;
        }
        // handle add new node
        topNodeRef.current = parent;
        targetRef.current = target;
        fetchNodesAndAISuggestions(parent, target);
    };

    const handleOnAddNodePrompt = (parent: FlowNode | Branch, target: LineRange, prompt: string) => {
        // clear previous click if had
        if (topNodeRef.current || targetRef.current) {
            handleOnCloseSidePanel();
            return;
        }
        // handle add new node
        topNodeRef.current = parent;
        targetRef.current = target;
        // save original model
        originalFlowModel.current = model;
        // get ai suggestions
        setFetchingAiSuggestions(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getAiSuggestions({ position: target, filePath: model.fileName, prompt })
            .then((model) => {
                console.log(">>> flow model with ai suggested nodes", { model, length: model.flowModel.nodes.length });
                if (model?.flowModel?.nodes?.length > 0) {
                    setSuggestedModel(model.flowModel);
                    suggestedText.current = model.suggestion;
                }
            }).finally(() => {
                setFetchingAiSuggestions(false);
            });
    };

    const handleSearchFunction = async (searchText: string, functionType: FUNCTION_TYPE) => {
        const request: BIGetFunctionsRequest = {
            position: {
                startLine: targetRef.current.startLine,
                endLine: targetRef.current.endLine,
            },
            filePath: model.fileName,
            queryMap: searchText.trim()
                ? {
                    q: searchText,
                    limit: 12,
                    offset: 0,
                    includeAvailableFunctions: "true"
                }
                : undefined,
        };
        console.log(">>> Search function request", request);
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getFunctions(request)
            .then((response) => {
                console.log(">>> Searched List of functions", response);
                setCategories(
                    convertFunctionCategoriesToSidePanelCategories(response.categories as Category[], functionType)
                );
                setSidePanelView(
                    functionType === FUNCTION_TYPE.REGULAR
                        ? SidePanelView.FUNCTION_LIST
                        : SidePanelView.DATA_MAPPER_LIST
                );
                setShowSidePanel(true);
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });
    };

    const handleOnSelectNode = (nodeId: string, metadata?: any) => {
        const { node, category } = metadata as { node: AvailableNode; category?: string };
        // node is function
        const nodeType: NodeKind = node.codedata.node;
        if (nodeType === "FUNCTION") {
            setShowProgressIndicator(true);
            rpcClient
                .getBIDiagramRpcClient()
                .getFunctions({
                    position: { startLine: targetRef.current.startLine, endLine: targetRef.current.endLine },
                    filePath: model.fileName,
                    queryMap: undefined,
                })
                .then((response) => {
                    console.log(">>> List of functions", response);
                    setCategories(
                        convertFunctionCategoriesToSidePanelCategories(
                            response.categories as Category[], FUNCTION_TYPE.REGULAR
                        )
                    );
                    setSidePanelView(SidePanelView.FUNCTION_LIST);
                    setShowSidePanel(true);
                })
                .finally(() => {
                    setShowProgressIndicator(false);
                });
        } else if (nodeType === "DATA_MAPPER_CALL") {
            setShowProgressIndicator(true);
            rpcClient
                .getBIDiagramRpcClient()
                .getFunctions({
                    position: { startLine: targetRef.current.startLine, endLine: targetRef.current.endLine },
                    filePath: model.fileName,
                    queryMap: undefined,
                })
                .then((response) => {
                    setCategories(
                        convertFunctionCategoriesToSidePanelCategories(
                            response.categories as Category[], FUNCTION_TYPE.EXPRESSION_BODIED
                        )
                    );
                    setSidePanelView(SidePanelView.DATA_MAPPER_LIST);
                    setShowSidePanel(true);
                })
                .finally(() => {
                    setShowProgressIndicator(false);
                });
        } else {
            // default node
            console.log(">>> on select panel node", { nodeId, metadata });
            selectedClientName.current = category;
            setShowProgressIndicator(true);
            rpcClient
                .getBIDiagramRpcClient()
                .getNodeTemplate({
                    position: targetRef.current.startLine,
                    filePath: model.fileName,
                    id: node.codedata,
                })
                .then((response) => {
                    console.log(">>> FlowNode template", response);
                    selectedNodeRef.current = response.flowNode;
                    showEditForm.current = false;
                    setSidePanelView(SidePanelView.FORM);
                    setShowSidePanel(true);
                })
                .finally(() => {
                    setShowProgressIndicator(false);
                });
        }
    };

    const handleOnFormSubmit = (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean) => {
        if (!updatedNode) {
            console.log(">>> No updated node found");
            updatedNode = selectedNodeRef.current;
        }
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({
                filePath: model.fileName,
                flowNode: updatedNode,
                isFunctionNodeUpdate: isDataMapperFormUpdate,
            })
            .then((response) => {
                console.log(">>> Updated source code", response);
                if (response.textEdits) {
                    // clear memory
                    selectedNodeRef.current = undefined;
                    handleOnCloseSidePanel();
                } else {
                    console.error(">>> Error updating source code", response);
                    // handle error
                }
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });
    };

    const handleOnDeleteNode = (node: FlowNode) => {
        console.log(">>> on delete node", node);
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .deleteFlowNode({
                filePath: model.fileName,
                flowNode: node,
            })
            .then((response) => {
                console.log(">>> Updated source code after delete", response);
                if (response.textEdits) {
                    // clear memory
                    selectedNodeRef.current = undefined;
                    handleOnCloseSidePanel();
                } else {
                    console.error(">>> Error updating source code", response);
                    // handle error
                }
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });
    };

    const handleOnAddComment = (comment: string, target: LineRange) => {
        console.log(">>> on add comment", { comment, target });
        const updatedNode: FlowNode = {
            id: "40715",
            metadata: {
                label: "Comment",
                description: "This is a comment",
            },
            codedata: {
                node: "COMMENT",
                lineRange: {
                    fileName: "currency.bal",
                    ...target,
                },
            },
            returning: false,
            properties: {
                comment: {
                    metadata: {
                        label: "Comment",
                        description: "Comment to describe the flow",
                    },
                    valueType: "STRING",
                    value: `\n${comment}\n\n`, // HACK: add extra new lines to get last position right
                    optional: false,
                    advanced: false,
                    editable: true,
                },
            },
            branches: [],
            flags: 0,
        };

        rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({
                filePath: model.fileName,
                flowNode: updatedNode,
            })
            .then((response) => {
                console.log(">>> Updated source code", response);
                if (response.textEdits) {
                    // clear memory
                    selectedNodeRef.current = undefined;
                    handleOnCloseSidePanel();
                } else {
                    console.error(">>> Error updating source code", response);
                    // handle error
                }
            });
    };

    const handleOnEditNode = (node: FlowNode) => {
        console.log(">>> on edit node", node);
        selectedNodeRef.current = node;
        if (suggestedText.current) {
            // use targetRef from suggested model
        } else {
            topNodeRef.current = undefined;
            targetRef.current = node.codedata.lineRange;
        }
        // setSidePanelView(SidePanelView.FORM);
        // setShowSidePanel(true);
        // return;
        if (!targetRef.current) {
            return;
        }
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: targetRef.current.startLine,
                filePath: model.fileName,
                id: node.codedata,
            })
            .then((response) => {
                nodeTemplateRef.current = response.flowNode;
                showEditForm.current = true;
                setSidePanelView(SidePanelView.FORM);
                setShowSidePanel(true);
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });
    };

    const handleOnFormBack = () => {
        if (sidePanelView === SidePanelView.FUNCTION_LIST || sidePanelView === SidePanelView.DATA_MAPPER_LIST) {
            // Reset categories to the initial available nodes
            setCategories(initialCategoriesRef.current);
            setSidePanelView(SidePanelView.NODE_LIST);
        } else {
            setSidePanelView(SidePanelView.NODE_LIST);
        }
        // clear memory
        selectedNodeRef.current = undefined;
    };

    const handleOnAddConnection = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.AddConnectionWizard,
                documentUri: model.fileName,
                metadata: {
                    target: targetRef.current.startLine,
                },
            },
            isPopup: true,
        });
    };

    const handleOnEditConnection = (connectionName: string) => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EditConnectionWizard,
                identifier: connectionName,
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
        });
    };

    const handleOnGoToSource = (node: FlowNode) => {
        const targetPosition: NodePosition = {
            startLine: node.codedata.lineRange.startLine.line,
            startColumn: node.codedata.lineRange.startLine.offset,
            endLine: node.codedata.lineRange.endLine.line,
            endColumn: node.codedata.lineRange.endLine.offset,
        };
        rpcClient.getCommonRpcClient().goToSource({ position: targetPosition });
    };

    const handleAddBreakpoint = (node: FlowNode) => {
        const request = {
            filePath: model?.fileName,
            breakpoint: {
                line: node.codedata.lineRange.startLine.line,
                column: node.codedata.lineRange.startLine?.offset
            }
        };

        rpcClient.getBIDiagramRpcClient().addBreakpointToSource(request);
    }

    const handleRemoveBreakpoint = (node: FlowNode) => {
        const request = {
            filePath: model?.fileName,
            breakpoint: {
                line: node.codedata.lineRange.startLine.line,
                column: node.codedata.lineRange.startLine?.offset
            }
        };

        rpcClient.getBIDiagramRpcClient().removeBreakpointFromSource(request);
    }

    // ai suggestions callbacks
    const onAcceptSuggestions = () => {
        if (!suggestedModel) {
            return;
        }
        // save suggested text
        const modifications = textToModifications(suggestedText.current, {
            startLine: targetRef.current.startLine.line,
            startColumn: targetRef.current.startLine.offset,
            endLine: targetRef.current.endLine.line,
            endColumn: targetRef.current.endLine.offset,
        });
        applyModifications(rpcClient, modifications);

        // clear diagram
        handleOnCloseSidePanel();
        onDiscardSuggestions();
    };

    const onDiscardSuggestions = () => {
        if (!suggestedModel) {
            return;
        }
        setSuggestedModel(undefined);
        suggestedText.current = undefined;
    };

    const handleOpenView = async (filePath: string, position: NodePosition) => {
        console.log(">>> open view: ", { filePath, position });
        const context: VisualizerLocation = {
            documentUri: filePath,
            position: position,
        };
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
    };

    const handleEdit = () => {
        const context: VisualizerLocation = {
            view: MACHINE_VIEW.BIFunctionForm,
            identifier: (props?.syntaxTree as ResourceAccessorDefinition).functionName.value,
        };
        rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
    };

    const handleSubPanel = (subPanel: SubPanel) => {
        setSubPanel(subPanel);
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

    const handleResetUpdatedExpressionField = () => {
        setUpdatedExpressionField(undefined);
    };

    const method = (props?.syntaxTree as ResourceAccessorDefinition).functionName.value;
    const flowModel = originalFlowModel.current && suggestedModel ? suggestedModel : model;

    const isResource = STKindChecker.isResourceAccessorDefinition(props.syntaxTree);
    const ResourceDiagramTitle = (
        <>
            <span>{"Resource"}:</span>
            <ColoredTag color={getColorByMethod(method)}>{method}</ColoredTag>
            <SubTitle>{getResourcePath(syntaxTree as ResourceAccessorDefinition)}</SubTitle>
        </>
    );
    const FunctionDiagramTitle = (
        <>
            <span>{"Function"}:</span>
            <SubTitle>{method}</SubTitle>
        </>
    );

    return (
        <>
            <View>
                <ViewHeader
                    title={isResource ? ResourceDiagramTitle : FunctionDiagramTitle}
                    icon={isResource ? "bi-http-service" : "bi-function"}
                    iconSx={{ fontSize: "16px" }}
                    onEdit={handleEdit}
                ></ViewHeader>
                {(showProgressIndicator || fetchingAiSuggestions) && model && <ProgressIndicator color={Colors.PRIMARY} />}
                <ViewContent padding>
                    <Container>
                        {!model && (
                            <SpinnerContainer>
                                <ProgressRing color={Colors.PRIMARY} />
                            </SpinnerContainer>
                        )}
                        {model && (
                            <Diagram
                                model={flowModel}
                                onAddNode={handleOnAddNode}
                                onAddNodePrompt={handleOnAddNodePrompt}
                                onDeleteNode={handleOnDeleteNode}
                                onAddComment={handleOnAddComment}
                                onNodeSelect={handleOnEditNode}
                                onConnectionSelect={handleOnEditConnection}
                                goToSource={handleOnGoToSource}
                                addBreakpoint={handleAddBreakpoint}
                                removeBreakpoint={handleRemoveBreakpoint}
                                openView={handleOpenView}
                                suggestions={{
                                    fetching: fetchingAiSuggestions,
                                    onAccept: onAcceptSuggestions,
                                    onDiscard: onDiscardSuggestions,
                                }}
                                projectPath={projectPath}
                                breakpointInfo={breakpointInfo}
                            />
                        )}
                    </Container>
                </ViewContent>
            </View>
            <PanelContainer
                title={getContainerTitle(sidePanelView, selectedNodeRef.current, selectedClientName.current)}
                show={showSidePanel}
                onClose={handleOnCloseSidePanel}
                onBack={
                    sidePanelView === SidePanelView.FORM && topNodeRef.current !== undefined
                        ? handleOnFormBack
                        : undefined
                }
                subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
                subPanel={findSubPanelComponent(subPanel)}
            >
                <div onClick={onDiscardSuggestions}>
                    {sidePanelView === SidePanelView.NODE_LIST && categories?.length > 0 && (
                        <NodeList
                            categories={categories}
                            onSelect={handleOnSelectNode}
                            onAddConnection={handleOnAddConnection}
                            onClose={handleOnCloseSidePanel}
                        />
                    )}
                    {sidePanelView === SidePanelView.FUNCTION_LIST && categories?.length > 0 && (
                        <NodeList
                            categories={categories}
                            onSelect={handleOnSelectNode}
                            onSearchTextChange={(searchText) => handleSearchFunction(searchText, FUNCTION_TYPE.REGULAR)}
                            onAddFunction={handleOnAddFunction}
                            onClose={handleOnCloseSidePanel}
                            title={"Functions"}
                            onBack={handleOnFormBack}
                        />
                    )}
                    {sidePanelView === SidePanelView.DATA_MAPPER_LIST && categories?.length > 0 && (
                        <NodeList
                            categories={categories}
                            onSelect={handleOnSelectNode}
                            onSearchTextChange={(searchText) => handleSearchFunction(searchText, FUNCTION_TYPE.EXPRESSION_BODIED)}
                            onClose={handleOnCloseSidePanel}
                            title={"Data Mappers"}
                            onBack={handleOnFormBack}
                        />
                    )}
                    {sidePanelView === SidePanelView.FORM && (
                        <FormGenerator
                            fileName={model.fileName}
                            node={selectedNodeRef.current}
                            nodeFormTemplate={nodeTemplateRef.current}
                            connections={model.connections}
                            clientName={selectedClientName.current}
                            targetLineRange={targetRef.current}
                            projectPath={projectPath}
                            editForm={showEditForm.current}
                            onSubmit={handleOnFormSubmit}
                            subPanelView={subPanel.view}
                            openSubPanel={handleSubPanel}
                            updatedExpressionField={updatedExpressionField}
                            resetUpdatedExpressionField={handleResetUpdatedExpressionField}
                        />
                    )}
                </div>
            </PanelContainer>
        </>
    );
}

function getResourcePath(resource: ResourceAccessorDefinition) {
    let resourcePath = "";
    resource.relativeResourcePath?.forEach((path, index) => {
        resourcePath += STKindChecker.isResourcePathSegmentParam(path) ? path.source : path?.value;
    });
    return resourcePath;
}
