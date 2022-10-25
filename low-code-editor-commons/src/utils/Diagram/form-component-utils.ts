/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import { PublishDiagnosticsParams } from "../../types";

export const FILE_SCHEME = "file://";
export const EXPR_SCHEME = "expr://";

export function getUpdatedSource(statement: string, currentFileContent: string,
                                 targetPosition: NodePosition, moduleList?: Set<string>,
                                 skipSemiColon?: boolean): string {

    const updatedStatement = skipSemiColon ? statement : (statement.trim().endsWith(';') ? statement : statement + ';');
    return addToTargetPosition(currentFileContent, targetPosition, updatedStatement);
}

export function addToTargetPosition(currentContent: string, position: NodePosition, codeSnippet: string): string {

    const splitContent: string[] = currentContent.split(/\n/g) || [];
    const splitCodeSnippet: string[] = codeSnippet.trimEnd().split(/\n/g) || [];
    const noOfLines: number = position.endLine - position.startLine + 1;
    const startLine = splitContent[position.startLine].slice(0, position.startColumn);
    const endLine = isFinite(position?.endLine) ?
        splitContent[position.endLine].slice(position.endColumn || position.startColumn) : '';

    const replacements = splitCodeSnippet.map((line, index) => {
        let modifiedLine = line;
        if (index === 0) {
            modifiedLine = startLine + modifiedLine;
        }
        if (index === splitCodeSnippet.length - 1) {
            modifiedLine = modifiedLine + endLine;
        }
        if (index > 0) {
            modifiedLine = " ".repeat(position.startColumn) + modifiedLine;
        }
        return modifiedLine;
    });

    splitContent.splice(position.startLine, noOfLines, ...replacements);

    return splitContent.join('\n');
}

export async function checkDiagnostics(path: string, updatedContent: string, ls: Promise<IBallerinaLangClient>, targetPosition: NodePosition) {
    const fileURI = monaco.Uri.file(path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
    await sendDidChange(fileURI, updatedContent, ls);
    return handleDiagnostics(updatedContent, fileURI, targetPosition, ls);
}

export const handleDiagnostics = async (source: string, fileURI: string, targetPosition: NodePosition,
                                        langClientPromise: Promise<IBallerinaLangClient>):
    Promise<Diagnostic[]> => {
    const diagResp = await getDiagnostics(fileURI, langClientPromise);
    const diag = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
    return diag;
}

export async function getDiagnostics(
    docUri: string,
    langClientPromise: Promise<IBallerinaLangClient>): Promise<PublishDiagnosticsParams[]> {
    const langClient = await langClientPromise;
    const diagnostics = await langClient.getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        }
    });

    return diagnostics;
}

export async function sendDidChange(
    docUri: string,
    content: string,
    langClientPromise: Promise<IBallerinaLangClient>)
{
    const langClient = await langClientPromise;
    await langClient.didChange({
        contentChanges: [
            {
                text: content
            }
        ],
        textDocument: {
            uri: docUri,
            version: 1
        }
    });
}



