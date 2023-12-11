/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useMemo, useReducer, useState } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
    BallerinaProjectComponents,
    ComponentViewInfo,
    CurrentFile,
    FileListEntry,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
// import { WarningBanner } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { FunctionDefinition, NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
// import { URI } from "vscode-uri";

import "../../assets/fonts/Gilmer/gilmer.css";
import { useDMSearchStore, useDMStore } from "../../store/store";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { hasIONodesPresent } from "../Diagram/utils/dm-utils";
import { FunctionDefinitionStore } from "../Diagram/utils/fn-definition-store";
import { handleDiagnostics } from "../Diagram/utils/ls-utils";
import { TypeDescriptorStore, TypeStoreStatus } from "../Diagram/utils/type-descriptor-store";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";
import { SelectedSTFindingVisitor } from "../Diagram/visitors/SelectedSTFindingVisitor";
import { ViewStateSetupVisitor } from "../Diagram/visitors/ViewStateSetupVisitor";
import { StatementEditorComponent } from "../StatementEditorComponent/StatementEditorComponent"

import { DataMapperInputParam, DataMapperOutputParam, TypeNature } from "./ConfigPanel/InputParamsPanel/types";
import { getFnNameFromST, getFnSignatureFromST, getInputsFromST, getOutputTypeFromST } from "./ConfigPanel/utils";
import { CurrentFileContext } from "./Context/current-file-context";
import { ErrorNodeKind } from "./Error/DataMapperError";
import { DataMapperErrorBoundary } from "./ErrorBoundary";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { UnsupportedDataMapperHeader } from "./Header/UnsupportedDataMapperHeader";
import { LocalVarConfigPanel } from "./LocalVarConfigPanel/LocalVarConfigPanel";
import { isArraysSupported, isDMSupported } from "./utils";
import { useProjectComponents, useSyntaxTreeFromRange } from "../Hooks";

// import { DataMapperConfigPanel } from "./ConfigPanel/DataMapperConfigPanel";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: "100%",
            overflow: "hidden"
        },
        gridContainer: {
            height: "100%",
            gridTemplateColumns: "1fr fit-content(200px)"
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        overlay: {
            zIndex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: theme.palette.common.white,
            opacity: 0.5,
        },
        dmUnsupportedOverlay: {
            zIndex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: theme.palette.common.white,
            opacity: 0.5,
        },
        dmUnsupportedMessage: {
            zIndex: 1,
            position: 'absolute'
        },
        errorBanner: {
            borderColor: '#FF0000'
        },
        errorMessage: {
            zIndex: 1,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        },
    }),
);

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

