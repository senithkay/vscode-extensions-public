/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useMemo, useReducer, useState } from "react";

import { css } from "@emotion/css";
import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { useDMSearchStore, useDMStore } from "../../store/store";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";

import { CurrentFileContext } from "./Context/current-file-context";
import { ErrorNodeKind } from "./Error/DataMapperError";
import { DataMapperErrorBoundary } from "./ErrorBoundary";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { DataMapperViewProps } from "../..";
import { Diagnostic } from "vscode-languageserver-types";
import { Typography } from "@wso2-enterprise/ui-toolkit";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100%",
        overflow: "hidden",
    }),
    gridContainer: css({
        height: "100%",
        gridTemplateColumns: "1fr fit-content(200px)"
    }),
    paper: css({
        padding: "16px",
        textAlign: 'center',
        color: "var(--vscode-foreground)",
    }),
    overlay: css({
        zIndex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: "var(--vscode-input-background)",
        opacity: 0.5,
        cursor: 'not-allowed'
    }),
    dmUnsupportedOverlay: css({
        zIndex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: "var(--vscode-input-background)",
        opacity: 0.5,
    }),
    dmUnsupportedMessage: css({
        zIndex: 1,
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
    }),
    errorBanner: css({
        borderColor: "var(--vscode-errorForeground)"
    }),
    errorMessage: css({
        zIndex: 1,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    })
}

export enum ViewOption {
    INITIALIZE,
    EXPAND,
    COLLAPSE,
    NAVIGATE,
    RESET,
}

export interface SelectionState {
    selectedST: DMNode;
    prevST?: DMNode[];
    state?: DMState;
}

export interface ExpressionInfo {
    value: string;
    valuePosition: NodePosition;
    label?: string;
}

export interface DMNode {
    stNode: STNode;
    fieldPath: string;
}

enum DMState {
    INITIALIZED,
    NOT_INITIALIZED,
    ST_NOT_FOUND,
}

const selectionReducer = (state: SelectionState, action: { type: ViewOption, payload?: SelectionState, index?: number }) => {
    switch (action.type) {
        case ViewOption.EXPAND: {
            const previousST = state.prevST.length ? [...state.prevST, state.selectedST] : [state.selectedST];
            return { ...state, selectedST: action.payload.selectedST, prevST: previousST };
        }
        case ViewOption.COLLAPSE: {
            const prevSelection = state.prevST.pop();
            return { ...state, selectedST: prevSelection, prevST: [...state.prevST] };
        }
        case ViewOption.NAVIGATE: {
            const targetST = state.prevST[action.index];
            return { ...state, selectedST: targetST, prevST: [...state.prevST.slice(0, action.index)] };
        }
        case ViewOption.RESET: {
            return { selectedST: { stNode: undefined, fieldPath: undefined }, prevST: [], state: state.selectedST?.stNode ? DMState.ST_NOT_FOUND : DMState.INITIALIZED };
        }
        case ViewOption.INITIALIZE: {
            return { selectedST: action.payload.selectedST, prevST: action.payload.prevST, state: DMState.INITIALIZED };
        }
        default: {
            return state;
        }
    }
};

