/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExpressionCompletionItem, HelperPaneCompletionItem, HelperPaneFunctionInfo } from '@wso2-enterprise/mi-core';
import { COMPLETION_ITEM_KIND, CompletionItem, CompletionItemKind } from '@wso2-enterprise/ui-toolkit';

/**
 * Map from LSP CompletionItemKind to UI Toolkit's CompletionItemKind
 * @param kind - LSP CompletionItemKind
 * @returns UI Toolkit's CompletionItemKind
 */
const mapCompletionItemKind = (kind: number): CompletionItemKind => {
    switch (kind) {
        case 1: return COMPLETION_ITEM_KIND.Text;
        case 2: return COMPLETION_ITEM_KIND.Method;
        case 3: return COMPLETION_ITEM_KIND.Function;
        case 4: return COMPLETION_ITEM_KIND.Constructor;
        case 5: return COMPLETION_ITEM_KIND.Field;
        case 6: return COMPLETION_ITEM_KIND.Variable;
        case 7: return COMPLETION_ITEM_KIND.Class;
        case 8: return COMPLETION_ITEM_KIND.Interface;
        case 9: return COMPLETION_ITEM_KIND.Module;
        case 10: return COMPLETION_ITEM_KIND.Property;
        case 11: return COMPLETION_ITEM_KIND.Unit;
        case 12: return COMPLETION_ITEM_KIND.Value;
        case 13: return COMPLETION_ITEM_KIND.Enum;
        case 14: return COMPLETION_ITEM_KIND.Keyword;
        case 15: return COMPLETION_ITEM_KIND.Snippet;
        case 16: return COMPLETION_ITEM_KIND.Color;
        case 17: return COMPLETION_ITEM_KIND.File;
        case 18: return COMPLETION_ITEM_KIND.Reference;
        case 19: return COMPLETION_ITEM_KIND.Folder;
        case 20: return COMPLETION_ITEM_KIND.EnumMember;
        case 21: return COMPLETION_ITEM_KIND.Constant;
        case 22: return COMPLETION_ITEM_KIND.Struct;
        case 23: return COMPLETION_ITEM_KIND.Event;
        case 24: return COMPLETION_ITEM_KIND.Operator;
        case 25: return COMPLETION_ITEM_KIND.TypeParameter;
        default: return COMPLETION_ITEM_KIND.Text;
    }
};

export const modifyCompletion = (completion: ExpressionCompletionItem): CompletionItem => {
    let completionValue = completion.insertText;

    // For functions add the opening bracket
    const fnRegex = /\w+(?=\(.*\))/;
    const fnMatch = completion.insertText.match(fnRegex);
    if (fnMatch) {
        completionValue = `${fnMatch}(`;
    }

    return {
        label: completion.label,
        value: completionValue,
        kind: mapCompletionItemKind(completion.kind),
        description: completion.detail,
        sortText: completion.sortText
    }
};

/**
 * Filter the completion items based on the filter text.
 *
 * @param items - HelperPaneCompletionItem[]
 * @param filterText - string
 * @returns HelperPaneCompletionItem[]
 */
export const filterHelperPaneCompletionItems = (
    items: HelperPaneCompletionItem[],
    filterText: string
): HelperPaneCompletionItem[] => {
    return items.filter((item) => item.label.toLowerCase().includes(filterText.toLowerCase()));
};

/**
 * Filter the function completion items based on the filter text.
 *
 * If the filter text matches a group name, all functions in that group are shown.
 * If the filter text matches a function name, only matching functions are shown within their groups.
 *
 * @param items - HelperPaneFunctionInfo
 * @param filterText - string
 * @returns HelperPaneFunctionInfo
 */
export const filterHelperPaneFunctionCompletionItems = (
    items: HelperPaneFunctionInfo,
    filterText: string
): HelperPaneFunctionInfo => {
    const groups = Object.keys(items);
    const filteredResponse: HelperPaneFunctionInfo = {};

    for (const group of groups) {
        if (group.toLowerCase().includes(filterText.toLowerCase())) {
            filteredResponse[group] = items[group];
        } else {
            const groupItems = items[group].items.filter((item) =>
                item.label.toLowerCase().includes(filterText.toLowerCase())
            );
            if (groupItems.length > 0) {
                filteredResponse[group] = {
                    items: groupItems,
                    sortText: items[group].sortText
                };
            }
        }
    }

    return filteredResponse;
};
