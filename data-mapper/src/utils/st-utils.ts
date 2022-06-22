import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { ModulePart, NodePosition, STKindChecker, STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { Location } from 'vscode-languageserver-protocol';


export async function getTypeDefinitionForTypeDesc(filePath: string, typeDesc: STNode,
    langClientPromise: Promise<BalleriaLanguageClient>): Promise<TypeDefinition> {

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
                    const { start, end } = defLoc.range;
                    if (startLine === start.line
                        && startColumn === start.character
                        && endLine === end.line
                        && endColumn === end.character) {
                        typeDef = mem;
                    }
                }
            })
            return typeDef;
        }
    } else {
        // TODO handle other cases
    }
    return undefined;
}


export function isObject (item: any) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}