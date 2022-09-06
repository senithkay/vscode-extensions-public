import React, { useEffect, useReducer, useState } from "react";

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
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { DataMapperConfigPanel } from "./ConfigPanel/DataMapperConfigPanel";
import { LSClientContext } from "./Context/ls-client-context";
import { CurrentFileContext } from "./Context/current-file-context";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { StatementEditorComponent } from "../StatementEditorComponent/StatementEditorComponent"
import Grid from "@material-ui/core/Grid";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


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
    library?: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
}

export enum ViewOption {
    EXPAND,
    COLLAPSE
}

export interface SelectionState {
    selectedST: STNode;
    prevST?: STNode[];
}

const selectionReducer = (state: SelectionState, action: {type: ViewOption, payload: SelectionState }) => {
    if (action.type === ViewOption.EXPAND) {
        const previousST = !!state.prevST.length ? [...state.prevST, state.selectedST] : [state.selectedST];
        return { selectedST: action.payload.selectedST, prevST: previousST };
    }
    if (action.type === ViewOption.COLLAPSE) {
        const prevSelection = state.prevST.pop();
        return { selectedST: prevSelection, prevST: [...state.prevST] };
    }
    return { selectedST: action.payload.selectedST };
};

function DataMapperC(props: DataMapperProps) {


    const { fnST, langClientPromise, filePath, currentFile, stSymbolInfo, applyModifications, library, onClose } = props;

    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);
    const [isConfigPanelOpen, setConfigPanelOpen] = useState(false);
    const [currentEditableField, setCurrentEditableField] = useState<SpecificField>(null);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: fnST,
        prevST: []
    });

    const classes = useStyles();

    const handleSelectedST = (mode: ViewOption, selectionState?: SelectionState) => {
        dispatchSelection({type: mode, payload: selectionState});
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

	const enableStamentEditor = (model: SpecificField) => {
        setCurrentEditableField(model)
	}

    const closeStamentEditor = () => {
        setCurrentEditableField(null)
	}

    useEffect(() => {
        (async () => {
           if (fnST && selection) {
                const diagnostics=  await handleDiagnostics(filePath, langClientPromise)

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

                const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                await recordTypeDescriptors.storeTypeDescriptors(fnST, context);
                const nodeInitVisitor = new NodeInitVisitor(context, selection);
                let selectedST = selection.selectedST || fnST;
                const visitor = new SelectedSTFindingVisitor(selectedST);
                traversNode(fnST, visitor);
                selectedST = visitor.getST();
                traversNode(selectedST, nodeInitVisitor);
                setNodes(nodeInitVisitor.getNodes());
           }
        })();
    }, [selection, fnST]);

    const cPanelProps = {
        ...props,
        onClose: onConfigClose
    }
    return (
        <LSClientContext.Provider value={langClientPromise}>
            <CurrentFileContext.Provider value={currentFile}>
                <div className={classes.root}>
                    <Grid container={true} spacing={3} className={classes.gridContainer} >
                        <Grid item={true} xs={currentEditableField ? 7 : 12}>
                            {fnST && <DataMapperHeader name={fnST?.functionName?.value} onClose={onClose} onCofingOpen={onConfigOpen} />}
                            <DataMapperDiagram
                                nodes={nodes}
                            />
                            {(!fnST || isConfigPanelOpen) && <DataMapperConfigPanel {...cPanelProps} />}
                        </Grid>
                        {!!currentEditableField &&
                            <Grid item={true} xs={5} style={{ width: "fit-content" }}>
                                <StatementEditorComponent
                                    model={currentEditableField}
                                    langClientPromise={langClientPromise}
                                    applyModifications={applyModifications}
                                    currentFile={currentFile}
                                    library={library}
                                    onCancel={closeStamentEditor}
                                />
                            </Grid>
                        }
                    </Grid>
                </div>
            </CurrentFileContext.Provider>
        </LSClientContext.Provider>
    )
}

export const DataMapper = React.memo(DataMapperC);
