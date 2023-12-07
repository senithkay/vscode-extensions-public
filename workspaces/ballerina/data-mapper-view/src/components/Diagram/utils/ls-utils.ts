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
    BallerinaSTModifyResponse,
    CompletionParams,
    LinePosition,
    PublishDiagnosticsParams,
    ResolvedTypeForExpression
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { CodeAction, CompletionItemKind, Diagnostic, WorkspaceEdit } from "vscode-languageserver-types";
import { URI } from "vscode-uri";

import { CompletionResponseWithModule } from "../../DataMapper/ConfigPanel/TypeBrowser";
import { EXPR_SCHEME, FILE_SCHEME } from "../../DataMapper/ConfigPanel/utils";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";

export async function getDiagnostics(docUri: string, ballerinaRpcClient: BallerinaRpcClient): Promise<PublishDiagnosticsParams[]> {
    const diagnostics = await ballerinaRpcClient.getVisualizerRpcClient().getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        }
    });

    return diagnostics;
}

export const handleDiagnostics = async (fileURI: string, ballerinaRpcClient: BallerinaRpcClient):
    Promise<Diagnostic[]> => {
    const diagResp = await getDiagnostics(URI.file(fileURI).toString(), ballerinaRpcClient);
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


export async function getCodeAction(filePath: string, diagnostic: Diagnostic, ballerinaRpcClient: BallerinaRpcClient): Promise<CodeAction[]> {
    const codeAction = await ballerinaRpcClient.getVisualizerRpcClient().codeAction({
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

export async function getRenameEdits(fileURI: string,
    newName: string,
    position: NodePosition,
    ballerinaRpcClient: BallerinaRpcClient): Promise<WorkspaceEdit> {

    const renameEdits = await ballerinaRpcClient.getVisualizerRpcClient().rename({
        textDocument: { uri: URI.file(fileURI).toString() },
        position: {
            line: position.startLine,
            character: position?.startColumn
        },
        newName
    });
    return renameEdits;
}

export const handleCodeActions = async (fileURI: string,
    diagnostics: Diagnostic[],
    ballerinaRpcClient: BallerinaRpcClient): Promise<CodeAction[]> => {
    let codeActions: CodeAction[] = []

    for (const diagnostic of diagnostics) {
        const codeAction = await getCodeAction(URI.file(fileURI).toString(), diagnostic, ballerinaRpcClient)
        codeActions = [...codeActions, ...codeAction]
    }
    return codeActions;
}

export async function getRecordCompletions(
    currentFileContent: string,
    importStatements: string[],
    fnSTPosition: NodePosition,
    path: string,
    ballerinaRpcClient: BallerinaRpcClient): Promise<CompletionResponseWithModule[]> {

    const typeLabelsToIgnore = ["StrandData"];
    const completionMap = new Map<string, CompletionResponseWithModule>();

    const completionParams: CompletionParams = {
        textDocument: { uri: URI.file(path).toString() },
        position: { character: 0, line: 0 },
        context: { triggerKind: 22 },
    };

    const completions = await ballerinaRpcClient.getVisualizerRpcClient().getCompletion(completionParams);
    const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);
    recCompletions.forEach((item) => completionMap.set(item.insertText, item));

    if (importStatements.length > 0) {

        const exprFileUrl = URI.file(path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
        ballerinaRpcClient.getVisualizerRpcClient().didOpen({
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

            ballerinaRpcClient.getVisualizerRpcClient().didChange({
                textDocument: { uri: exprFileUrl, version: 1 },
                contentChanges: [{ text: updatedContent }],
            });

            const importCompletions = await ballerinaRpcClient.getVisualizerRpcClient().getCompletion({
                textDocument: { uri: exprFileUrl },
                position: { character: fnSTPosition.endColumn + moduleName.length + 1, line: fnSTPosition.endLine },
                context: { triggerKind: 22 },
            });

            const importRecCompletions = importCompletions.filter((item) => item.kind === CompletionItemKind.Struct);

            importRecCompletions.forEach((item) => {
                if (!completionMap.has(`${item.insertText}${moduleName}`)) {
                    completionMap.set(`${item.insertText}${moduleName}`, { ...item, module: moduleName });
                }
            });
        }
        ballerinaRpcClient.getVisualizerRpcClient().didChange({
            textDocument: { uri: exprFileUrl, version: 1 },
            contentChanges: [{ text: currentFileContent }],
        });

        ballerinaRpcClient.getVisualizerRpcClient().didClose({ textDocument: { uri: exprFileUrl } });
    }

    const allCompletions = Array.from(completionMap.values()).filter(
        (item) => !(typeLabelsToIgnore.includes(item.label) || item.label.startsWith("("))
    );

    return allCompletions;
}

export async function getTypesForExpressions(fileURI: string,
                                             expressionNodesRanges: ExpressionRange[],
                                             ballerinaRpcClient: BallerinaRpcClient)
    : Promise<ResolvedTypeForExpression[]> {
    const typesFromExpression = await ballerinaRpcClient.getDataMapperRpcClient().getTypeFromExpression({
        documentIdentifier: {
            uri: URI.file(fileURI).toString()
        },
        expressionRanges: expressionNodesRanges
    });

    return typesFromExpression.types;
}

export async function getDefinitionPosition(fileURI: string,
    position: LinePosition,
    ballerinaRpcClient: BallerinaRpcClient): Promise<BallerinaSTModifyResponse> {

    const definitionPosition = await ballerinaRpcClient.getVisualizerRpcClient().getDefinitionPosition(
        {
            textDocument: {
                uri: URI.file(fileURI).toString()
            },
            position: {
                line: position.line,
                character: position.offset
            }
        }
    )

    return definitionPosition;
}
