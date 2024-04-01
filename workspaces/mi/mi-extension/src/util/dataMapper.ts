/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as ts from 'typescript';
import * as path from 'path';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

// Interface definitions
const interfaces: { [key: string]: ts.InterfaceDeclaration } = {};

let inputTypes: DMType[] = [];
let outputType: DMType | undefined;
let functionST: ts.VariableDeclaration | undefined;

export function fetchIOTypes(filePath: string, functionName: string) {
    inputTypes = [];
    outputType = undefined;

    try {
        const resolvedPath = path.resolve(filePath);
        const sourceFile = getSourceFile(resolvedPath);
        collectInterfaces(sourceFile);
        ts.forEachChild(sourceFile, (node) => findInputsAndOutput(node, functionName));
    } catch (error: any) {
        throw new Error("Error while creating input/output types. " + error.message);
    }

    return { inputTypes, outputType };
}

export function fetchFunctionST(filePath: string, functionName: string) {
    functionST = undefined;

    try {
        const resolvedPath = path.resolve(filePath);
        const sourceFile = getSourceFile(resolvedPath);
        ts.forEachChild(sourceFile, (node) => findFunctionST(node, functionName));
    } catch (error: any) {
        throw new Error("Error while fetching the ST of transformation function. " + error.message);
    }

    return functionST;
}

export function getSourceCode(resolvedPath: string) {
    const sourceCode = ts.sys.readFile(resolvedPath, 'utf-8');

    if (!sourceCode) {
        throw new Error("File not found.");
    }
    return sourceCode;
}

function getSourceFile(resolvedPath: string) {
    const sourceCode = getSourceCode(resolvedPath);
    // Parse the TypeScript code
    const sourceFile = ts.createSourceFile(resolvedPath, sourceCode, ts.ScriptTarget.Latest, true);
    return sourceFile;
}

// Traverse AST to collect interface declarations
function collectInterfaces(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
        interfaces[node.name.text] = node;
    }
    ts.forEachChild(node, collectInterfaces);
}

// Find inputs and output types
function findInputsAndOutput(node: ts.Node, functionName: string) {
    if (ts.isVariableStatement(node)) {
        const declarationList = node.declarationList;
        const variableDeclaration = declarationList.declarations[0];
        const fnName = (variableDeclaration.name as any).text;
        const initializer = variableDeclaration.initializer;
        if (fnName === functionName && initializer && ts.isArrowFunction(initializer)) {
            const parameters = initializer.parameters;
            parameters.forEach((param) => {
                if (ts.isParameter(param)) {
                    inputTypes.push(getTypeInfo(param.type!));
                }
            });
            outputType = getTypeInfo(initializer.type!);
        }
    }
}

// Find syntax tree of the function
function findFunctionST(node: ts.Node, functionName: string) {
    if (ts.isVariableStatement(node)) {
        const declarationList = node.declarationList;
        const variableDeclaration = declarationList.declarations[0];
        const fnName = (variableDeclaration.name as any).text;
        const initializer = variableDeclaration.initializer;
        if (fnName === functionName && initializer && ts.isArrowFunction(initializer)) {
            functionST = variableDeclaration;
        }
    }
}

// Function to extract type information
function getTypeInfo(typeNode: ts.TypeNode): DMType {
    if (ts.isTypeReferenceNode(typeNode)) {
        const typeName = (typeNode.typeName as any).text;
        if (interfaces[typeName]) {
            const interfaceNode = interfaces[typeName];
            const fields = interfaceNode.members.map(member => {
                if (ts.isPropertySignature(member)) {
                    return {
                        ...getTypeInfo(member.type!),
                        fieldName: (member.name as any).text
                    }
                }
            }).filter(Boolean) as DMType[];
            return {
                kind: TypeKind.Interface,
                typeName,
                fields
            };
        }
    } else if (ts.isArrayTypeNode(typeNode)) {
        const elementType = getTypeInfo(typeNode.elementType);
        return {
            kind: TypeKind.Array,
            memberType: elementType
        };
    } else if (ts.isParenthesizedTypeNode(typeNode)) {
        return getTypeInfo(typeNode.type);
    } else if (typeNode.kind === ts.SyntaxKind.StringKeyword) {
        return { kind: TypeKind.String };
    } else if (typeNode.kind === ts.SyntaxKind.BooleanKeyword) {
        return { kind: TypeKind.Boolean };
    } else if (typeNode.kind === ts.SyntaxKind.NumberKeyword) {
        return { kind: TypeKind.Number };
    } else if (ts.isTypeLiteralNode(typeNode)) {
        return { kind: TypeKind.Object };
    }

    return { kind: TypeKind.Unknown };
}
