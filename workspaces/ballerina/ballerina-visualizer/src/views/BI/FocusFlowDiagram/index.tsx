/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    Category as PanelCategory,
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
    CurrentBreakpointsResponse as BreakpointInfo,
    ParentPopupData,
} from "@wso2-enterprise/ballerina-core";

import {
    addDraftNodeToDiagram,
    convertBICategoriesToSidePanelCategories,
    getFlowNodeForNaturalFunction,
    isNaturalFunction,
} from "../../../utils/bi";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { View, ProgressRing, ProgressIndicator, ThemeColors } from "@wso2-enterprise/ui-toolkit";

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

export const BI_FOCUS_FLOW_DIAGRAM = {
    NP_FUNCTION: "NP_FUNCTION",
} as const;

export type BIFocusFlowDiagramView = typeof BI_FOCUS_FLOW_DIAGRAM[keyof typeof BI_FOCUS_FLOW_DIAGRAM];

export interface BIFocusFlowDiagramProps {
    syntaxTree: STNode; // INFO: this is used to make the diagram rerender when code changes
    projectPath: string;
    filePath: string;
    view: BIFocusFlowDiagramView;
    onUpdate: () => void;
    onReady: (fileName: string) => void;
}

export function BIFocusFlowDiagram(props: BIFocusFlowDiagramProps) {
    const { syntaxTree, projectPath, filePath, onUpdate, onReady, view } = props;
    const { rpcClient } = useRpcContext();

    const [model, setModel] = useState<Flow>();
    const [suggestedModel, setSuggestedModel] = useState<Flow>();
    const [showProgressIndicator, setShowProgressIndicator] = useState(false);
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

    useEffect(() => {
        rpcClient.onProjectContentUpdated((state: boolean) => {
            console.log(">>> on project content updated", state);
            fetchNodes(topNodeRef.current, targetRef.current, true);
        });
        rpcClient.onParentPopupSubmitted((parent: ParentPopupData) => {
            console.log(">>> on parent popup submitted", parent);
            const toNode = topNodeRef.current;
            const target = targetRef.current;
            fetchNodes(toNode, target, false);
        });
    }, [rpcClient]);

    const getFlowModel = () => {
        setShowProgressIndicator(true);
        onUpdate();
        rpcClient
            .getBIDiagramRpcClient()
            .getBreakpointInfo()
            .then((response) => {
                setBreakpointInfo(response);
                rpcClient
                    .getBIDiagramRpcClient()
                    .getFlowModel()
                    .then((model) => {
                        if (model?.flowModel) {
                            if (isNaturalFunction(syntaxTree, view)) {
                                rpcClient
                                    .getBIDiagramRpcClient()
                                    .getFunctionNode({
                                        projectPath,
                                        fileName: filePath,
                                        functionName: syntaxTree.functionName.value
                                    })
                                    .then((node) => {
                                        if (node?.functionDefinition) {
                                            const flowNode = getFlowNodeForNaturalFunction(node.functionDefinition);
                                            model.flowModel.nodes.push(flowNode);
                                            setModel(model.flowModel);
                                            onReady(filePath);
                                        }
                                    })
                                    .finally(() => {
                                        setShowProgressIndicator(false);
                                        onReady(undefined);
                                    });
                            }
                        }
                    })
            });
    };

    const handleOnCloseSidePanel = () => {
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

    const fetchNodes = (
        parent: FlowNode | Branch,
        target: LineRange,
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
                ];
                const filteredCategories = response.categories.map((category) => ({
                    ...category,
                    items: category?.items?.filter(
                        (item) =>
                            !("codedata" in item) ||
                            !notSupportedCategories.includes((item as AvailableNode).codedata?.node)
                    ),
                })) as Category[];
                const convertedCategories = convertBICategoriesToSidePanelCategories(filteredCategories);
                initialCategoriesRef.current = convertedCategories; // Store initial categories
                // add draft node to model
                if (updateFlowModel) {
                    const updatedFlowModel = addDraftNodeToDiagram(model, parent, target);
                    setModel(updatedFlowModel);
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

    const handleOnFormSubmit = (updatedNode?: FlowNode) => {
        if (!updatedNode) {
            console.log(">>> No updated node found");
            updatedNode = selectedNodeRef.current;
        }
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({
                filePath: model.fileName,
                flowNode: updatedNode
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

    const handleOnEditNode = (node: FlowNode) => {
        console.log(">>> on edit node", node);
        selectedNodeRef.current = node;
        if (suggestedText.current) {
            // use targetRef from suggested model
        } else {
            topNodeRef.current = undefined;
            targetRef.current = node.codedata.lineRange;
        }
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
                const nodesWithCustomForms = ["IF", "FORK"];
                // if node doesn't have properties. don't show edit form
                if (!response.flowNode.properties && !nodesWithCustomForms.includes(response.flowNode.codedata.node)) {
                    console.log(">>> Node doesn't have properties. Don't show edit form", response.flowNode);
                    setShowProgressIndicator(false);
                    showEditForm.current = false;
                    return;
                }

                nodeTemplateRef.current = response.flowNode;
                showEditForm.current = true;
            })
            .finally(() => {
                setShowProgressIndicator(false);
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
                column: node.codedata.lineRange.startLine?.offset,
            },
        };

        rpcClient.getBIDiagramRpcClient().addBreakpointToSource(request);
    };

    const handleRemoveBreakpoint = (node: FlowNode) => {
        const request = {
            filePath: model?.fileName,
            breakpoint: {
                line: node.codedata.lineRange.startLine.line,
                column: node.codedata.lineRange.startLine?.offset,
            },
        };

        rpcClient.getBIDiagramRpcClient().removeBreakpointFromSource(request);
    };

    const handleOpenView = async (filePath: string, position: NodePosition) => {
        console.log(">>> open view: ", { filePath, position });
        const context: VisualizerLocation = {
            documentUri: filePath,
            position: position,
        };
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
    };

    const flowModel = originalFlowModel.current && suggestedModel ? suggestedModel : model;

    const memoizedDiagramProps = useMemo(
        () => ({
            model: flowModel,
            onAddComment: handleOnAddComment,
            onNodeSelect: handleOnEditNode,
            onNodeSave: handleOnFormSubmit,
            goToSource: handleOnGoToSource,
            addBreakpoint: handleAddBreakpoint,
            removeBreakpoint: handleRemoveBreakpoint,
            openView: handleOpenView,
            projectPath,
            breakpointInfo
        }),
        [flowModel, projectPath, breakpointInfo]
    );

    return (
        <>
            <View>
                {(showProgressIndicator) && model && (
                    <ProgressIndicator color={ThemeColors.PRIMARY} />
                )}
                <Container>
                    {!model && (
                        <SpinnerContainer>
                            <ProgressRing color={ThemeColors.PRIMARY} />
                        </SpinnerContainer>
                    )}
                    {model && <MemoizedDiagram {...memoizedDiagramProps} />}
                </Container>
            </View>
        </>
    );
}
