/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ts, Node, Project, SourceFile, Type } from 'ts-morph';
import * as path from 'path';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

let sourceFile: SourceFile;

let inputTypes: DMType[] = [];
let outputType: DMType | undefined;

export function fetchIOTypes(filePath: string, functionName: string) {
    inputTypes = [];
    outputType = undefined;

    try {
        const resolvedPath = path.resolve(filePath);
        const project = new Project();
        sourceFile = project.addSourceFileAtPath(resolvedPath);
        findInputsAndOutput(functionName);
    } catch (error: any) {
        throw new Error("Error while creating input/output types. " + error.message);
    }

    return { inputTypes, outputType };
}

export function getSourceCode(resolvedPath: string) {
    const sourceCode = ts.sys.readFile(resolvedPath, 'utf-8');

    if (!sourceCode) {
        throw new Error("File not found.");
    }
    return sourceCode;
}

// Find inputs and output types
function findInputsAndOutput(functionName: string) {
    const varDecls = sourceFile.getVariableDeclarations();
    varDecls.forEach((varDecl) => {
        const variableDeclaration = varDecl
            .getVariableStatementOrThrow()
            .getDeclarationList()
            .getDeclarations()[0];
        const fnName = variableDeclaration.getName();
        const initializer = variableDeclaration.getInitializer();

        if (fnName === functionName && initializer && Node.isArrowFunction(initializer)) {
            const parameters = initializer.getParameters();
            parameters.forEach((param) => {
                inputTypes.push(getTypeInfo(param.getType()));
            });
            outputType = getTypeInfo(initializer.getReturnType());
        }
    });
}

// Function to extract type information
function getTypeInfo(typeNode: Type): DMType {
    if (typeNode.isInterface()) {
        const typeName = typeNode.getText();
        const interfaceNode = sourceFile.getInterface(typeName);

        if (interfaceNode) {
            const fields = interfaceNode.getMembers().map(member => {
                if (Node.isPropertySignature(member)) {
                    return {
                        ...getTypeInfo(member.getType()!),
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
        const elementType = getTypeInfo(typeNode.getArrayElementType()!);
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
