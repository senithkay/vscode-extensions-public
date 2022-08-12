import React, { useEffect, useState } from "react";

import {
    DiagramEditorLangClientInterface,
    ExpressionEditorLangClientInterface,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, traversNode } from "@wso2-enterprise/syntax-tree";

import "../../assets/fonts/Gilmer/gilmer.css";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";
import { handleDiagnostics } from "../Diagram/utils/ls-utils";
import { Diagnostic } from "vscode-languageserver-protocol";

export interface DataMapperProps {
    fnST: FunctionDefinition;
    langClientPromise?: () => Promise<DiagramEditorLangClientInterface>;
    filePath: string;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo?: STSymbolInfo
    applyModifications: (modifications: STModification[]) => void;
}

function DataMapperC(props: DataMapperProps) {

    const { fnST, langClientPromise, filePath, currentFile, stSymbolInfo, applyModifications } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    useEffect(() => {
        async function generateNodes() {
            const diagnostics=  await handleDiagnostics(filePath, langClientPromise)

            const context = new DataMapperContext(
                filePath,
                fnST,
                langClientPromise,
                currentFile,
                stSymbolInfo,
                applyModifications,
                diagnostics
            );

            const nodeInitVisitor = new NodeInitVisitor(context);
            traversNode(fnST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        }

        generateNodes();
    }, [fnST, filePath]);

    return (
        <>
            <DataMapperDiagram
                nodes={nodes}
            />
        </>
    )
}

export const DataMapper = React.memo(DataMapperC);
