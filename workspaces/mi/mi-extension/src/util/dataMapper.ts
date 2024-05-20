/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { FunctionDeclaration, Node, Project, SourceFile, Type } from 'ts-morph';
import * as path from 'path';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

let inputTypes: DMType[] = [];
let outputType: DMType | undefined;
let variableTypes: Record<string, DMType | undefined> = {};

export function fetchDMTypes(filePath: string, functionName: string) {
    inputTypes = [];
    outputType = undefined;

    try {
        const resolvedPath = path.resolve(filePath);
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath(resolvedPath);
        findTypes(functionName, sourceFile);
    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch input/output types. " + error.message);
    }

    return { inputTypes, outputType, variableTypes };
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

export function deriveConfigName(filePath: string) {
    const parts = filePath.split(path.sep);
    const fileName = parts[parts.length - 1];
    return fileName.split(".")[0];
}

// Find input, output and variable types
function findTypes(functionName: string, sourceFile: SourceFile) {
    const fn = sourceFile.getFunctionOrThrow(functionName);

    if (fn) {
        fn.getParameters().forEach((param) => {
            inputTypes.push(getTypeInfo(param.getType(), sourceFile));
        });
        outputType = getTypeInfo(fn.getReturnType(), sourceFile);
        variableTypes = getVariableTypes(fn);
    }
}

// Function to extract type information
function getTypeInfo(typeNode: Type, sourceFile: SourceFile): DMType {
    if (typeNode.isInterface()) {
        return getTypeInfoForInterface(typeNode, sourceFile);
    } else if (typeNode.isArray()) {
        return getTypeInfoForArray(typeNode, sourceFile);
    } else if (typeNode.isObject()) {
        return getTypeInfoForObject(typeNode, sourceFile);
    } else if (typeNode.isString()) {
        return { kind: TypeKind.String };
    } else if (typeNode.isBoolean()) {
        return { kind: TypeKind.Boolean };
    } else if (typeNode.isNumber()) {
        return { kind: TypeKind.Number };
    }

    return { kind: TypeKind.Unknown };
}

// Find the types of variables declared in the function
function getVariableTypes(fn: FunctionDeclaration) {
    const variableTypes: Record<string, DMType | undefined> = {};

    fn.getVariableStatements().forEach((stmt) => {
        const varDecl = stmt.getDeclarations()[0];
        const varInit = varDecl.getInitializer();
        const type = varInit && getTypeInfo(varInit.getType(), fn.getSourceFile());
        const key = varDecl.getStart().toString() + varDecl.getEnd().toString();
        variableTypes[key] = type;
    });

    return variableTypes;
}

function getTypeInfoForInterface(typeNode: Type, sourceFile: SourceFile): DMType {
    const typeName = typeNode.getText();
    const interfaceNode = sourceFile.getInterface(typeName);

    if (!interfaceNode) {
        return { kind: TypeKind.Unknown };
    }

    const fields = interfaceNode.getMembers().map(member => {
        if (Node.isPropertySignature(member)) {
            return {
                ...getTypeInfo(member.getType()!, sourceFile),
                fieldName: member.getName()
            };
        }
    }).filter(Boolean) as DMType[];

    return {
        kind: TypeKind.Interface,
        typeName,
        fields
    };
}

function getTypeInfoForArray(typeNode: Type, sourceFile: SourceFile): DMType {
    const elementType = getTypeInfo(typeNode.getArrayElementType()!, sourceFile);
    return {
        kind: TypeKind.Array,
        memberType: elementType
    };
}

function getTypeInfoForObject(typeNode: Type, sourceFile: SourceFile): DMType {
    const properties = typeNode.getProperties();
    const fields: DMType[] = [];

    properties.forEach(property => {
        const decls = property.getDeclarations();
        const dmType = decls.map(decl => {
            if (Node.isPropertySignature(decl)) {
                return {
                    ...getTypeInfo(decl.getType()!, sourceFile),
                    fieldName: decl.getName()
                };
            }
        }).filter(Boolean) as DMType[];
        fields.push(...dmType);
    });

    return {
        kind: TypeKind.Interface,
        typeName: 'Object',
        fields
    };
}
