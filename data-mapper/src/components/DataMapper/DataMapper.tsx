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
import React, { useEffect, useReducer, useState } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionDefinition,
    NodePosition,
    STNode,
    traversNode,
} from "@wso2-enterprise/syntax-tree";

import "../../assets/fonts/Gilmer/gilmer.css";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { handleDiagnostics } from "../Diagram/utils/ls-utils";
import { RecordTypeDescriptorStore } from "../Diagram/utils/record-type-descriptor-store";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";
import { SelectedSTFindingVisitor } from "../Diagram/visitors/SelectedSTFindingVisitor";
import { StatementEditorComponent } from "../StatementEditorComponent/StatementEditorComponent"

import { DataMapperConfigPanel } from "./ConfigPanel/DataMapperConfigPanel";
import { CurrentFileContext } from "./Context/current-file-context";
import { LSClientContext } from "./Context/ls-client-context";
import { DataMapperHeader } from "./Header/DataMapperHeader";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: "100%"
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
            opacity: 0.5
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
    stSymbolInfo?: STSymbolInfo
    applyModifications: (modifications: STModification[]) => void;
    onSave: (fnName: string) => void;
    onClose: () => void;
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    importStatements: string[];
    recordPanel?: (props: {closeAddNewRecord: () => void}) => JSX.Element;
}

export enum ViewOption {
    EXPAND,
    COLLAPSE
}

export interface SelectionState {
    selectedST: STNode;
    prevST?: STNode[];
}

export interface ExpressionInfo {
    value: string;
    valuePosition: any;
    specificFieldPosition?: any;
    fieldName?: string;
    label?: string;
}

const selectionReducer = (state: SelectionState, action: { type: ViewOption, payload: SelectionState }) => {
    if (action.type === ViewOption.EXPAND) {
        const previousST = !!state.prevST.length ? [...state.prevST, state.selectedST] : [state.selectedST];
        return { selectedST: action.payload.selectedST, prevST: previousST };
    }
    if (action.type === ViewOption.COLLAPSE) {
        const prevSelection = state.prevST.pop();
        return { selectedST: prevSelection, prevST: [...state.prevST] };
    }
    return { selectedST: action.payload.selectedST, prevST: action.payload.prevST };
};

function DataMapperC(props: DataMapperProps) {


    const { fnST, langClientPromise, filePath, currentFile, stSymbolInfo, applyModifications, library, onClose, importStatements, recordPanel } = props;

    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);
    const [isConfigPanelOpen, setConfigPanelOpen] = useState(false);
    const [currentEditableField, setCurrentEditableField] = useState<ExpressionInfo>(null);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: fnST,
        prevST: []
    });
    const [collapsedFields, setCollapsedFields] = React.useState<string[]>([])

    const classes = useStyles();

    const handleSelectedST = (mode: ViewOption, selectionState?: SelectionState) => {
        dispatchSelection({ type: mode, payload: selectionState });
    }

    const onConfigOpen = () => {
        setConfigPanelOpen(true);
    }

    const onConfigClose = () => {
        setConfigPanelOpen(false);
        if (!fnST) {
            onClose();
        }
    }

    const enableStatementEditor = (expressionInfo: ExpressionInfo) => {
        setCurrentEditableField(expressionInfo);
    }

    const closeStatementEditor = () => {
        setCurrentEditableField(null);
    }

    const handleCollapse = (fieldName: string, expand?: boolean) => {
        if (!expand){
            setCollapsedFields((prevState) => [...prevState, fieldName]);
        }
        else{
            setCollapsedFields((prevState) => prevState.filter((element) => {
                return element !== fieldName;
            }));
        }
    }

    useEffect(() => {
        (async () => {
            if (fnST && selection.selectedST) {
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
                    handleCollapse
                );

                let selectedST = selection.selectedST;
                const selectedSTFindingVisitor = new SelectedSTFindingVisitor(selectedST);
                traversNode(fnST, selectedSTFindingVisitor);
                selectedST = selectedSTFindingVisitor.getST();

                const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                await recordTypeDescriptors.storeTypeDescriptors(selectedST, context);

                const nodeInitVisitor = new NodeInitVisitor(context, selection);
                traversNode(selectedST, nodeInitVisitor);
                setNodes(nodeInitVisitor.getNodes());
            }
        })();
    }, [selection, fnST, collapsedFields]);

    useEffect(() => {
        if (!selection.selectedST) {
            dispatchSelection({
                type: undefined,
                payload: {
                    prevST: [],
                    selectedST: fnST
                }
            })
        }
    }, [fnST]);

    const cPanelProps = {
        ...props,
        onClose: onConfigClose,
        recordPanel
    }
    return (
        <LSClientContext.Provider value={langClientPromise}>
            <CurrentFileContext.Provider value={currentFile}>
                <div className={classes.root}>
                    {!!currentEditableField && <div className={classes.overlay} />}
                    {fnST && (
                        <DataMapperHeader
                            name={fnST?.functionName?.value}
                            selection={selection}
                            changeSelection={handleSelectedST}
                            onClose={onClose}
                            onConfigOpen={onConfigOpen}
                        />
                    )}
                    <DataMapperDiagram
                        nodes={nodes}
                    />
                    {(!fnST || isConfigPanelOpen) && <DataMapperConfigPanel {...cPanelProps} />}
                    {!!currentEditableField && (
                        <StatementEditorComponent
                            expressionInfo={currentEditableField}
                            langClientPromise={langClientPromise}
                            applyModifications={applyModifications}
                            currentFile={currentFile}
                            library={library}
                            onCancel={closeStatementEditor}
                            importStatements={importStatements}
                        />
                    )}
                </div>
            </CurrentFileContext.Provider>
        </LSClientContext.Provider>
    )
}

export const DataMapper = React.memo(DataMapperC);
