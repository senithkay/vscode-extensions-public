/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { FunctionDeclaration, Node, SourceFile, Type, ts } from 'ts-morph';
import * as path from 'path';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';
import { DMProject } from '../datamapper/DMProject';

export function fetchIOTypes(filePath: string, functionName: string) {
    const inputTypes: DMType[] = [];
    let outputType: DMType | undefined;

    try {
        const tnfFn = getDMFunction(filePath, functionName);
        const sourceFile = tnfFn.getSourceFile();

        tnfFn.getParameters().forEach((param) => {
            inputTypes.push(getTypeInfo(param.getType(), []));
        });
        outputType = getTypeInfo(tnfFn.getReturnType(), []);
    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch input/output types. " + error.message);
    }

    return { inputTypes, outputType };
}

export function fetchSubMappingTypes(filePath: string, functionName: string) {
    try {
        const tnfFn = getDMFunction(filePath, functionName);
        return getVariableTypes(tnfFn, []);
    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch sub mapping types. " + error.message);
    }
}

export function getSources(filePath: string, functionName?: string) {
    let fileContent: string;
    let nonMappingFileContent: string = "";
    try {
        const resolvedPath = path.resolve(filePath);
        const project = DMProject.getInstance(resolvedPath).getProject();
        const sourceFile = project.getSourceFileOrThrow(resolvedPath);

        fileContent = sourceFile.getFullText();
        
        if (functionName) {
            const dmFunction = sourceFile.getFunctionOrThrow(functionName);
            const dmFunctionBody = dmFunction.getBody();
            const dmFunctionStart = dmFunctionBody?.getStart();
            const dmFunctionEnd = dmFunctionBody?.getEnd();
            nonMappingFileContent = fileContent.slice(0, dmFunctionStart) + fileContent.slice(dmFunctionEnd);
        }

    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch input/output types. " + error.message);
    }

    if (!fileContent) {
        throw new Error("[MI Data Mapper] No source file content found.");
    }
    return [fileContent, nonMappingFileContent];
}

export function getFunctionIOTypes(filePath: string, functionName: string) {
    try {
        const dmFunc = getDMFunction(filePath, functionName);
        const parameterType = dmFunc.getParameters()[0].getType().getText();
        const returnType = dmFunc.getReturnType().getText();
        return `${parameterType}/${returnType}`;
    } catch (error: any) {
        throw new Error("[MI Data Mapper] Failed to fetch function input/output types. " + error.message);
    }
}

export function deriveConfigName(filePath: string) {
    const parts = filePath.split(path.sep);
    const fileName = parts[parts.length - 1];
    return fileName.split(".")[0];
}

export function fetchCompletions(filePath: string, fileContent: string, cursorPosition: number) {
    const enrichedCompletions: { entry: ts.CompletionEntry, details: ts.CompletionEntryDetails }[] = [];
    const resolvedPath = path.resolve(filePath);
    const { completions, languageService } = getCompletions(resolvedPath, fileContent, cursorPosition);

    if (completions) {
        completions.entries.forEach(entry => {
            const details = getCompletionEntryDetails(languageService, entry, filePath, cursorPosition);

            if (details) {
                enrichedCompletions.push({ entry, details });
            }
        });
    }

    return enrichedCompletions;
}

export function fetchDiagnostics(filePath: string) {
    const project = DMProject.getInstance(filePath).getProject();
    const languageService = project.getLanguageService().compilerObject;

    const semanticDiagnostics = languageService.getSemanticDiagnostics(filePath);
    const syntacticDiagnostics = languageService.getSyntacticDiagnostics(filePath);

    // merge semanticDiagnostics and syntacticDiagnostics
    const allDiagnostics = [...semanticDiagnostics, ...syntacticDiagnostics];

    // remove duplicates
    const uniqueDiagnostics = allDiagnostics.filter((diagnostic, index, self) =>
        index === self.findIndex((t) => t.start === diagnostic.start && t.length === diagnostic.length)
    );

    return uniqueDiagnostics;
}

function getCompletions(filePath: string, fileContent: string, cursorPosition: number) {
    const project = DMProject.getInstance(filePath).getProject();
    project.getSourceFileOrThrow(filePath).replaceWithText(fileContent);

    const completionOptions = {
        includeCompletionsForModuleExports: true,
        includeCompletionsWithInsertText: true,
        includeAutomaticOptionalChainCompletions: true
    };
    const languageService = project.getLanguageService().compilerObject;
    const completions = languageService.getCompletionsAtPosition(filePath, cursorPosition, completionOptions);

    return { completions, languageService };
}

function getCompletionEntryDetails(
    languageService: ts.LanguageService,
    entry: ts.CompletionEntry,
    filePath: string,
    cursorPosition: number
) {
    const details = languageService.getCompletionEntryDetails(
        filePath,
        cursorPosition,
        entry.name,
        {},
        entry.source,
        {
            importModuleSpecifierPreference: 'relative',
        },
        entry.data
    );

    return details;
}

