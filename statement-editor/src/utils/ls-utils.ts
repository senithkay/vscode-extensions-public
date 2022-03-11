/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import {
    CompletionParams,
    CompletionResponse,
    ExpressionEditorLangClientInterface,
    PartialSTRequest,
    PublishDiagnosticsParams
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STNode
} from "@wso2-enterprise/syntax-tree";

import {
    acceptedCompletionKindForExpressions,
    acceptedCompletionKindForTypes
} from "../components/InputEditor/constants";
import { SuggestionItem } from '../models/definitions';

import { sortSuggestions } from "./index";

export async function getPartialSTForStatement(
            partialSTRequest: PartialSTRequest,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await getLangClient();
    const resp = await langClient.getSTForSingleStatement(partialSTRequest);
    return resp.syntaxTree;
}

export async function getPartialSTForExpression(
            partialSTRequest: PartialSTRequest,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await getLangClient();
    const resp = await langClient.getSTForExpression(partialSTRequest);
    return resp.syntaxTree;
}

export async function getContextBasedCompletions (
            docUri: string,
            content: string,
            targetPosition: NodePosition,
            modelPosition: NodePosition,
            isTypeDescriptor: boolean,
            isElseIfMember: boolean,
            selection: string,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>) : Promise<SuggestionItem[]> {
    const suggestions: SuggestionItem[] = [];
    await sendDidChange(docUri, content, getLangClient);
    const completionParams: CompletionParams = {
        textDocument: {
            uri: docUri
        },
        context: {
            triggerKind: 1
        },
        position: {
            character: isElseIfMember ?
                modelPosition.startColumn :
                targetPosition.startColumn + modelPosition.startColumn,
            line: targetPosition.startLine + modelPosition.startLine
        }
    }

    const langClient = await getLangClient();
    const completions: CompletionResponse[] = await langClient.getCompletion(completionParams);

    const filteredCompletionItems = completions.filter((completionResponse: CompletionResponse) => (
        (
            !completionResponse.kind || (
                isTypeDescriptor ?
                    acceptedCompletionKindForTypes.includes(completionResponse.kind) :
                    acceptedCompletionKindForExpressions.includes(completionResponse.kind)
            )
        ) && completionResponse.label !== selection.trim() && !(completionResponse.label.includes("main"))
    ));

    filteredCompletionItems.sort(sortSuggestions)

    filteredCompletionItems.map((completion) => {
        suggestions.push({ value: completion.label, kind: completion.detail, suggestionType: completion.kind  });
    });

    return suggestions;
}

export async function sendDidOpen(
    docUri: string,
    content: string,
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>) {
    const langClient = await getLangClient();
    langClient.didOpen({
        textDocument: {
            uri: docUri,
            languageId: "ballerina",
            text: content,
            version: 1
        }
    });
}

export async function sendDidClose(
    docUri: string,
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>) {
    const langClient = await getLangClient();
    langClient.didClose({
        textDocument: {
            uri: docUri
        }
    });
}

export async function sendDidChange(
            docUri: string,
            content: string,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>) {
    const langClient = await getLangClient();
    langClient.didChange({
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

export async function getDiagnostics(
        docUri: string,
        getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<PublishDiagnosticsParams[]> {
    const langClient = await getLangClient();
    const diagnostics = await langClient.getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        }
    });

    return diagnostics;
}

export async function addStatementToTargetLine(
            currentFileContent: string,
            position: NodePosition,
            currentStatement: string,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<string> {
    const modelContent: string[] = currentFileContent.split(/\n/g) || [];
    if (position?.startColumn && position?.endColumn && position?.endLine) {
        return getModifiedStatement(currentFileContent, currentStatement, position, getLangClient);
    } else {
        // TODO: Change the backend to accomodate STModifications without endline and endcolumn values and then remove the following logic
        // Issue: https://github.com/wso2-enterprise/choreo/issues/11069
        if (!!position?.startColumn) {
            currentStatement = " ".repeat(position.startColumn) + currentStatement;
        }
        modelContent.splice(position?.startLine, 0, currentStatement);
        return modelContent.join('\n');
    }
}

export async function addImportStatements(
            currentFileContent: string,
            modulesToBeImported: string[]): Promise<string> {
    const modelContent: string[] = currentFileContent.split(/\n/g) || [];
    modulesToBeImported.join('');
    modelContent.splice(0, 0, modulesToBeImported.join(''));
    return modelContent.join('\n');
}

async function getModifiedStatement(
            currentFileContent: string,
            codeSnippet: string,
            position: NodePosition,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<string> {
    const stModification = {
        startLine: position.startLine,
        startColumn: position.startColumn,
        endLine: position.endLine,
        endColumn: position.endColumn,
        newCodeSnippet: codeSnippet
    }
    const partialST: STNode = await getPartialSTForStatement({
        codeSnippet: currentFileContent,
        stModification
    }, getLangClient);
    return partialST.source;
}
