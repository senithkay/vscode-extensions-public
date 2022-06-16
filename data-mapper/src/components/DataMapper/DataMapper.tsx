import React, { useEffect, useState } from "react";
import DataMapperDiagram from "../DiagramModel/DataMapperNode";

import { FunctionDefinition, ModulePart, NodePosition, STKindChecker, STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { Location } from 'vscode-languageserver-protocol';

export interface DataMapperProps {
    fnST: FunctionDefinition;
    langClientPromise: Promise<BalleriaLanguageClient>;
    filePath: string;
}

export function DataMapper(props: DataMapperProps) {
    const {fnST, langClientPromise, filePath} = props;

    const [retType, setRetType] = useState<TypeDefinition>();

    useEffect(() => {
        async function getReturnType() {
            const typeDesc = fnST.functionSignature.returnTypeDesc?.type;
            if (typeDesc && STKindChecker.isSimpleNameReference(typeDesc)) {
                const { position } = typeDesc;
                const langClient = await langClientPromise;
                
                const defReply = await langClient.definition({
                    position: {
                        line: position?.startLine,
                        character: position?.startColumn
                    },
                    textDocument: {
                        uri: `file://${filePath}`
                    }
                });
                let defLoc: Location;
                if (Array.isArray(defReply)) {
                    defLoc = defReply[0] as Location;
                } else {
                    defLoc = defReply;
                }
                const stResp = await langClient.getSyntaxTree({
                    documentIdentifier: {
                        uri: defLoc.uri
                    }
                });
                if (stResp.parseSuccess) {
                    const modPart = stResp.syntaxTree as ModulePart;
                    let typeDef: TypeDefinition;
                    modPart.members.forEach((mem) => {
                        if (STKindChecker.isTypeDefinition(mem)) {
                           const { startLine, startColumn, endLine, endColumn } = mem.typeName.position as NodePosition;
                           const { start, end} = defLoc.range;
                           if (startLine === start.line
                            && startColumn === start.character
                            && endLine === end.line
                            && endColumn === end.character) {
                                typeDef = mem;
                           }
                        }
                    })
                    setRetType(typeDef);
                }
            } else {
                // TODO handle other cases
            }
        }
        getReturnType();
    }, [])
    return <>
        <DataMapperDiagram />
    </>
}