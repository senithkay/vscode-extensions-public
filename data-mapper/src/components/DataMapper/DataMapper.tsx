import React, { useEffect, useState } from "react";

import DataMapperDiagram from "../Diagram/Diagram";

import { ExpressionFunctionBody, FunctionDefinition, STKindChecker, traversNode, traversNodeAsync, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { getTypeDefinitionForTypeDesc } from "../../utils/st-utils";
import { DataMapperNodeModel } from "../Diagram/Node/model/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import { ExpressionFunctionBodyNode, RequiredParamNode } from "../Diagram/Node";
import { NodeInitVisitor } from "../Diagram/visitors/NodeInitVisitor";

export interface DataMapperProps {
    fnST: FunctionDefinition;
    langClientPromise: Promise<BalleriaLanguageClient>;
    filePath: string;
    updateFileContent: (filePath: string, content: string) => Promise<boolean>;
}

function DataMapperC(props: DataMapperProps) {

    const { fnST, langClientPromise, filePath, updateFileContent } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    useEffect(() => {
        async function generateNodes() {
            const context = new DataMapperContext(
                filePath,
                fnST,
                langClientPromise,
                updateFileContent
            );

            const nodeInitVisitor = new NodeInitVisitor(context);
            traversNode(fnST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        }
        generateNodes();
    }, [fnST, filePath]);

    return <>
        {<DataMapperDiagram
            nodes={nodes}
        />
        }
    </>
}

export const DataMapper = React.memo(DataMapperC);