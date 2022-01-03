import { CompletionResponse, ExpressionEditorLangClientInterface } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import * as monaco from 'monaco-editor';
import { CompletionItemKind, InsertTextFormat } from "vscode-languageserver-protocol";

import { GetExpCompletionsParams } from "../../../FormFieldComponents/ExpressionEditor";
import { createSortText, translateCompletionItemKindToMonaco } from "../../../FormFieldComponents/ExpressionEditor/utils";

export const getVarTypeCompletions = (ignoredCompletions: string[] = [], additionalCompletions: string[] = []) => async ({
    getExpressionEditorLangClient,
    langServerURL,
    completionParams,
}: GetExpCompletionsParams) => {
    const langClient: ExpressionEditorLangClientInterface = await getExpressionEditorLangClient(langServerURL);
    const values: CompletionResponse[] = await langClient.getCompletion(completionParams);

    const acceptedKind: CompletionItemKind[] = [11, 22];

    const filteredCompletionItem: CompletionResponse[] = values.filter(
        (completionResponse: CompletionResponse) =>
          acceptedKind.includes(completionResponse.kind as CompletionItemKind) &&
          !ignoredCompletions.includes(completionResponse.label)
      );
    const completionItems: monaco.languages.CompletionItem[] = filteredCompletionItem.map((completionResponse: CompletionResponse, order: number) => {
        return {
            range: null,
            label: completionResponse.label,
            detail: completionResponse.detail,
            kind: translateCompletionItemKindToMonaco(completionResponse.kind as CompletionItemKind),
            insertText: completionResponse.insertText,
            insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            sortText: completionResponse.sortText,
            documentation: completionResponse.documentation
        }
    });

    additionalCompletions.forEach((addition) => {
        const completionItemTemplate: monaco.languages.CompletionItem = {
            range: null,
            label: addition,
            kind: 1 as CompletionItemKind,
            insertText: addition,
        };
        completionItems.push(completionItemTemplate);
    });

    const completionList: monaco.languages.CompletionList = {
        incomplete: false,
        suggestions: completionItems
    };
    return completionList;
}
