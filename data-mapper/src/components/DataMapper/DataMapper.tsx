import React, { useEffect, useReducer, useState } from "react";

import {
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionDefinition,
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

export interface DataMapperProps {
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
    onClose: () => void;
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
                diagnostics
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
        <>
            <DataMapperDiagram
                nodes={nodes}
            />
            <DataMapperConfigPanel {...props}/>
        </>
    )
}

export const DataMapper = React.memo(DataMapperC);
