/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { RefObject } from 'react';
import { ITEM_TYPE_KIND, ItemTypeKind } from './ExpressionBar';
import { Codicon } from '../Codicon/Codicon';

export const getExpressionInfo = (text: string, cursorPosition: number) => {
    const openBrackets = text.substring(0, cursorPosition).match(/\(/g);
    const closeBrackets = text.substring(0, cursorPosition).match(/\)/g);
    const isCursorInFunction = !!(openBrackets && openBrackets.length > (closeBrackets?.length ?? 0));
    let currentFnContent;
    if (isCursorInFunction) {
        const openBracketIndex = text.substring(0, cursorPosition).lastIndexOf('(');
        currentFnContent = text.substring(openBracketIndex + 1, cursorPosition);
    }

    return { isCursorInFunction, currentFnContent };
};

export const addClosingBracketIfNeeded = (inputRef: RefObject<HTMLInputElement>, text: string) => {
    let updatedText = text;
    let cursorPosition = inputRef.current!.shadowRoot.querySelector('input').selectionStart;

    const closingBracket = updatedText.includes('(') && !updatedText.includes(')');

    // Add a closing bracket if the expression has an opening bracket but no closing bracket
    if (closingBracket) {
        updatedText += ')';
        cursorPosition++;
    } else {
        const openBrackets = (updatedText.match(/\(/g) || []).length;
        const closeBrackets = (updatedText.match(/\)/g) || []).length;
        if (openBrackets > closeBrackets) {
            updatedText += ')';
            cursorPosition++;
        }
    }

    return { updatedText, cursorPosition };
};

export const setCursor = (inputRef: RefObject<HTMLInputElement>, position: number) => {
    inputRef.current.focus();
    inputRef.current.shadowRoot.querySelector('input').setSelectionRange(position, position);
};

export const isFunction = (kind: ItemTypeKind) => kind === ITEM_TYPE_KIND.Function || kind === ITEM_TYPE_KIND.Method;

export const isParameter = (kind: ItemTypeKind) => kind === ITEM_TYPE_KIND.Parameter;

export const getIcon = (kind: ItemTypeKind) => {
    switch (kind) {
        case ITEM_TYPE_KIND.Function:
            return <Codicon name="symbol-constructor" />;
        case ITEM_TYPE_KIND.Method:
            return <Codicon name="symbol-constructor" />;
        case ITEM_TYPE_KIND.Parameter:
            return <Codicon name="symbol-variable" />;
        case ITEM_TYPE_KIND.Property:
            return <Codicon name="symbol-field" />;
    }
};

