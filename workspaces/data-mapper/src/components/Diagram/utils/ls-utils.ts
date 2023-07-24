/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExpressionRange, IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    addToTargetPosition,
    CompletionParams,
    PublishDiagnosticsParams,
    ResolvedTypeForExpression
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor"
import { CodeAction, CompletionItemKind, Diagnostic, WorkspaceEdit } from "vscode-languageserver-protocol";

import { CompletionResponseWithModule } from "../../DataMapper/ConfigPanel/TypeBrowser";
import { EXPR_SCHEME, FILE_SCHEME } from "../../DataMapper/ConfigPanel/utils";

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

export const handleDiagnostics = async (fileURI: string,
                                        langClientPromise: Promise<IBallerinaLangClient>):
    Promise<Diagnostic[]> => {
    const diagResp = await getDiagnostics(Uri.file(fileURI).toString(), langClientPromise);
    const diag = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
    return diag;
}

export const filterDiagnostics = (diagnostics: Diagnostic[], nodePosition: NodePosition): Diagnostic[] => {
    return diagnostics.filter((diagnostic) => {
        const diagPosition: NodePosition = {
            startLine: diagnostic.range.start.line,
            startColumn: diagnostic.range.start.character,
            endLine: diagnostic.range.end.line,
            endColumn: diagnostic.range.end.character
        };
        return isDiagInRange(nodePosition, diagPosition);
    })
}

export function isDiagInRange(nodePosition: NodePosition, diagPosition: NodePosition): boolean {
    return diagPosition?.startLine >= nodePosition?.startLine &&
        (diagPosition?.startLine === nodePosition?.startLine ? diagPosition?.startColumn >= nodePosition?.startColumn : true) &&
        diagPosition?.endLine <= nodePosition?.endLine &&
        (diagPosition?.endLine === nodePosition?.endLine ? diagPosition?.endColumn <= nodePosition?.endColumn : true);
}


export async function getCodeAction(filePath: string, diagnostic: Diagnostic, langClient: IBallerinaLangClient): Promise<CodeAction[]> {
    const codeAction = await langClient.codeAction({
        context: {
            diagnostics: [{
                code: diagnostic.code,
                message: diagnostic.message,
                range: {
                    end: {
                        line: diagnostic.range.end.line,
                        character: diagnostic.range.end.character
                    },
                    start: {
                        line: diagnostic.range.start.line,
                        character: diagnostic.range.start.character
                    }
                },
                severity: 1
            }],
            only: ["quickfix"]
        },
        range: {
            end: {
                line: diagnostic.range.end.line,
                character: diagnostic.range.end.character
            },
            start: {
                line: diagnostic.range.start.line,
                character: diagnostic.range.start.character
            }
        },
        textDocument: {
            uri: filePath
        }
    });

    return codeAction
}

export async function getRenameEdits(fileURI: string, newName: string, position: NodePosition, langClientPromise: Promise<IBallerinaLangClient>): Promise<WorkspaceEdit> {
    const langClient = await langClientPromise;
    const renameEdits = await langClient.rename({
        textDocument: { uri: Uri.file(fileURI).toString() },
        position: {
            line: position.startLine,
            character: position?.startColumn
        },
        newName
    });
    return renameEdits;
}

export const handleCodeActions = async (fileURI: string, diagnostics: Diagnostic[],
                                        langClientPromise: Promise<IBallerinaLangClient>):
    Promise<CodeAction[]> => {
    const langClient = await langClientPromise;
    let codeActions: CodeAction[] = []

    for (const diagnostic of diagnostics) {
        const codeAction = await getCodeAction(Uri.file(fileURI).toString(), diagnostic, langClient)
        codeActions = [...codeActions, ...codeAction]
    }
    return codeActions;
}

export async function getRecordCompletions(
    currentFileContent: string,
    langClientPromise: Promise<IBallerinaLangClient>,
    importStatements: string[],
    fnSTPosition: NodePosition,
    path: string): Promise<CompletionResponseWithModule[]> {

    const langClient = await langClientPromise;
    const typeLabelsToIgnore = ["StrandData"];
    const completionMap = new Map<string, CompletionResponseWithModule>();

    const completionParams: CompletionParams = {
        textDocument: { uri: Uri.file(path).toString() },
        position: { character: 0, line: 0 },
        context: { triggerKind: 22 },
    };
    const completions = await langClient.getCompletion(completionParams);
    const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);
    recCompletions.forEach((item) => completionMap.set(item.insertText, item));

    if (importStatements.length > 0) {

        const exprFileUrl = Uri.file(path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
        langClient.didOpen({
            textDocument: {
                languageId: "ballerina",
                text: currentFileContent,
                uri: exprFileUrl,
                version: 1,
            },
        });

        for (const importStr of importStatements) {
            const moduleName = importStr.split("/").pop().split(".").pop().replace(";", "");
            const updatedContent = addToTargetPosition(
                currentFileContent,
                {
                    startLine: fnSTPosition.endLine,
                    startColumn: fnSTPosition.endColumn,
                    endLine: fnSTPosition.endLine,
                    endColumn: fnSTPosition.endColumn,
                },
                `${moduleName}:`
            );

            langClient.didChange({
                textDocument: { uri: exprFileUrl, version: 1 },
                contentChanges: [{ text: updatedContent }],
            });

            const importCompletions = await langClient.getCompletion({
                textDocument: { uri: exprFileUrl },
                position: { character: fnSTPosition.endColumn + moduleName.length + 1, line: fnSTPosition.endLine },
                context: { triggerKind: 22 },
            });

            const importRecCompletions = importCompletions.filter((item) => item.kind === CompletionItemKind.Struct);

            importRecCompletions.forEach((item) => {
                if (!completionMap.has(item.insertText)) {
                    completionMap.set(item.insertText, { ...item, module: moduleName });
                }
            });
        }
        langClient.didChange({
            textDocument: { uri: exprFileUrl, version: 1 },
            contentChanges: [{ text: currentFileContent }],
        });

        langClient.didClose({ textDocument: { uri: exprFileUrl } });
    }

    const allCompletions = Array.from(completionMap.values()).filter(
        (item) => !(typeLabelsToIgnore.includes(item.label) || item.label.startsWith("("))
    );

    return allCompletions;
}

export async function getTypesForExpressions(fileURI: string,
                                             langClientPromise: Promise<IBallerinaLangClient>,
                                             expressionNodesRanges: ExpressionRange[])
    : Promise<ResolvedTypeForExpression[]> {
    const langClient = await langClientPromise;
    const typesFromExpression = await langClient.getTypeFromExpression({
        documentIdentifier: {
            uri: Uri.file(fileURI).toString()
        },
        expressionRanges: expressionNodesRanges
    });

    return typesFromExpression.types;
}
