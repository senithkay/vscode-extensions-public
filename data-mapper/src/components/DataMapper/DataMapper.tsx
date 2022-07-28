import React, {useEffect, useReducer, useState} from "react";

import {
    DiagramEditorLangClientInterface,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionDefinition, STKindChecker,
    STNode,
    traversNode,
} from "@wso2-enterprise/syntax-tree";

import "../../assets/fonts/Gilmer/gilmer.css";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";
import { QueryFindingVisitor } from "../Diagram/visitors/QueryFindingVisitor";

export interface DataMapperProps {
    fnST: FunctionDefinition;
    langClientPromise?: () => Promise<DiagramEditorLangClientInterface>;
    getLangClient?: () => Promise<DiagramEditorLangClientInterface>;
    filePath: string;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo?: STSymbolInfo
    applyModifications: (modifications: STModification[]) => void;
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
        const previousST = !!state.prevST.length ? [...state.prevST] : [state.selectedST];
        return { selectedST: action.payload.selectedST, prevST: previousST };
    }
    if (action.type === ViewOption.COLLAPSE) {
        const prevSelection = state.prevST.pop();
        return { selectedST: prevSelection, prevST: [...state.prevST] };
    }
    return { selectedST: action.payload.selectedST };
};

function DataMapperC(props: DataMapperProps) {

    const { fnST, langClientPromise, filePath, currentFile, stSymbolInfo, applyModifications } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        selectedST: fnST,
        prevST: []
    });

    const handleSelectedST = (mode: ViewOption, selectionState?: SelectionState) => {
        dispatchSelection({type: mode, payload: selectionState});
    }

    useEffect(() => {
        (async () => {
            const context = new DataMapperContext(
                filePath,
                fnST,
                selection,
                langClientPromise,
                currentFile,
                stSymbolInfo,
                handleSelectedST,
                applyModifications
            );

            const nodeInitVisitor = new NodeInitVisitor(context, selection);
            let selectedST = selection.selectedST;
            if (selectedST && STKindChecker.isQueryExpression(selectedST)) {
                const visitor = new QueryFindingVisitor(selectedST);
                traversNode(fnST, visitor);
                selectedST = visitor.getQuery();
            } else {
                selectedST = fnST;
            }
            traversNode(selectedST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        })();
    }, [selection, fnST]);

    return (
        <>
            <DataMapperDiagram
                nodes={nodes}
            />
        </>
    )
}

export const DataMapper = React.memo(DataMapperC);
