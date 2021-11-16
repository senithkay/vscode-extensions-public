import * as monaco from 'monaco-editor';
import { CompletionItemKind, InsertTextFormat } from "monaco-languageclient";

import { CompletionResponse, ExpressionEditorLangClientInterface } from "../../../../../../Definitions";
import { GetExpCompletionsParams } from "../../../FormFieldComponents/ExpressionEditor";
import { createSortText } from "../../../FormFieldComponents/ExpressionEditor/utils";

export const getVarTypeCompletions = async ({
    getExpressionEditorLangClient,
    langServerURL,
    completionParams,
}: GetExpCompletionsParams) => {
    const langClient: ExpressionEditorLangClientInterface = await getExpressionEditorLangClient(langServerURL);
    const values: CompletionResponse[] = await langClient.getCompletion(completionParams);

    const acceptedKind: CompletionItemKind[] = [11, 22];

    const filteredCompletionItem: CompletionResponse[] = values.filter((completionResponse: CompletionResponse) => acceptedKind.includes(completionResponse.kind as CompletionItemKind));
    const completionItems: monaco.languages.CompletionItem[] = filteredCompletionItem.map((completionResponse: CompletionResponse, order: number) => {
        return {
            range: null,
            label: completionResponse.label,
            detail: completionResponse.detail,
            kind: completionResponse.kind as CompletionItemKind,
            insertText: completionResponse.insertText,
            insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            sortText: createSortText(order),
            documentation: completionResponse.documentation
        }
    });

    if (completionItems.length > 0) {
        completionItems[0] = { ...completionItems[0], preselect: true }
    }

    const completionList: monaco.languages.CompletionList = {
        incomplete: false,
        suggestions: completionItems
    };
    return completionList;
}
