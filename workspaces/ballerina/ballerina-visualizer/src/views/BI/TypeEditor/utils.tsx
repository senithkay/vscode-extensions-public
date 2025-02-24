/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { VisibleTypeItem } from '@wso2-enterprise/ballerina-core';
import type { TypeHelperCategory } from '@wso2-enterprise/type-editor';
import { COMPLETION_ITEM_KIND, convertCompletionItemKind } from '@wso2-enterprise/ui-toolkit';

/**
 * Get the categories for the type editor
 *
 * @param userDefinedTypes - The user defined types
 * @returns The categories for the type editor
 */
export const getCategories = (types: VisibleTypeItem[]) => {
    const categories: TypeHelperCategory[] = [];

    /* Add the primitive types */
    categories.push({
        category: 'Primitive Types',
        sortText: 'a',
        items: types
            .filter((type) => type.labelDetails.detail === 'Primitive')
            .map((type) => ({
                name: type.label,
                insertText: type.insertText,
                sortText: type.insertText,
                type: convertCompletionItemKind(type.kind)
            }))
    });

    /* Add the user-defined types */
    categories.push({
        category: 'User-Defined Types',
        sortText: 'b',
        items: types
            .filter((type) => type.labelDetails.detail === 'User-Defined')
            .map((type) => ({
                name: type.label,
                insertText: type.insertText,
                sortText: type.insertText,
                type: convertCompletionItemKind(type.kind)
            }))
    });

    return categories;
};
