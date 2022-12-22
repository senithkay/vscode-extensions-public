/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useMemo, useReducer, useState } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { WarningBanner } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import {
    FunctionDefinition,
    NodePosition,
    STNode,
    traversNode,
} from "@wso2-enterprise/syntax-tree";

import "../../assets/fonts/Gilmer/gilmer.css";
import { useDMStore } from "../../store/store";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { handleDiagnostics } from "../Diagram/utils/ls-utils";
import { RecordTypeDescriptorStore } from "../Diagram/utils/record-type-descriptor-store";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";
import { SelectedSTFindingVisitor } from "../Diagram/visitors/SelectedSTFindingVisitor";
import { ViewStateSetupVisitor } from "../Diagram/visitors/ViewStateSetupVisitor";
import { StatementEditorComponent } from "../StatementEditorComponent/StatementEditorComponent"

import { DataMapperConfigPanel } from "./ConfigPanel/DataMapperConfigPanel";
import { DataMapperInputParam, DataMapperOutputParam } from "./ConfigPanel/InputParamsPanel/types";
import { getFnNameFromST, getInputsFromST, getOutputTypeFromST } from "./ConfigPanel/utils";
import { CurrentFileContext } from "./Context/current-file-context";
import { LSClientContext } from "./Context/ls-client-context";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { UnsupportedDataMapperHeader } from "./Header/UnsupportedDataMapperHeader";
import { LocalVarConfigPanel } from "./LocalVarConfigPanel/LocalVarConfigPanel";
import { isArraysSupported, isDMSupported } from "./utils";

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
        }
    }),
);