export function DataMapperC() {
    const ballerinaVersion: string = '2201.7.2 (swan lake update 7)';
    const openedViaPlus: boolean = false;
    const updateFileContent: (content: string, skipForceSave?: boolean) => Promise<boolean> = undefined;
    const goToSource: (position: { startLine: number, startColumn: number }, filePath?: string) => void = undefined;
    const library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    } = undefined;
    const onClose: () => void = undefined;
    const onSave: (fnName: string) => void = undefined;
    const importStatements: string[] = [];
    const recordPanel: (props: { targetPosition: NodePosition, closeAddNewRecord: () => void }) => JSX.Element = undefined;
    const updateActiveFile: (currentFile: FileListEntry) => void = undefined;
    const updateSelectedComponent: (info: ComponentViewInfo) => void = undefined;

    const { projectComponents } = useProjectComponents();
    const { data } = useSyntaxTreeFromRange();

    const fnST = data?.syntaxTree as FunctionDefinition;
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

    const visualizerContext = useVisualizerContext();
    const {
        viewLocation: {
            location: {
                fileName: filePath
            }
        },
        ballerinaRpcClient
    } = visualizerContext;
    const currentFile = {
        content: "",
        path: filePath,
        size: 1
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
    const [inputs, setInputs] = useState<DataMapperInputParam[]>();
    const [output, setOutput] = useState<DataMapperOutputParam>();
    const [fnName, setFnName] = useState(getFnNameFromST(fnST));
    const [fnSignature, setFnSignature] = useState(getFnSignatureFromST(fnST));
    const [showLocalVarConfigPanel, setShowLocalVarConfigPanel] = useState(false);
    const { setFunctionST, setImports } = useDMStore();
    const { inputSearch, outputSearch, resetSearchStore } = useDMSearchStore();
    const [dmContext, setDmContext] = useState<DataMapperContext>();
    const [dmNodes, setDmNodes] = useState<DataMapperNodeModel[]>();
    const [shouldRestoreTypes, setShouldRestoreTypes] = useState(true);
    const [hasInternalError, setHasInternalError] = useState(false);
    const [errorKind, setErrorKind] = useState<ErrorNodeKind>();
    const [isSelectionComplete, setIsSelectionComplete] = useState(false);
    const [currentReferences, setCurrentReferences] = useState<string[]>([]);

    const typeStore = TypeDescriptorStore.getInstance();
    const typeStoreStatus = typeStore.getStatus();

    const classes = useStyles();

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

    const onConfigClose = () => {
        setConfigPanelOpen(false);
        if (showConfigPanel) {
            // Close data mapper when having incomplete fnST
            onClose();
        }
    }

    const onConfigSave = (funcName: string, inputParams: DataMapperInputParam[], outputType: DataMapperOutputParam) => {
        setConfigPanelOpen(false);
        setInputs(inputParams);
        setOutput(outputType);
        onSave(funcName);
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

    const moduleVariables = useMemo(() => {
        const moduleVars = [];
        const consts = [];
        const enums = [];
        if (projectComponents) {
            for (const pkg of projectComponents.packages) {
                for (const mdl of pkg.modules) {
                    for (const moduleVariable of mdl.moduleVariables) {
                        moduleVars.push(moduleVariable);
                    }
                    for (const constant of mdl.constants) {
                        consts.push(constant);
                    }
                    for (const enumType of mdl.enums) {
                        enums.push({
                            filePath: pkg.filePath,
                            enum: enumType,
                        });
                    }
                }
            }
        }
        return {
            moduleVarDecls: moduleVars,
            constDecls: consts,
            enumDecls: enums,
        }
    }, [projectComponents]);

    useEffect(() => {
        if (fnST) {
            const defaultSt = { stNode: fnST, fieldPath: fnST.functionName.value };
            if (selection.selectedST) {
                try {
                    traversNode(fnST, new ViewStateSetupVisitor());
                    const selectedSTFindingVisitor = new SelectedSTFindingVisitor([...selection.prevST, selection.selectedST]);
                    traversNode(fnST, selectedSTFindingVisitor);
                    const { selectedST, prevST } = selectedSTFindingVisitor.getST();

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
        const fnSignatureFromFnST = getFnSignatureFromST(fnST);
        const fnNameFromFnST = getFnNameFromST(fnST);
        if (!(inputs && output) || (fnST && fnSignatureFromFnST !== fnSignature && fnNameFromFnST !== fnName)) {
            const fnSTFromTypeStore = typeStore.getSTNode();
            const hasFnSwitched = fnST && fnSTFromTypeStore && (
                fnNameFromFnST !== getFnNameFromST(fnSTFromTypeStore)
                || fnSignatureFromFnST !== getFnSignatureFromST(fnSTFromTypeStore)
            );
            if (hasFnSwitched || (!(inputs && output) && (!fnSTFromTypeStore || openedViaPlus))) {
                typeStore.resetStatus();
                setInputs(undefined);
                setOutput(undefined);
            }
            setFnSignature(fnSignatureFromFnST);
            setFnName(fnNameFromFnST);
        }
    }, [fnST]);

    useEffect(() => {
        setIsSelectionComplete(false)
        void (async () => {
            if (selection.selectedST.stNode) {
                const diagnostics = await handleDiagnostics(filePath, visualizerContext.ballerinaRpcClient);

                const context = new DataMapperContext(
                    filePath,
                    fnST,
                    selection,
                    visualizerContext,
                    currentFile,
                    moduleVariables,
                    handleSelectedST,
                    goToSource,
                    diagnostics,
                    enableStatementEditor,
                    collapsedFields,
                    handleCollapse,
                    isStmtEditorCanceled,
                    handleOverlay,
                    ballerinaVersion,
                    handleLocalVarConfigPanel,
                    updateActiveFile,
                    updateSelectedComponent,
                    referenceManager
                );

                if (shouldRestoreTypes) {
                    await typeStore.storeTypeDescriptors(fnST, context, isArraysSupported(ballerinaVersion), visualizerContext.ballerinaRpcClient);
                    const functionDefinitions = FunctionDefinitionStore.getInstance();
                    await functionDefinitions.storeFunctionDefinitions(fnST, context, visualizerContext.ballerinaRpcClient);
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
                // if (hasIONodesPresent(nodes) && typeStoreStatus === TypeStoreStatus.Loaded) {
                if (hasIONodesPresent(nodes)) {
                    setDmNodes(nodes);
                }
            } catch (e) {
                setHasInternalError(true);
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        } else {
            setDmNodes([]);
        }
    }, [isSelectionComplete, dmContext, inputSearch, outputSearch, typeStoreStatus]);

    const dMSupported = isDMSupported(ballerinaVersion);
    const dmUnsupportedMessage = `The current ballerina version ${ballerinaVersion.replace(
        "(swan lake)", "").trim()
        } does not support the Data Mapper feature. Please update your Ballerina versions to 2201.1.2, 2201.2.1, or higher version.`;

    useEffect(() => {
        let inputParams: DataMapperInputParam[] = [];
        let outputType: DataMapperOutputParam = { type: undefined, isUnsupported: true, typeNature: TypeNature.DUMMY };
        const hasIncompleteInputs = inputs && inputs.some(i => i.isUnsupported && (
            i.typeNature === TypeNature.TYPE_UNAVAILABLE
            || i.typeNature === TypeNature.PARAM_NAME_UNAVAILABLE
            || i.typeNature === TypeNature.INVALID)
        );
        const hasIncompleteOutput = output && output.isUnsupported
            && (output.typeNature === TypeNature.INVALID || output.typeNature === TypeNature.TYPE_UNAVAILABLE);
        if (selection.prevST.length === 0
            && typeStoreStatus === TypeStoreStatus.Loaded
            && ((!isConfigPanelOpen && !showConfigPanel) || hasIncompleteInputs || hasIncompleteOutput)) {
            if (fnST) {
                // When open the DM of an existing function using code lens
                const hasNoParameter = fnST.functionSignature.parameters.length === 0;
                const hasNoReturnType = !fnST.functionSignature?.returnTypeDesc;
                if (!hasNoParameter) {
                    inputParams = getInputsFromST(fnST, ballerinaVersion) || inputParams;
                    setInputs(inputParams);
                }
                if (!hasNoReturnType) {
                    outputType = getOutputTypeFromST(fnST, ballerinaVersion) || outputType;
                    setOutput(outputType);
                }
                if (!inputs && !output) {
                    setInputs(inputParams);
                    setOutput(outputType);
                }
            }
        } else if (typeStoreStatus === TypeStoreStatus.Init && openedViaPlus) {
            // When creating a new DM using plus menu
            setInputs(inputParams);
            setOutput(outputType);
        }
    }, [fnSignature, typeStoreStatus]);

    useEffect(() => {
        if (selection.state === DMState.ST_NOT_FOUND) {
            onClose();
        }
    }, [selection.state])

    const showConfigPanel = useMemo(() => {
        if (inputs && output) {
            const hasInvalidInputs = !inputs.length || inputs.some(input => input.isUnsupported);
            const isInvalidOutput = output.isUnsupported;
            return hasInvalidInputs || isInvalidOutput;
        }
    }, [inputs, output])

    useEffect(() => {
        handleOverlay(!!currentEditableField || !selection?.selectedST?.stNode || isConfigPanelOpen || showConfigPanel);
    }, [currentEditableField, selection.selectedST, isConfigPanelOpen, showConfigPanel])

    useEffect(() => {
        resetSearchStore();
    }, [fnName]);

    const handleErrors = (kind: ErrorNodeKind) => {
        setErrorKind(kind);
    };

    const cPanelProps = {
        fnST,
        targetPosition,
        importStatements,
        projectComponents,
        filePath,
        inputs,
        output,
        currentFile,
        ballerinaVersion,
        onSave: onConfigSave,
        onClose: onConfigClose,
        ballerinaRpcClient,
        recordPanel
    }

    return (
        <DataMapperErrorBoundary hasError={hasInternalError}>
            <CurrentFileContext.Provider value={currentFile}>
                {selection.state === DMState.INITIALIZED && (
                    <div className={classes.root}>
                        {(!!showDMOverlay || showLocalVarConfigPanel) &&
                            <div className={dMSupported ? classes.overlay : classes.dmUnsupportedOverlay} />
                        }
                        {fnST && (
                            <DataMapperHeader
                                selection={selection}
                                dmSupported={dMSupported}
                                changeSelection={handleSelectedST}
                                onConfigOpen={onConfigOpen}
                            />
                        )}
                        {!dMSupported && (
                            <>
                                {!fnST && (<UnsupportedDataMapperHeader onClose={onClose} />)}
                                {/* <div className={classes.dmUnsupportedMessage}>
                                    <WarningBanner message={dmUnsupportedMessage} testId={"warning-message"} />
                                </div> */}
                            </>
                        )}
                        {errorKind && (
                            <>
                                <div className={classes.overlay} />
                                {/* <div className={classes.errorMessage}>
                                    <WarningBanner
                                        message={<DataMapperError errorNodeKind={errorKind} />}
                                        className={classes.errorBanner}
                                    />
                                </div> */}
                            </>
                        )}
                        {dmNodes.length > 0 && (
                            <DataMapperDiagram
                                nodes={dmNodes}
                                onError={handleErrors}
                            />
                        )}
                        {/* {(showConfigPanel || isConfigPanelOpen) && dMSupported && <DataMapperConfigPanel {...cPanelProps} />} */}
                        {!!currentEditableField && dMSupported && (
                            <StatementEditorComponent
                                expressionInfo={currentEditableField}
                                langClientPromise={undefined}
                                applyModifications={undefined}
                                updateFileContent={updateFileContent}
                                currentFile={currentFile}
                                library={library}
                                onCancel={cancelStatementEditor}
                                onClose={closeStatementEditor}
                                importStatements={importStatements}
                                currentReferences={currentReferences}
                            />
                        )}
                        {showLocalVarConfigPanel && (
                            <LocalVarConfigPanel
                                handleLocalVarConfigPanel={handleLocalVarConfigPanel}
                                enableStatementEditor={enableStatementEditor}
                                fnDef={selection.selectedST.stNode}
                                filePath={filePath}
                            />
                        )}
                    </div>
                )}
            </CurrentFileContext.Provider>
        </DataMapperErrorBoundary>
    )
}

export const DataMapper = React.memo(DataMapperC);