export function DataMapperC(props: DataMapperViewProps) {
    const {
        fnST,
        filePath,
        langServerRpcClient,
        libraryBrowserRpcClient,
        applyModifications,
        onClose,
        goToFunction: updateSelectedComponent,
        renderRecordPanel
    } = props;
    const openedViaPlus = false;
    const goToSource: (position: { startLine: number, startColumn: number }, filePath?: string) => void = undefined;
    const onSave: (fnName: string) => void = undefined;
    const updateActiveFile: (currentFile: any) => void = undefined;

    const dMSupported = true;
    const content = "";

    const targetPosition = fnST ? {
        ...fnST.position,
        startColumn: 0,
        endColumn: 0
    } : {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0
    };

    const [isConfigPanelOpen, setConfigPanelOpen] = useState(false);
    const [currentEditableField, setCurrentEditableField] = useState<ExpressionInfo>(null);
    const [isStmtEditorCanceled, setIsStmtEditorCanceled] = useState(false);
    const [showDMOverlay, setShowDMOverlay] = useState(false);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: { stNode: fnST, fieldPath: fnST && fnST.functionName.value },
        prevST: [],
        state: DMState.NOT_INITIALIZED,
    });
    const [collapsedFields, setCollapsedFields] = React.useState<string[]>([]);
    const [showLocalVarConfigPanel, setShowLocalVarConfigPanel] = useState(false);
    const { setFunctionST, setImports } = useDMStore();
    const { resetSearchStore } = useDMSearchStore();
    const [dmContext, setDmContext] = useState<DataMapperContext>();
    const [dmNodes, setDmNodes] = useState<DataMapperNodeModel[]>();
    const [shouldRestoreTypes, setShouldRestoreTypes] = useState(true);
    const [hasInternalError, setHasInternalError] = useState(false);
    const [errorKind, setErrorKind] = useState<ErrorNodeKind>();
    const [isSelectionComplete, setIsSelectionComplete] = useState(false);
    const [currentReferences, setCurrentReferences] = useState<string[]>([]);

    const fnName = "";

    const handleSelectedST = (mode: ViewOption, selectionState?: SelectionState, navIndex?: number) => {
        dispatchSelection({ type: mode, payload: selectionState, index: navIndex });
        resetSearchStore();
    }

    const handleCurrentReferences = (referencedFields: string[]) => {
        setCurrentReferences(referencedFields);
    }

    const onConfigOpen = () => {
        setConfigPanelOpen(true);
    }

    const enableStatementEditor = (expressionInfo: ExpressionInfo) => {
        setCurrentEditableField(expressionInfo);
    }

    const closeStatementEditor = () => {
        setCurrentEditableField(null);
    }

    const cancelStatementEditor = () => {
        setCurrentEditableField(null);
        setIsStmtEditorCanceled(true);
    }

    const handleCollapse = (fieldName: string, expand?: boolean) => {
        if (!expand) {
            setCollapsedFields((prevState) => [...prevState, fieldName]);
        }
        else {
            setCollapsedFields((prevState) => prevState.filter((element) => element !== fieldName));
        }
    }

    const handleOverlay = (showOverlay: boolean) => {
        setShowDMOverlay(showOverlay);
    }

    const handleLocalVarConfigPanel = (showPanel: boolean) => {
        setShowLocalVarConfigPanel(showPanel);
    }

    const referenceManager = {
        currentReferences,
        handleCurrentReferences
    }

    const currentFile = useMemo(() => ({
        content: content ? content[0] : "",
        path: filePath,
        size: 1
    }), [content]);

    const importStatements = useMemo(() => content ? content[1] : [], [content]);

    useEffect(() => {
        if (fnST) {
            const defaultSt = { stNode: fnST, fieldPath: fnST.functionName.value };
            if (selection.selectedST) {
                try {
                    const selectedST: DMNode = undefined;
                    const prevST: DMNode[] = [];

                    dispatchSelection({ type: ViewOption.INITIALIZE, payload: { prevST, selectedST: selectedST || defaultSt } });
                } catch (e) {
                    setHasInternalError(true);
                    // tslint:disable-next-line:no-console
                    console.error(e);
                }
            } else {
                dispatchSelection({ type: ViewOption.INITIALIZE, payload: { prevST: [], selectedST: defaultSt } });
            }
        } else {
            dispatchSelection({ type: ViewOption.RESET });
        }
        setFunctionST(fnST);
        setImports(importStatements);
        setShouldRestoreTypes(true);
    }, [fnST]);

    useEffect(() => {
        setIsSelectionComplete(false)
        void (async () => {
            if (selection.selectedST.stNode) {
                const diagnostics: Diagnostic[] = undefined;

                const context = new DataMapperContext(
                    filePath,
                    fnST,
                    selection,
                    langServerRpcClient,
                    currentFile,
                    handleSelectedST,
                    goToSource,
                    diagnostics,
                    enableStatementEditor,
                    collapsedFields,
                    handleCollapse,
                    isStmtEditorCanceled,
                    handleOverlay,
                    handleLocalVarConfigPanel,
                    applyModifications,
                    updateActiveFile,
                    updateSelectedComponent,
                    referenceManager
                );

                if (shouldRestoreTypes) {
                    // set the types
                    // await typeStore.storeTypeDescriptors(fnST, context, isArraysSupported(ballerinaVersion), langServerRpcClient);
                    setShouldRestoreTypes(false);
                }

                setDmContext(context);
            }
        })();
        setIsSelectionComplete(true)
    }, [selection.selectedST, collapsedFields, isStmtEditorCanceled]);

    useEffect(() => {
        if (isSelectionComplete && dmContext && selection?.selectedST?.stNode) {
            const nodeInitVisitor = new NodeInitVisitor(dmContext, selection);
            try {
                traversNode(selection.selectedST.stNode, nodeInitVisitor);
                const nodes = nodeInitVisitor.getNodes();
                setDmNodes(nodes);
            } catch (e) {
                setHasInternalError(true);
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        } else {
            setDmNodes([]);
        }
    }, [isSelectionComplete, dmContext]);

    useEffect(() => {
        if (selection.state === DMState.ST_NOT_FOUND) {
            onClose();
        }
    }, [selection.state]);

    useEffect(() => {
        handleOverlay(!!currentEditableField || !selection?.selectedST?.stNode || isConfigPanelOpen);
    }, [currentEditableField, selection.selectedST, isConfigPanelOpen])

    useEffect(() => {
        resetSearchStore();
    }, [fnName]);

    const handleErrors = (kind: ErrorNodeKind) => {
        setErrorKind(kind);
    };

    return (
        <DataMapperErrorBoundary hasError={hasInternalError}>
            <CurrentFileContext.Provider value={currentFile}>
                {selection.state === DMState.INITIALIZED && (
                    <div className={classes.root}>
                        {/* {fnST && (
                            <DataMapperHeader
                                selection={selection}
                                hasEditDisabled={!dMSupported || !!errorKind}
                                changeSelection={handleSelectedST}
                                onConfigOpen={onConfigOpen}
                                onClose={onClose}
                            />
                        )}
                        {dmNodes.length > 0 && (
                            <DataMapperDiagram
                                nodes={dmNodes}
                                onError={handleErrors}
                            />
                        )} */}
                        <Typography variant="h1">MI Data Mapper</Typography>
                    </div>
                )}
            </CurrentFileContext.Provider>
        </DataMapperErrorBoundary>
    )
}

export const DataMapper = React.memo(DataMapperC);
