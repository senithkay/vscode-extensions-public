import React, { useEffect, useReducer, useState } from "react";

import {
    DiagramEditorLangClientInterface,
    ExpressionEditorLangClientInterface,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionDefinition,
    SpecificField,
    STNode,
    traversNode,
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import "../../assets/fonts/Gilmer/gilmer.css";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { handleDiagnostics } from "../Diagram/utils/ls-utils";
import { RecordTypeDescriptorStore } from "../Diagram/utils/record-type-descriptor-store";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";
import { SelectedSTFindingVisitor } from "../Diagram/visitors/SelectedSTFindingVisitor";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
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
    fnST: FunctionDefinition;
    langClientPromise?: () => Promise<DiagramEditorLangClientInterface>;
    getLangClient?: () => Promise<DiagramEditorLangClientInterface>;
    getEELangClient?: () => Promise<ExpressionEditorLangClientInterface>;
    filePath: string;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo?: STSymbolInfo
    applyModifications: (modifications: STModification[]) => void;
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

    const { fnST, langClientPromise, getEELangClient, filePath, currentFile, stSymbolInfo, applyModifications, library } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);
    const [currentModel, setCurrentModel] = useState<SpecificField>(null);
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: fnST,
        prevST: []
    });

    const classes = useStyles();

    const handleSelectedST = (mode: ViewOption, selectionState?: SelectionState) => {
        dispatchSelection({type: mode, payload: selectionState});
    }


	const enableStamentEditor = (model: SpecificField) => {
        setCurrentModel(model)
	}

    const closeStamentEditor = () => {
        setCurrentModel(null)
	}

    useEffect(() => {
        (async () => {
            const diagnostics=  await handleDiagnostics(filePath, langClientPromise)

            const context = new DataMapperContext(
                filePath,
                fnST,
                selection,
                langClientPromise,
                getEELangClient,
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
            let selectedST = selection.selectedST;
            const visitor = new SelectedSTFindingVisitor(selectedST);
            traversNode(fnST, visitor);
            selectedST = visitor.getST();
            traversNode(selectedST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        })();
    }, [selection, fnST]);

    return (
<       div className={classes.root}>
            <Grid container={true} spacing={3} className={classes.gridContainer} >
                <Grid item={true} xs={currentModel ? 7 : 12}>
                    <DataMapperDiagram
                        nodes={nodes}
                    />
                </Grid>
                { !! currentModel &&
                    <Grid item={true} xs={5} style={{width:"fit-content"}}>
                        <StatementEditorComponent 
                            model ={currentModel}
                            getEELangClient = {getEELangClient}
                            applyModifications= {applyModifications}
                            currentFile ={currentFile}
                            library={library}
                            onCancel={closeStamentEditor}
                    />
                    </Grid>
                }
            </Grid>
        </div>
    )
}

export const DataMapper = React.memo(DataMapperC);
