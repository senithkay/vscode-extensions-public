/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { PanelContainer, NodeList, Category as PanelCategory, FormField } from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";
import { Diagram } from "@wso2-enterprise/eggplant-diagram";
import {
    EggplantAvailableNodesRequest,
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
} from "@wso2-enterprise/ballerina-core";
import {
    addDraftNodeToDiagram,
    convertEggplantCategoriesToSidePanelCategories,
    convertFunctionCategoriesToSidePanelCategories,
    getContainerTitle,
} from "../../../utils/eggplant";
import { NodePosition, ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { applyModifications, getColorByMethod, textToModifications } from "../../../utils/utils";
import FormGenerator from "../Forms/FormGenerator";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
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

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    FORM = "FORM",
    FUNCTION_LIST = "FUNCTION_LIST",
}

export interface EggplantFlowDiagramProps {
    syntaxTree: STNode; // INFO: this is used to make the diagram rerender when code changes
    projectPath: string;
}

export function EggplantFlowDiagram(props: EggplantFlowDiagramProps) {
    const { syntaxTree, projectPath } = props;
    const { rpcClient } = useRpcContext();

    const [model, setModel] = useState<Flow>();
    const [suggestedModel, setSuggestedModel] = useState<Flow>();
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelView, setSidePanelView] = useState<SidePanelView>(SidePanelView.NODE_LIST);
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [fetchingAiSuggestions, setFetchingAiSuggestions] = useState(false);

    const selectedNodeRef = useRef<FlowNode>();
    const nodeTemplateRef = useRef<FlowNode>();
    const topNodeRef = useRef<FlowNode | Branch>();
    const targetRef = useRef<LineRange>();
    const originalFlowModel = useRef<Flow>();
    const suggestedText = useRef<string>();
    const selectedClientName = useRef<string>();

    useEffect(() => {
        console.log(">>> Updating sequence model...", syntaxTree);
        getSequenceModel();
    }, [syntaxTree]);

    rpcClient.onParentPopupSubmitted(() => {
        // TODO: Fetch the newly added data from the popup view
    });

    const getSequenceModel = () => {
        rpcClient
            .getEggplantDiagramRpcClient()
            .getFlowModel()
            .then((model) => {
                setModel(model.flowModel);
            });
    };

    const handleOnCloseSidePanel = () => {
        setShowSidePanel(false);
        setSidePanelView(SidePanelView.NODE_LIST);
        selectedNodeRef.current = undefined;
        nodeTemplateRef.current = undefined;
        topNodeRef.current = undefined;
        targetRef.current = undefined;
        selectedClientName.current = undefined;

        // restore original model
        if (originalFlowModel.current) {
            // const updatedModel = removeDraftNodeFromDiagram(model);
            // setModel(updatedModel);
            getSequenceModel();
            originalFlowModel.current = undefined;
            setSuggestedModel(undefined);
            suggestedText.current = undefined;
        }
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
        const getNodeRequest: EggplantAvailableNodesRequest = {
            position: target,
            filePath: model.fileName,
        };
        console.log(">>> get available node request", getNodeRequest);
        // save original model
        originalFlowModel.current = model;
        // show side panel with available nodes
        rpcClient
            .getEggplantDiagramRpcClient()
            .getAvailableNodes(getNodeRequest)
            .then((response) => {
                console.log(">>> Available nodes", response);
                if (!response.categories) {
                    console.error(">>> Error getting available nodes", response);
                    return;
                }
                setCategories(convertEggplantCategoriesToSidePanelCategories(response.categories as Category[]));
                // add draft node to model
                const updatedFlowModel = addDraftNodeToDiagram(model, parent, target);

                setModel(updatedFlowModel);
                setShowSidePanel(true);
                setSidePanelView(SidePanelView.NODE_LIST);
            });
        // get ai suggestions
        setFetchingAiSuggestions(true);
        const suggestionFetchingTimeout = setTimeout(() => {
            console.log(">>> AI suggestion fetching timeout");
            setFetchingAiSuggestions(false);
        }, 10000); // 10 seconds

        rpcClient
            .getEggplantDiagramRpcClient()
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

    const handleSearchFunction = (searchText: string) => {
        // TODO: Fix incosistency in the search and re-nable search through LS
        // const searchQueryMap: Map<string, string> = new Map<string, string>();
        // searchQueryMap.set("q", searchText);
        // const request: EggplantGetFunctionsRequest = {
        //     position: {startLine: targetRef.current.startLine, endLine: targetRef.current.endLine},
        //     filePath: model.fileName,
        //     queryMap: searchText
        // };
        // rpcClient.getEggplantDiagramRpcClient().getFunctions(request).then((response) => {
        //     console.log(">>> Searched List of functions", response);
        //     setCategories(convertFunctionCategoriesToSidePanelCategories(response.categories as Category[]));
        //     setShowSidePanel(true);
        //     setSidePanelView(SidePanelView.FUNCTION_LIST);
        // });
    };

    const handleOnSelectNode = (nodeId: string, metadata?: any) => {
        const { node, category } = metadata as { node: AvailableNode; category?: string };
        // node is function
        const nodeType: NodeKind = node.codedata.node;
        if (nodeType === "FUNCTION") {
            rpcClient
                .getEggplantDiagramRpcClient()
                .getFunctions({
                    position: { startLine: targetRef.current.startLine, endLine: targetRef.current.endLine },
                    filePath: model.fileName,
                    queryMap: undefined,
                })
                .then((response) => {
                    console.log(">>> List of functions", response);
                    setCategories(convertFunctionCategoriesToSidePanelCategories(response.categories as Category[]));
                    setSidePanelView(SidePanelView.FUNCTION_LIST);
                    setShowSidePanel(true);
                });
        } else {
            // default node
            console.log(">>> on select panel node", { nodeId, metadata });
            selectedClientName.current = category;
            rpcClient
                .getEggplantDiagramRpcClient()
                .getNodeTemplate({
                    position: targetRef.current.startLine,
                    filePath: model.fileName,
                    id: node.codedata,
                })
                .then((response) => {
                    console.log(">>> FlowNode template", response);
                    selectedNodeRef.current = response.flowNode;
                    setSidePanelView(SidePanelView.FORM);
                    setShowSidePanel(true);
                });
        }
    };

    const handleOnFormSubmit = (updatedNode?: FlowNode) => {
        if (!updatedNode) {
            console.log(">>> No updated node found");
            updatedNode = selectedNodeRef.current;
        }

        rpcClient
            .getEggplantDiagramRpcClient()
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

    const handleOnDeleteNode = (node: FlowNode) => {
        console.log(">>> on delete node", node);

        rpcClient
            .getEggplantDiagramRpcClient()
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
                    editable: true,
                },
            },
            branches: [],
            flags: 0,
        };

        rpcClient
            .getEggplantDiagramRpcClient()
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

        rpcClient
            .getEggplantDiagramRpcClient()
            .getNodeTemplate({
                position: targetRef.current.startLine,
                filePath: model.fileName,
                id: node.codedata,
            })
            .then((response) => {
                nodeTemplateRef.current = response.flowNode;
                setSidePanelView(SidePanelView.FORM);
                setShowSidePanel(true);
            });
    };

    const handleOnFormBack = () => {
        setSidePanelView(SidePanelView.NODE_LIST);
        // clear memory
        selectedNodeRef.current = undefined;
    };

    const handleOnAddConnection = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.AddConnectionWizard,
            },
            isPopup: true,
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

    const method = (props?.syntaxTree as ResourceAccessorDefinition).functionName.value;
    const flowModel = originalFlowModel.current && suggestedModel ? suggestedModel : model;

    const DiagramTitle = (
        <React.Fragment>
            <span>Resource:</span>
            <ColoredTag color={getColorByMethod(method)}>{method}</ColoredTag>
            <span>{getResourcePath(syntaxTree as ResourceAccessorDefinition)}</span>
        </React.Fragment>
    );

    return (
        <>
            <View>
                <ViewHeader title={DiagramTitle} codicon="globe" onEdit={handleOnFormBack}></ViewHeader>
                <ViewContent padding>
                    <Container>
                        {model && (
                            <Diagram
                                model={flowModel}
                                onAddNode={handleOnAddNode}
                                onDeleteNode={handleOnDeleteNode}
                                onAddComment={handleOnAddComment}
                                onNodeSelect={handleOnEditNode}
                                goToSource={handleOnGoToSource}
                                openView={handleOpenView}
                                suggestions={{
                                    fetching: fetchingAiSuggestions,
                                    onAccept: onAcceptSuggestions,
                                    onDiscard: onDiscardSuggestions,
                                }}
                                projectPath={projectPath}
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
            >
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
                        onSearchTextChange={handleSearchFunction}
                        onClose={handleOnCloseSidePanel}
                        title={"Functions"}
                        onBack={handleOnFormBack}
                    />
                )}
                {sidePanelView === SidePanelView.FORM && (
                    <FormGenerator
                        node={selectedNodeRef.current}
                        nodeFormTemplate={nodeTemplateRef.current}
                        connections={model.connections}
                        clientName={selectedClientName.current}
                        targetLineRange={targetRef.current}
                        projectPath={projectPath}
                        onSubmit={handleOnFormSubmit}
                    />
                )}
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
