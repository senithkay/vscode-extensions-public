import React, { useEffect, useState } from "react";
import DataMapperDiagram from "../DiagramModel/DataMapperNode";

import { FunctionDefinition, STNode } from "@wso2-enterprise/syntax-tree";
import { DiagramEditorLangClientInterface } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export interface DataMapperProps {
    fnST: FunctionDefinition;
    langClientPromise: Promise<DiagramEditorLangClientInterface>;
}

export function DataMapper(props: DataMapperProps) {
    const {fnST, langClientPromise} = props;

    const [retType, setRetType] = useState<STNode>();

    useEffect(() => {
        async function getReturnType() {
            const typeSymbol = fnST.functionSignature.returnTypeDesc?.type?.typeData?.typeSymbol;
            if (typeSymbol) {
                const { moduleName, orgName, version } = typeSymbol?.moduleID;
                const langClient = await langClientPromise;
                const recResp = await langClient.getDocumentSymbol({
                    textDocument: {
                        uri: `file://`
                    }
                });
            }
        }
        getReturnType();
    }, [])
    return <>
        <DataMapperDiagram />
    </>
}