import React, { useEffect, useReducer, useState } from "react";

import Grid from "@material-ui/core/Grid";
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
    SpecificField,
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


    const { fnST, langClientPromise, filePath, currentFile, stSymbolInfo, applyModifications, library, onClose, importStatements } = props;

    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);
    const [isConfigPanelOpen, setConfigPanelOpen] = useState(false);
    const [currentEditableField, setCurrentEditableField] = useState<ExpressionInfo>(null);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: fnST,
        prevST: []
    });

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

    const enableStamentEditor = (expressionInfo: ExpressionInfo) => {
        setCurrentEditableField(expressionInfo)
    }

    const closeStamentEditor = () => {
        setCurrentEditableField(null)
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
                    enableStamentEditor
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
    }, [selection, fnST]);

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
        onClose: onConfigClose
    }
    return (
        <LSClientContext.Provider value={langClientPromise}>
            <CurrentFileContext.Provider value={currentFile}>
                <div className={classes.root}>
                    {fnST && <DataMapperHeader name={fnST?.functionName?.value} onClose={onClose} onCofingOpen={onConfigOpen} />}
                    <DataMapperDiagram
                        nodes={nodes}
                    />
                    {(!fnST || isConfigPanelOpen) && <DataMapperConfigPanel {...cPanelProps} />}
                    {!!currentEditableField &&
                        <StatementEditorComponent
                            expressionInfo={currentEditableField}
                            langClientPromise={langClientPromise}
                            applyModifications={applyModifications}
                            currentFile={currentFile}
                            library={library}
                            onCancel={closeStamentEditor}
                            importStatements={importStatements}
                        />
                    }
                </div>
            </CurrentFileContext.Provider>
        </LSClientContext.Provider>
    )
}

export const DataMapper = React.memo(DataMapperC);