export interface DataMapperProps {
    targetPosition?: NodePosition;
    fnST: FunctionDefinition;
    langClientPromise: Promise<IBallerinaLangClient>;
    filePath: string;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    ballerinaVersion?: string;
    stSymbolInfo?: STSymbolInfo
    applyModifications: (modifications: STModification[]) => Promise<void>;
    updateFileContent: (content: string, skipForceSave?: boolean) => Promise<boolean>;
    onSave: (fnName: string) => void;
    onClose: () => void;
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    importStatements: string[];
    recordPanel?: (props: { targetPosition: NodePosition, closeAddNewRecord: () => void }) => JSX.Element;
    syntaxTree?: STNode;
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
        case ViewOption.RESET:  {
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

function DataMapperC(props: DataMapperProps) {


    const {
        fnST,
        targetPosition,
        ballerinaVersion,
        langClientPromise,
        filePath,
        currentFile,
        stSymbolInfo,
        applyModifications,
        updateFileContent,
        library,
        onClose,
        onSave,
        importStatements,
        recordPanel,
        syntaxTree
    } = props;

    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);
    const [isConfigPanelOpen, setConfigPanelOpen] = useState(false);
    const [currentEditableField, setCurrentEditableField] = useState<ExpressionInfo>(null);
    const [isStmtEditorCanceled, setIsStmtEditorCanceled] = useState(false);
    const [fieldTobeEdited, setFieldTobeEdited] = useState('');
    const [showDMOverlay, setShowDMOverlay] = useState(false);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: { stNode: fnST, fieldPath: fnST && fnST.functionName.value },
        prevST: [],
        state: DMState.NOT_INITIALIZED
    });
    const [collapsedFields, setCollapsedFields] = React.useState<string[]>([]);
    const [inputs, setInputs] = useState<DataMapperInputParam[]>();
    const [output, setOutput] = useState<DataMapperOutputParam>();
    const [fnName, setFnName] = useState(getFnNameFromST(fnST));
    const [nodeSetupCounter, setNodeSetupCounter] = useState(0);
    const [showLocalVarConfigPanel, setShowLocalVarConfigPanel] = useState(false);
    const { setFunctionST, setImports } = useDMStore();

    const classes = useStyles();

    const handleSelectedST = (mode: ViewOption, selectionState?: SelectionState, navIndex?: number) => {
        dispatchSelection({ type: mode, payload: selectionState, index: navIndex });
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
        setFieldTobeEdited(undefined);
    }

    const cancelStatementEditor = () => {
        setCurrentEditableField(null);
        setIsStmtEditorCanceled(true);
    }

    const handleFieldToBeEdited = (fieldId: string) => {
        setFieldTobeEdited(fieldId);
        if (fieldId === undefined) {
            setIsStmtEditorCanceled(false);
        }
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

    useEffect(() => {
        if (fnST) {
            const defaultSt = { stNode: fnST, fieldPath: fnST.functionName.value };
            if (selection.selectedST) {
                traversNode(fnST, new ViewStateSetupVisitor());
                const selectedSTFindingVisitor = new SelectedSTFindingVisitor([...selection.prevST, selection.selectedST]);
                traversNode(fnST, selectedSTFindingVisitor);
                const { selectedST, prevST } = selectedSTFindingVisitor.getST();

                dispatchSelection({ type: ViewOption.INITIALIZE, payload: { prevST, selectedST: selectedST || defaultSt } });
            } else {
                dispatchSelection({ type: ViewOption.INITIALIZE, payload: { prevST: [], selectedST: defaultSt } });
            }
        } else {
            dispatchSelection({ type: ViewOption.RESET });
        }
        setFunctionST(fnST);
        setImports(importStatements);
    }, [fnST]);

    useEffect(() => {
        void (async () => {
            try {
                if (selection.selectedST.stNode) {
                    const diagnostics = await handleDiagnostics(filePath, langClientPromise)

                    const context = new DataMapperContext(
                        filePath,
                        fnST,
                        selection,
                        langClientPromise,
                        currentFile,
                        stSymbolInfo,
                        handleSelectedST,
                        applyModifications,
                        diagnostics,
                        enableStatementEditor,
                        collapsedFields,
                        handleCollapse,
                        isStmtEditorCanceled,
                        fieldTobeEdited,
                        handleFieldToBeEdited,
                        handleOverlay,
                        ballerinaVersion,
                        handleLocalVarConfigPanel
                    );

                    const selectedST = selection.selectedST.stNode;
                    const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                    await recordTypeDescriptors.storeTypeDescriptors(selectedST, context, isArraysSupported(ballerinaVersion));

                    const nodeInitVisitor = new NodeInitVisitor(context, selection);
                    traversNode(selectedST, nodeInitVisitor);
                    setNodes(nodeInitVisitor.getNodes());
                }
            } finally {
                setNodeSetupCounter(prevState => prevState + 1);
            }
        })();
    }, [selection.selectedST, collapsedFields, isStmtEditorCanceled, fieldTobeEdited])

    const dMSupported = isDMSupported(ballerinaVersion);
    const dmUnsupportedMessage = `The current ballerina version ${ballerinaVersion.replace(
        "(swan lake)", "").trim()
        } does not support the Data Mapper feature. Please update your Ballerina versions to 2201.1.2, 2201.2.1, or higher version.`;

    useEffect(() => {
        if (nodeSetupCounter > 0 && selection.prevST.length === 0) {
            if (fnST) {
                const hasSwitchFunction = fnName !== getFnNameFromST(fnST);
                if (hasSwitchFunction) {
                    if (nodes.length > 0) {
                        // When open the DM of an existing function using code lens
                        const inputParams: DataMapperInputParam[] = getInputsFromST(fnST, ballerinaVersion)
                            || [];
                        setInputs(inputParams);
                        const outputType: DataMapperOutputParam = getOutputTypeFromST(fnST, ballerinaVersion)
                            || { type: undefined, isUnsupported: true };
                        setOutput(outputType);
                        setFnName(getFnNameFromST(fnST));
                    } else {
                        // When open the DM of an existing incomplete function using code lens
                        const hasNoParameter = fnST.functionSignature.parameters.length === 0;
                        const hasNoReturnType = !fnST.functionSignature?.returnTypeDesc;
                        if (hasNoParameter) {
                            setInputs([]);
                        }
                        if (hasNoReturnType) {
                            setOutput({ type: undefined, isUnsupported: true });
                        }
                        if (hasNoParameter || hasNoReturnType) {
                            setFnName(getFnNameFromST(fnST));
                        }
                    }
                }
            } else {
                // When open the DM using the main menu
                setInputs([]);
                setOutput({ type: undefined, isUnsupported: true });
            }
        }
    }, [nodeSetupCounter])

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

    const cPanelProps = {
        fnST,
        targetPosition,
        importStatements,
        syntaxTree,
        filePath,
        inputs,
        output,
        currentFile,
        ballerinaVersion,
        onSave: onConfigSave,
        onClose: onConfigClose,
        applyModifications,
        recordPanel
    }

    return (
        <LSClientContext.Provider value={langClientPromise}>
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
                                onClose={onClose}
                                onConfigOpen={onConfigOpen}
                            />
                        )}
                        {!dMSupported && (
                            <>
                                {!fnST && (<UnsupportedDataMapperHeader onClose={onClose} />)}
                                <div className={classes.dmUnsupportedMessage}>
                                    <WarningBanner message={dmUnsupportedMessage} testId={"warning-message"} />
                                </div>
                            </>
                        )}
                        <DataMapperDiagram
                            nodes={nodes}
                        />
                        {(showConfigPanel || isConfigPanelOpen) && dMSupported && <DataMapperConfigPanel {...cPanelProps} />}
                        {!!currentEditableField && dMSupported && (
                            <StatementEditorComponent
                                expressionInfo={currentEditableField}
                                langClientPromise={langClientPromise}
                                applyModifications={applyModifications}
                                updateFileContent={updateFileContent}
                                currentFile={currentFile}
                                library={library}
                                onCancel={cancelStatementEditor}
                                onClose={closeStatementEditor}
                                importStatements={importStatements}
                            />
                        )}
                        {showLocalVarConfigPanel && (
                            <LocalVarConfigPanel
                                handleLocalVarConfigPanel={handleLocalVarConfigPanel}
                                applyModifications={applyModifications}
                                enableStatementEditor={enableStatementEditor}
                                fnDef={selection.selectedST.stNode}
                                langClientPromise={langClientPromise}
                                filePath={filePath}
                            />
                        )}
                    </div>
                )}
            </CurrentFileContext.Provider>
        </LSClientContext.Provider>
    )
}

export const DataMapper = React.memo(DataMapperC);
