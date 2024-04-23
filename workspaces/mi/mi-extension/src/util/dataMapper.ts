/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ts, Node, Project, SourceFile, Type, ParameterDeclaration } from 'ts-morph';
import * as path from 'path';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

let inputTypes: DMType[] = [];
let outputType: DMType | undefined;

export function fetchIOTypes(filePath: string, functionName: string) {
    inputTypes = [];
    outputType = undefined;

    try {
        const resolvedPath = path.resolve(filePath);
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath(resolvedPath);
        findInputsAndOutput(functionName, sourceFile);
    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch input/output types. " + error.message);
    }

    return { inputTypes, outputType };
}

export function getSources(filePath: string) {
    let fileContent: string;
    let interfaceSource: string;
    try {
        const resolvedPath = path.resolve(filePath);
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath(resolvedPath);

        fileContent = sourceFile.getText();
        interfaceSource = sourceFile.getInterfaces().map((interfaceNode) => {
            return interfaceNode.getText();
        }).join('\n');

    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch input/output types. " + error.message);
    }

    if (!fileContent || !interfaceSource) {
        throw new Error("[MI Data Mapper] Function or interfaces not found in the source file.");
    }
    return [fileContent, interfaceSource];
}

// Find inputs and output types
function findInputsAndOutput(functionName: string, sourceFile: SourceFile) {
    const fn = sourceFile.getFunctionOrThrow(functionName);

    if (fn) {
        fn.getParameters().forEach((param) => {
            inputTypes.push(getTypeInfo(param.getType(), sourceFile));
        });
        outputType = getTypeInfo(fn.getReturnType(), sourceFile);
    }
}

// Function to extract type information
function getTypeInfo(typeNode: Type, sourceFile: SourceFile): DMType {
    if (typeNode.isInterface()) {
        const typeName = typeNode.getText();
        const interfaceNode = sourceFile.getInterface(typeName);

        if (interfaceNode) {
            const fields = interfaceNode.getMembers().map(member => {
                if (Node.isPropertySignature(member)) {
                    return {
                        ...getTypeInfo(member.getType()!, sourceFile),
                        fieldName: member.getName()
                    }
                }
            }).filter(Boolean) as DMType[];
            return {
                kind: TypeKind.Interface,
                typeName,
                fields
            };
        }
    }
    else if (typeNode.isArray()) {
        const elementType = getTypeInfo(typeNode.getArrayElementType()!, sourceFile);
        return {
            kind: TypeKind.Array,
            memberType: elementType
        };
    } else if (typeNode.isString()) {
        return { kind: TypeKind.String };
    } else if (typeNode.isBoolean()) {
        return { kind: TypeKind.Boolean };
    } else if (typeNode.isNumber()) {
        return { kind: TypeKind.Number };
    } else if (typeNode.isObject()) {
        return { kind: TypeKind.Object };
    }

    return { kind: TypeKind.Unknown };
}
