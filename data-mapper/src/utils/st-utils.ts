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

    const isSimpleNameReference = STKindChecker.isSimpleNameReference(typeDesc);
    const isQualifiedNameReference = STKindChecker.isQualifiedNameReference(typeDesc);
    if (typeDesc && (isSimpleNameReference || isQualifiedNameReference)) {
        const { position } = isSimpleNameReference ? typeDesc : typeDesc.identifier;
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
                        && STKindChecker.isRecordTypeDesc(mem.typeDescriptor))
                    {
                        typeDesc = findRecordTypeDesc(mem.typeDescriptor, defLoc);
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

// function findRecordTypeDesc(members: RecordTypeDesc, expectedLocation: Location): RecordTypeDesc {
//     const { start, end } = expectedLocation.range;
//     for (const field of members.fields) {
//         if (STKindChecker.isRecordField(field)) {
//             const {startLine, startColumn, endLine, endColumn } = field.fieldName.position as NodePosition;
//             if (startLine === start.line
//                 && startColumn === start.character
//                 && endLine === end.line
//                 && endColumn === end.character
//                 && STKindChecker.isArrayTypeDesc(field.typeName))
//             {
//                 return field.typeName.memberTypeDesc as RecordTypeDesc;
//             } else if (STKindChecker.isRecordTypeDesc(field.typeName)) {
//                 findRecordTypeDesc(field.typeName, expectedLocation);
//             }
//         }
//     }
//     return undefined;
// }

// function findRecordTypeDesc(members: RecordTypeDesc, expectedLocation: Location): RecordTypeDesc {
//     const { start, end } = expectedLocation.range;
//     const typeDesc = members.fields.map((field) => {
//         if (STKindChecker.isRecordField(field)) {
//             const {startLine, startColumn, endLine, endColumn } = field.fieldName.position as NodePosition;
//             if (startLine === start.line
//                 && startColumn === start.character
//                 && endLine === end.line
//                 && endColumn === end.character
//                 && STKindChecker.isArrayTypeDesc(field.typeName))
//             {
//                 return field.typeName.memberTypeDesc as RecordTypeDesc;
//             } else if (STKindChecker.isRecordTypeDesc(field.typeName)) {
//                 return findRecordTypeDesc(field.typeName, expectedLocation);
//             } else {
//                 return undefined;
//             }
//         }
//     });
//     return typeDesc[0];
// }

function findRecordTypeDesc(members: RecordTypeDesc, expectedLocation: Location): RecordTypeDesc {
    const { start, end } = expectedLocation.range;
    let typeDesc;
    members.fields.map((field) => {
        if (STKindChecker.isRecordField(field)) {
            const {startLine, startColumn, endLine, endColumn } = field.fieldName.position as NodePosition;
            if (startLine === start.line
                && startColumn === start.character
                && endLine === end.line
                && endColumn === end.character
                && STKindChecker.isArrayTypeDesc(field.typeName))
            {
                typeDesc = field.typeName.memberTypeDesc as RecordTypeDesc;
            }
        }
    });
    return typeDesc;
}
