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
    PublishDiagnosticsParams,
    SymbolInfoResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import {
    acceptedCompletionKindForExpressions,
    acceptedCompletionKindForTypes,
    PROPERTY_COMPLETION_KIND
} from "../constants";
import { CurrentModel, StmtDiagnostic, SuggestionItem } from '../models/definitions';

import { getFilteredDiagnosticMessages, getSymbolPosition, sortSuggestions } from "./index";
import { ModelType, StatementEditorViewState } from "./statement-editor-viewstate";

export async function getPartialSTForStatement(
            partialSTRequest: PartialSTRequest,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await getLangClient();
    const resp = await langClient.getSTForSingleStatement(partialSTRequest);
    return resp.syntaxTree;
}

export async function getPartialSTForModuleMembers(
            partialSTRequest: PartialSTRequest,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await getLangClient();
    const resp = await langClient.getSTForModuleMembers(partialSTRequest);
    return resp.syntaxTree;
}

export async function getPartialSTForExpression(
            partialSTRequest: PartialSTRequest,
            getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<STNode> {
    const langClient: ExpressionEditorLangClientInterface = await getLangClient();
    const resp = await langClient.getSTForExpression(partialSTRequest);
    return resp.syntaxTree;
}

export async function getCompletions (docUri: string,
                                      targetPosition: NodePosition,
                                      completeModel: STNode,
                                      currentModel: CurrentModel,
                                      getLangClient: () => Promise<ExpressionEditorLangClientInterface>,
                                      userInput: string = ''
                                    ) : Promise<SuggestionItem[]> {

    const isTypeDescriptor = (currentModel.model.viewState as StatementEditorViewState).modelType === ModelType.TYPE_DESCRIPTOR;
    const varName = STKindChecker.isLocalVarDecl(completeModel)
        && completeModel.typedBindingPattern.bindingPattern.source.trim();
    const currentModelPosition = currentModel.model.position;
    const currentModelSource = currentModel.model.source
        ? currentModel.model.source.trim()
        : currentModel.model.value.trim();
    const suggestions: SuggestionItem[] = [];

    const completionParams: CompletionParams = {
        textDocument: {
            uri: docUri
        },
        context: {
            triggerKind: 1
        },
        position: {
            character: targetPosition.startColumn + currentModelPosition.startColumn + userInput.length,
            line: targetPosition.startLine + currentModelPosition.startLine
        }
    }

    // CodeSnippet is split to get the suggestions for field-access-expr (expression.field-name)
    const inputElements = userInput.split('.');

    const langClient = await getLangClient();
    const completions: CompletionResponse[] = await langClient.getCompletion(completionParams);

    const filteredCompletionItems = completions.filter((completionResponse: CompletionResponse) => (
        (!completionResponse.kind ||
            (isTypeDescriptor ?
                    acceptedCompletionKindForTypes.includes(completionResponse.kind) :
                    acceptedCompletionKindForExpressions.includes(completionResponse.kind)
            )
        ) &&
        completionResponse.label !== varName &&
        !(completionResponse.label.includes("main")) &&
        (userInput ?
            inputElements.some(element => (
                completionResponse.label.toLowerCase()).includes(element.toLowerCase())
            ) :
            completionResponse.label !== currentModelSource
        )
    ));

    filteredCompletionItems.sort(sortSuggestions);

    filteredCompletionItems.map((completion) => {
        let updatedInsertText = completion.insertText;
        const isProperty = completion.kind === PROPERTY_COMPLETION_KIND;
        if (isProperty) {
            const regex = /\${\d+:?(""|0|0.0|false|\(\)|xml ``|{})?}/gm;
            let placeHolder;
            // tslint:disable-next-line:no-conditional-assignment
            while ((placeHolder = regex.exec(completion.insertText)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (placeHolder.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                updatedInsertText = updatedInsertText.replace(placeHolder[0], placeHolder[1] || '');
            }
        }
        suggestions.push(
            {
                value: completion.label,
                kind: completion.detail,
                insertText: isProperty && updatedInsertText,
                completionKind: completion.kind
            }
        );
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

export async function getSymbolDocumentation(
    docUri: string,
    targetPosition: NodePosition,
    currentModel: STNode,
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>,
    userInput: string = ''): Promise<SymbolInfoResponse> {
    const langClient = await getLangClient();
    const symbolPos = getSymbolPosition(targetPosition, currentModel, userInput);
    const symbolDoc = await  langClient.getSymbolDocumentation({
        textDocumentIdentifier : {
            uri: docUri
        },
        position: {
            line: symbolPos.line,
            character: symbolPos.offset
        }
    });
    return symbolDoc;
}

export const handleDiagnostics = async (source: string, fileURI: string, targetPosition: NodePosition,
                                        getLangClient: () => Promise<ExpressionEditorLangClientInterface>):
        Promise<Diagnostic[]> => {
    const diagResp = await getDiagnostics(fileURI, getLangClient);
    const diag  = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
    const filtered = getFilteredDiagnosticMessages(source, targetPosition, diag);
    return diag;
}

