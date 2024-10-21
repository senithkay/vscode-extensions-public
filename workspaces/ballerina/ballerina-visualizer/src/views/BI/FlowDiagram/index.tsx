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
    TRIGGER_CHARACTERS,
    TriggerCharacter,
    SubPanel,
    SubPanelView,
} from "@wso2-enterprise/ballerina-core";

import {
    addDraftNodeToDiagram,
    convertBalCompletion,
    convertBICategoriesToSidePanelCategories,
    convertFunctionCategoriesToSidePanelCategories,
    convertToFnSignature,
    getContainerTitle,
} from "../../../utils/bi";
import { NodePosition, ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import {
    View,
    ViewContent,
    ViewHeader,
    CompletionItem,
    ProgressRing,
    ProgressIndicator,
} from "@wso2-enterprise/ui-toolkit";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { applyModifications, getColorByMethod, textToModifications } from "../../../utils/utils";
import FormGenerator from "../Forms/FormGenerator";
import { InlineDataMapper } from "../../InlineDataMapper";
import { debounce, set } from "lodash";
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

const ColoredTag = styled(VSCodeTag)<ColoredTagProps>`
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
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const [showProgressIndicator, setShowProgressIndicator] = useState(false);
    const [showSubPanel, setShowSubPanel] = useState(false);
    const [subPanel, setSubPanel] = useState<SubPanel>({ view: SubPanelView.UNDEFINED });
    const [updatedExpressionField, setUpdatedExpressionField] = useState<ExpressionFormField>(undefined);

    const triggerCompletionOnNextRequest = useRef<boolean>(false);
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
        console.log(">>> Updating sequence model...", syntaxTree);
        getSequenceModel();
    }, [syntaxTree]);

    rpcClient.onParentPopupSubmitted(() => {
        const parent = topNodeRef.current;
        const target = targetRef.current;

        fetchNodesAndAISuggestions(parent, target);
    });

    const getSequenceModel = () => {
        setShowProgressIndicator(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getFlowModel()
            .then((model) => {
                setModel(model.flowModel);
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });
    };

    const clearExpressionEditor = () => {
        // clear memory for expression editor
        setCompletions([]);
        setFilteredCompletions([]);
        triggerCompletionOnNextRequest.current = false;
    };

    const handleOnCloseSidePanel = () => {
        setShowSidePanel(false);
        setSidePanelView(SidePanelView.NODE_LIST);
        setShowSubPanel(false);
        setSubPanel({ view: SubPanelView.UNDEFINED });
        clearExpressionEditor();
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
            getSequenceModel();
            originalFlowModel.current = undefined;
            setSuggestedModel(undefined);
            suggestedText.current = undefined;
        }
    };

    const fetchNodesAndAISuggestions = (parent: FlowNode | Branch, target: LineRange) => {
        const getNodeRequest: BIAvailableNodesRequest = {
            position: target,
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
                const updatedFlowModel = addDraftNodeToDiagram(model, parent, target);

                setModel(updatedFlowModel);
                setShowSidePanel(true);
                setSidePanelView(SidePanelView.NODE_LIST);
            })
            .finally(() => {
                setShowProgressIndicator(false);
            });
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

    const handleSearchFunction = async (searchText: string) => {
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
                setCategories(convertFunctionCategoriesToSidePanelCategories(response.categories as Category[]));
                setSidePanelView(SidePanelView.FUNCTION_LIST);
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
                    setCategories(convertFunctionCategoriesToSidePanelCategories(response.categories as Category[]));
                    setSidePanelView(SidePanelView.FUNCTION_LIST);
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
        if (sidePanelView === SidePanelView.FUNCTION_LIST) {
            // Reset categories to the initial available nodes
            setCategories(initialCategoriesRef.current);
            setSidePanelView(SidePanelView.NODE_LIST);
        } else {
            setSidePanelView(SidePanelView.NODE_LIST);
        }
        // clear memory
        clearExpressionEditor();
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

    const debouncedGetCompletions = debounce(
        async (value: string, offset: number, triggerCharacter?: string, onlyVariables?: boolean) => {
            let expressionCompletions: CompletionItem[] = [];
            const effectiveText = value.slice(0, offset);
            const completionFetchText = effectiveText.match(/[a-zA-Z0-9_']+$/)?.[0] ?? "";
            const endOfStatementRegex = /[\)\]]\s*$/;
            if (offset > 0 && endOfStatementRegex.test(effectiveText)) {
                // Case 1: When a character unrelated to triggering completions is entered
                setCompletions([]);
            } else if (
                completions.length > 0 &&
                completionFetchText.length > 0 &&
                !triggerCharacter &&
                !onlyVariables &&
                !triggerCompletionOnNextRequest.current
            ) {
                // Case 2: When completions have already been retrieved and only need to be filtered
                expressionCompletions = completions
                    .filter((completion) => {
                        const lowerCaseText = completionFetchText.toLowerCase();
                        const lowerCaseLabel = completion.label.toLowerCase();

                        return lowerCaseLabel.includes(lowerCaseText);
                    })
                    .sort((a, b) => a.sortText.localeCompare(b.sortText));
            } else {
                // Case 3: When completions need to be retrieved from the language server
                // Retrieve completions from the ls
                let completions = await rpcClient.getBIDiagramRpcClient().getExpressionCompletions({
                    filePath: model.fileName,
                    expression: value,
                    startLine: targetRef.current.startLine,
                    offset: offset,
                    context: {
                        triggerKind: triggerCharacter ? 2 : 1,
                        triggerCharacter: triggerCharacter as TriggerCharacter,
                    },
                });

                if (onlyVariables) {
                    // If only variables are requested, filter out the completions based on the kind
                    // 'kind' for variables = 6
                    completions = completions?.filter((completion) => completion.kind === 6);
                    triggerCompletionOnNextRequest.current = true;
                } else {
                    triggerCompletionOnNextRequest.current = false;
                }

                // Convert completions to the ExpressionBar format
                const convertedCompletions = completions?.map((completion) => convertBalCompletion(completion)) ?? [];
                setCompletions(convertedCompletions);

                if (triggerCharacter) {
                    expressionCompletions = convertedCompletions;
                } else {
                    expressionCompletions = convertedCompletions
                        .filter((completion) => {
                            const lowerCaseText = completionFetchText.toLowerCase();
                            const lowerCaseLabel = completion.label.toLowerCase();

                            return lowerCaseLabel.includes(lowerCaseText);
                        })
                        .sort((a, b) => a.sortText.localeCompare(b.sortText));
                }
            }

            setFilteredCompletions(expressionCompletions);
        },
        250
    );

    const handleSubPanel = (subPanel: SubPanel) => {
        setShowSubPanel(subPanel.view !== SubPanelView.UNDEFINED);
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
                        filePath={subPanel.props?.inlineDataMapper?.filePath}
                        range={subPanel.props?.inlineDataMapper?.range}
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
                    />
                );
            default:
                return null;
        }
    };

    const handleGetCompletions = async (
        value: string,
        offset: number,
        triggerCharacter?: string,
        onlyVariables?: boolean
    ) => {
        await debouncedGetCompletions(value, offset, triggerCharacter, onlyVariables);

        if (triggerCharacter) {
            await debouncedGetCompletions.flush();
        }
    };

    const extractArgsFromFunction = async (value: string, cursorPosition: number) => {
        const signatureHelp = await rpcClient.getBIDiagramRpcClient().getSignatureHelp({
            filePath: model.fileName,
            expression: value,
            startLine: targetRef.current.startLine,
            offset: cursorPosition,
            context: {
                isRetrigger: false,
                triggerKind: 1,
            },
        });

        return convertToFnSignature(signatureHelp);
    };

    const handleResetUpdatedExpressionField = () => {
        setUpdatedExpressionField(undefined);
    };

    const handleExpressionEditorCancel = () => {
        setFilteredCompletions([]);
        setCompletions([]);
    };

    const handleCompletionSelect = async () => {
        debouncedGetCompletions.cancel();
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
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
                    codicon={isResource ? "globe" : "terminal"} // TODO: fix this with component diagram icons
                    // onEdit={handleOnFormBack}
                ></ViewHeader>
                {showProgressIndicator && model && <ProgressIndicator color={Colors.PRIMARY} />}
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
                                onDeleteNode={handleOnDeleteNode}
                                onAddComment={handleOnAddComment}
                                onNodeSelect={handleOnEditNode}
                                onConnectionSelect={handleOnEditConnection}
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
                subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
                subPanel={findSubPanelComponent(subPanel)}
            >
                {sidePanelView === SidePanelView.NODE_LIST && categories?.length > 0 && (
                    <div onClick={onDiscardSuggestions}>
                        <NodeList
                            categories={categories}
                            onSelect={handleOnSelectNode}
                            onAddConnection={handleOnAddConnection}
                            onClose={handleOnCloseSidePanel}
                        />
                    </div>
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
                        fileName={model.fileName}
                        node={selectedNodeRef.current}
                        nodeFormTemplate={nodeTemplateRef.current}
                        connections={model.connections}
                        clientName={selectedClientName.current}
                        targetLineRange={targetRef.current}
                        projectPath={projectPath}
                        editForm={showEditForm.current}
                        onSubmit={handleOnFormSubmit}
                        isActiveSubPanel={showSubPanel}
                        openSubPanel={handleSubPanel}
                        expressionEditor={{
                            completions: filteredCompletions,
                            triggerCharacters: TRIGGER_CHARACTERS,
                            retrieveCompletions: handleGetCompletions,
                            extractArgsFromFunction: extractArgsFromFunction,
                            onCompletionSelect: handleCompletionSelect,
                            onCancel: handleExpressionEditorCancel,
                            onBlur: handleExpressionEditorBlur,
                        }}
                        updatedExpressionField={updatedExpressionField}
                        resetUpdatedExpressionField={handleResetUpdatedExpressionField}
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
