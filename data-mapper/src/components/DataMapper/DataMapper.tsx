import React, { useEffect, useState } from "react";
import DataMapperDiagram from "../Diagram/Diagram";

import { FunctionDefinition, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { getTypeDefinitionForTypeDesc } from "../../utils/st-utils";
import { useDMStore } from "../../store/store";

export interface DataMapperProps {
    fnST: FunctionDefinition;
    langClientPromise: Promise<BalleriaLanguageClient>;
    filePath: string;
}

function DataMapperC(props: DataMapperProps) {
    const { fnST, langClientPromise, filePath } = props;

    const [retType, setRetType] = useState<TypeDefinition>();
    const [paramTypes, setParamTypes] = useState<Map<string, TypeDefinition>>(undefined);

    const setFunctionST = useDMStore((state) => state.setFunctionST);
    const setFilePath = useDMStore((state) => state.setFilePath);
    const setLangClientPromise = useDMStore((state) => state.setLangClientPromise);

    useEffect(() => {
        async function fetchTypes() {
            const typeDesc = fnST.functionSignature.returnTypeDesc?.type;
            const typeDef = await getTypeDefinitionForTypeDesc(filePath, typeDesc, langClientPromise);
            setRetType(typeDef);
            const params = fnST.functionSignature.parameters;
            const paramTypesMap = new Map<string, TypeDefinition>();
            for (let i = 0; i < params.length; i++) {
                const param = params[i];
                if (STKindChecker.isRequiredParam(param)) {
                    console.log(param);
                    const paramName = param?.paramName?.value;
                    const paramTypeDef = await getTypeDefinitionForTypeDesc(filePath, param.typeName, langClientPromise);
                    paramTypesMap.set(paramName, paramTypeDef);
                } else {
                    // TODO for other param types
                }
            }
            setParamTypes(paramTypesMap);
        }
        fetchTypes();
    }, [fnST, filePath])

    useEffect(() => {
        setFilePath(filePath);
        setFunctionST(fnST);
    }, [filePath, fnST]);

    useEffect(() => {
        setLangClientPromise(langClientPromise);
    }, [langClientPromise]);

    return <>
        {paramTypes && retType &&
            <DataMapperDiagram
                paramTypes={paramTypes}
                returnType={retType}
            />
        }
    </>
}

export const DataMapper = React.memo(DataMapperC);