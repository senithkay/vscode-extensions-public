/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 */

import { compile } from './../datamapper/schema-to-typescript';
import * as fs from "fs";
import path = require("path");
import { Uri, workspace } from "vscode";
import { JSONSchema3or4 } from 'to-json-schema';
import * as ts from "typescript";
import {DM_OPERATORS_FILE, DM_OPERATORS_IMPORT_NAME} from "../constants";

export function generateTSInterfacesFromSchemaFile(schema: JSONSchema3or4, schemaTitle: string): Promise<string> {
    const ts = compile(schema, "Schema", schemaTitle, {bannerComment: ""});
    return ts;
}

export async function updateDMC(dmName:string, sourcePath: string, schema: JSONSchema3or4, ioType: string): Promise<string> {
    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(sourcePath));
    if (workspaceFolder) {
        const dataMapperConfigFolder = path.join(
            workspaceFolder.uri.fsPath, 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'datamapper');
        const tsFilepath = path.join(dataMapperConfigFolder, dmName, `${dmName}.ts`);
        const tsSource = getTsAST(tsFilepath);
        const tsSources:ts.SourceFile[] = separateInterfacesWithComments(tsSource);
        const functionSource = getFunctionFromSource(tsSource, "mapFunction");
        let tsContent = "";
        const readAndConvertSchema = async (schema: JSONSchema3or4, defaultTitle: string) => {
            const isSchemaArray = schema.type === "array";
            const schemaTitle = schema.title;
            schema.title = schema.title ? formatTitle(schema.title) : defaultTitle;
            if (schema.type === "array" && schema.items && schema.items.length > 0) {
                schema.type = "object";
                schema.properties = schema.items[0].properties;
            }
            const tsInterfaces = schema ? await generateTSInterfacesFromSchemaFile(schema, schemaTitle) 
                : `interface ${defaultTitle} {\n}\n\n`;
            return { tsInterfaces, isSchemaArray, schemaTitle };
        };
        
        let {  
            tsInterfaces, 
            isSchemaArray, 
            schemaTitle
        } = await readAndConvertSchema(schema, "Root");
        function findIndexByComment(tsSources, type) {
            for (let i = 0; i < tsSources.length; i++) {
                const source = tsSources[i];
                const commentRange = ts.getTrailingCommentRanges(source.getFullText().trim(), 0);
                if (commentRange) {
                    const comment = source.getFullText().substring(commentRange[0].pos, commentRange[0].end);
                    if (comment.includes(`${type}Type`)) {
                        return i;
                    }
                }
            }
            return -1; // Return -1 if not found
        }
        
        let index = 0;
        const type = ioType.toLowerCase();
        if (type === "input" || type === "output") {
            index = findIndexByComment(tsSources, type);
            if (index !== -1) {
                tsSources.splice(index, 1, ts.createSourceFile(`${schemaTitle}.ts`, tsInterfaces, ts.ScriptTarget.Latest, true));
            } else {
                return "";
            }
        }
        tsContent += `import * as ${DM_OPERATORS_IMPORT_NAME} from "./${DM_OPERATORS_FILE}";\n`;
        tsSources.forEach((source) => {
            tsContent += source.getFullText();
            tsContent += "\n\n";
        });
        if (functionSource) {
            tsContent += "\n" + getFunctionDeclaration(tsSources, ioType, isSchemaArray, functionSource);
        }
        fs.writeFileSync(tsFilepath, tsContent);
    }
    return "";
}

function formatTitle(title: string): string {
    const titleSegment = getTitleSegment(title);
    return capitalizeFirstLetter(titleSegment);
}

function getTitleSegment(title: string): string {
    if (title) {
        const parts = title.split(":");
        return parts[parts.length - 1];
    }
    return title;
}

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTsAST(tsFilePath: string): ts.SourceFile {
    const tsContent = fs.readFileSync(tsFilePath, "utf8");
    return ts.createSourceFile(tsFilePath, tsContent, ts.ScriptTarget.Latest, true);
}

function separateInterfacesWithComments(sourceFile: ts.SourceFile): ts.SourceFile[] {
    const resultSourceFiles: ts.SourceFile[] = [];
  
    const visitNode = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        const nodeText = node.getFullText(sourceFile);
        const newSourceFile = ts.createSourceFile(`${node.name.text}.ts`, nodeText.trim(), ts.ScriptTarget.Latest, true);
        resultSourceFiles.push(newSourceFile);
      }
      ts.forEachChild(node, visitNode);
    };
  
    visitNode(sourceFile);
  
    return resultSourceFiles;
  }

  function getInterfaceNameFromSource(source: ts.SourceFile): string {
    let interfaceName = "any";
  
    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node)) {
        interfaceName = node.name.text;
        return;
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return interfaceName;
  }

  function getFunctionFromSource(source: ts.SourceFile, functionName: string): ts.FunctionDeclaration | undefined {
    let functionNode: ts.FunctionDeclaration | undefined;
  
    const visit = (node: ts.Node) => {
      if (ts.isFunctionDeclaration(node)) {
        if (node.name?.text === functionName) {
          functionNode = node;
          return;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return functionNode;
  }
  
  function getFunctionDeclaration(tsSources: ts.SourceFile[], ioType: string, isSchemaArray: boolean,
    functionSource: ts.FunctionDeclaration): string {
    let inputInterfaceName = "Root";
    let outputInterfaceName = "OutputRoot";

    let isInputArray = functionSource?.parameters[0].type?.kind === ts.SyntaxKind.ArrayType;
    let isOutputArray = functionSource?.type?.kind === ts.SyntaxKind.ArrayType;

    if (isSchemaArray) {
        if (ioType === "input") {
            isInputArray = true;
        }
        if (ioType === "output") {
            isOutputArray = true;
        }
    }
  
    for (let source of tsSources) {
      const commentRange = ts.getTrailingCommentRanges(source.getFullText(), 0);
      if (commentRange) {
        const comment = source.getFullText().substring(commentRange[0].pos, commentRange[0].end);
        if (comment.includes("inputType")) {
          inputInterfaceName = getInterfaceNameFromSource(source);
        } else if (comment.includes("outputType")) {
          outputInterfaceName = getInterfaceNameFromSource(source);
        }
      }
    }
    let functionDeclaration = `function mapFunction(input: ${inputInterfaceName}${isInputArray ? "[]" : ""}): ${outputInterfaceName}${isOutputArray ? "[]" : ""} {\n`;
    functionDeclaration += `\treturn ${isOutputArray ? "[]" : "{}"}\n}\n\n`; 
    return functionDeclaration;
  }
