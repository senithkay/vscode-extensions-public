/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExpressionCompletionItem } from '@wso2-enterprise/mi-core';
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
    return {
        label: completion.label,
        value: completion.insertText,
        kind: mapCompletionItemKind(completion.kind),
        description: completion.detail,
        sortText: completion.sortText
    }
};
