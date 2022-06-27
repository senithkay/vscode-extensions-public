import React, { useEffect, useState } from "react";
import DataMapperDiagram from "../Diagram/Diagram";

import { ExpressionFunctionBody, FunctionDefinition, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { getTypeDefinitionForTypeDesc } from "../../utils/st-utils";
import { DataMapperNodeModel } from "../Diagram/Node/model/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";

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
            // create output nodes
            const typeDesc = fnST.functionSignature.returnTypeDesc?.type;
            const typeDef = await getTypeDefinitionForTypeDesc(filePath, typeDesc, langClientPromise);
            const outputNode = new DataMapperNodeModel(
                context,
                fnST.functionBody as ExpressionFunctionBody, // TODO fix once we support other forms of functions
                typeDef,
                false,
                true
            );
            outputNode.setPosition(800, 100);

            // create input nodes
            const params = fnST.functionSignature.parameters;
            const inputNodes: DataMapperNodeModel[] = [];
            for (let i = 0; i < params.length; i++) {
                const param = params[i];
                if (STKindChecker.isRequiredParam(param)) {
                    const paramTypeDef = await getTypeDefinitionForTypeDesc(filePath, param.typeName, langClientPromise);
                    const paramNode = new DataMapperNodeModel(
                        context,
                        param,
                        paramTypeDef,
                        true,
                        false
                    );
                    paramNode.setPosition(100, 100 + i * 400); // 400 is an arbitary value, need to calculate exact heigt;
                    inputNodes.push(paramNode);
                } else {
                    // TODO for other param types
                }
            }
            setNodes([...inputNodes, outputNode]);
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