import { createSortText, GetExpCompletionsParams } from "@wso2-enterprise/ballerina-expression-editor";
import { CompletionResponse, ExpressionEditorLangClientInterface } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import * as monaco from 'monaco-editor';
import { CompletionItemKind, InsertTextFormat } from "vscode-languageserver-protocol";


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
            kind: completionResponse.kind as CompletionItemKind,
            insertText: completionResponse.insertText,
            insertTextFormat: completionResponse.insertTextFormat as InsertTextFormat,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            sortText: createSortText(order),
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