function getDMFunction(filePath: string, functionName: string) {
    try {
        const resolvedPath = path.resolve(filePath);
        const project = DMProject.getInstance(resolvedPath).getProject();
        const sourceFile = project.getSourceFileOrThrow(resolvedPath);
        return sourceFile.getFunctionOrThrow(functionName);
    } catch (error: any) {
        throw new Error("Transformation function not found. " + error.message);
    }
}

// Function to extract type information
function getTypeInfo(typeNode: Type, allInterfaces: string[]): DMType {
    if (typeNode.isInterface()) {
        return getTypeInfoForInterface(typeNode, allInterfaces);
    } else if (typeNode.isArray()) {
        return getTypeInfoForArray(typeNode, allInterfaces);
    } else if (typeNode.isObject()) {
        return getTypeInfoForObject(typeNode, allInterfaces);
    } else if (typeNode.isString()) {
        return { kind: TypeKind.String, optional: typeNode.isNullable() };
    } else if (typeNode.isBoolean()) {
        return { kind: TypeKind.Boolean, optional: typeNode.isNullable() };
    } else if (typeNode.isNumber()) {
        return { kind: TypeKind.Number, optional: typeNode.isNullable() };
    } else if (typeNode.isUnion()) {
        return getTypeInfoForUnion(typeNode, allInterfaces);
    }

    return { kind: TypeKind.Unknown };
}

// Find the types of variables declared in the function
function getVariableTypes(fn: FunctionDeclaration, allInterfaces: string[]) {
    const variableTypes: Record<string, DMType | undefined> = {};

    fn.getVariableStatements().forEach((stmt) => {
        const varDecl = stmt.getDeclarations()[0];
        const type = varDecl && getTypeInfo(varDecl.getType(), allInterfaces);
        const key = varDecl.getStart().toString() + varDecl.getEnd().toString();
        variableTypes[key] = type;
    });

    return variableTypes;
}

function getTypeInfoForInterface(typeNode: Type, allInterfaces: string[]): DMType {

    const typeSymbol = typeNode.getSymbol();
    if (!typeSymbol) return { kind: TypeKind.Unknown };

    const declarations = typeSymbol?.getDeclarations();
    const interfaceNode = declarations?.find(Node.isInterfaceDeclaration);

    if (!interfaceNode) {
        return { kind: TypeKind.Unknown };
    }

    const typeName = typeSymbol.getName();

    if(allInterfaces.includes(typeName)) {
        return {
            kind: TypeKind.Interface,
            typeName,
            optional: typeNode.isNullable(),
            isRecursive: true
        };
    } else {
        allInterfaces.push(typeName);
    }

    const fields = interfaceNode.getMembers().map(member => {
        if (Node.isPropertySignature(member)) {
            return {
                ...getTypeInfo(member.getType()!, allInterfaces),
                fieldName: member.getName(),
                optional: !!member.getQuestionTokenNode()
            };
        }
    }).filter(Boolean) as DMType[];

    return {
        kind: TypeKind.Interface,
        typeName,
        fields,
        optional: typeNode.isNullable()
    };
}

function getTypeInfoForArray(typeNode: Type, allInterfaces: string[]): DMType {
    const elementType = getTypeInfo(typeNode.getArrayElementType()!, allInterfaces);
    return {
        kind: TypeKind.Array,
        memberType: elementType,
        optional: typeNode.isNullable()
    };
}

function getTypeInfoForObject(typeNode: Type, allInterfaces: string[]): DMType {
    const properties = typeNode.getProperties();
    const fields: DMType[] = [];

    properties.forEach(property => {
        const decls = property.getDeclarations();
        const dmType = decls.map(decl => {
            if (Node.isPropertySignature(decl) || Node.isPropertyAssignment(decl)) {
                return {
                    ...getTypeInfo(decl.getType()!, allInterfaces),
                    fieldName: decl.getName(),
                    optional: !!decl.getQuestionTokenNode()
                };
            }
        }).filter(Boolean) as DMType[];
        fields.push(...dmType);
    });

    return {
        kind: TypeKind.Interface,
        typeName: 'Object',
        fields,
        optional: typeNode.isNullable()
    };
}

function getTypeInfoForUnion(typeNode: Type, allInterfaces: string[]): DMType {
    const unionTypes = typeNode.getUnionTypes().map(type => {
        if (type.isBooleanLiteral()) {
            if (type.getText() === 'true') {
                return { kind: TypeKind.Boolean };
            }
        } else {
            return getTypeInfo(type, allInterfaces);
        }
    }).filter(Boolean) as DMType[];
    
    return {
        kind: TypeKind.Union,
        typeName: typeNode.getAliasSymbol()?.getName(),
        unionTypes,
        optional: typeNode.isNullable()
    };
}
