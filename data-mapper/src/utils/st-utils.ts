import {
    ModulePart,
    NodePosition,
    RecordTypeDesc,
    STKindChecker,
    STNode,
    TypeDefinition
} from "@wso2-enterprise/syntax-tree";
import { Location } from 'vscode-languageserver-protocol';

import { IDataMapperContext } from "./DataMapperContext/DataMapperContext";


export async function getTypeDefinitionForTypeDesc(typeDesc: STNode,
                                                   context: IDataMapperContext): Promise<TypeDefinition> {

    if (typeDesc && STKindChecker.isSimpleNameReference(typeDesc)) {
        const { position } = typeDesc;
        const langClient = await context.getLangClient();

        const defReply = await langClient.definition({
            position: {
                line: position?.startLine,
                character: position?.startColumn
            },
            textDocument: {
                uri: `file://${context.filePath}`
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

export async function getTypeDescForFieldName(fieldName: STNode, context: IDataMapperContext): Promise<RecordTypeDesc> {

    if (fieldName && STKindChecker.isSimpleNameReference(fieldName)) {
        const { position } = fieldName;
        const langClient = await context.getLangClient();

        const defReply = await langClient.definition({
            position: {
                line: position?.startLine,
                character: position?.startColumn
            },
            textDocument: {
                uri: `file://${context.filePath}`
            }
        });
        const defLoc: Location = Array.isArray(defReply) ? defReply[0] as Location : defReply;
        const stResp = await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: defLoc.uri
            }
        });
        if (stResp.parseSuccess) {
            const modPart = stResp.syntaxTree as ModulePart;
            let typeDesc: RecordTypeDesc;
            modPart.members.forEach((mem) => {
                if (STKindChecker.isTypeDefinition(mem)) {
                    const { startLine, startColumn, endLine, endColumn } = mem.typeName.position as NodePosition;
                    const { start, end } = defLoc.range;
                    if (startLine === start.line
                        && startColumn === start.character
                        && endLine === end.line
                        && endColumn === end.character) {
                        typeDesc = mem.typeDescriptor as RecordTypeDesc;
                    } else if (mem.position.startLine <= start.line
                        && mem.position.endLine >= end.line
                        && STKindChecker.isRecordTypeDesc(mem.typeDescriptor)) {
                        {
                            mem.typeDescriptor.fields.forEach((field) => {
                                if (STKindChecker.isRecordField(field)) {
                                    const { startLine : sl, startColumn : sc, endLine : el, endColumn : ec } = field.fieldName.position as NodePosition;
                                    if (sl === start.line
                                        && sc === start.character
                                        && el === end.line
                                        && ec === end.character) {
                                        if (STKindChecker.isArrayTypeDesc(field.typeName)) {
                                            typeDesc = field.typeName.memberTypeDesc as RecordTypeDesc;
                                        }
                                    }
                                }
                            })
                        }
                    }
                }
            })
            return typeDesc;
        }
    } else {
        // TODO handle other cases
    }
    return undefined;
}

export function isObject (item: any) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}
