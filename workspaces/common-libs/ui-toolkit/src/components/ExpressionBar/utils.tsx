/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { RefObject } from 'react';
import { COMPLETION_ITEM_KIND, CompletionItemKind } from './ExpressionBar';
import { Codicon } from '../Codicon/Codicon';

export const checkCursorInFunction = (text: string, cursorPosition: number) => {
    const effectiveText = text.substring(0, cursorPosition);
    const effectiveOpenBracketCount = (effectiveText.match(/\(/g) || []).length;
    const effectiveCloseBracketCount = (effectiveText.match(/\)/g) || []).length;
    const cursorInFunction = effectiveOpenBracketCount > effectiveCloseBracketCount;

    return cursorInFunction;
};

export const addClosingBracketIfNeeded = (text: string) => {
    let updatedText = text;

    const closingBracket = updatedText.includes('(') && !updatedText.includes(')');

    // Add a closing bracket if the expression has an opening bracket but no closing bracket
    if (closingBracket) {
        updatedText += ')';
    } else {
        const openBrackets = (updatedText.match(/\(/g) || []).length;
        const closeBrackets = (updatedText.match(/\)/g) || []).length;
        if (openBrackets > closeBrackets) {
            updatedText += ')';
        }
    }

    return updatedText;
};

export const setCursor = (
    inputRef: RefObject<HTMLTextAreaElement | HTMLInputElement>,
    inputElementType: 'input' | 'textarea',
    value: string,
    position: number
) => {
    const inputElement = inputRef.current.shadowRoot.querySelector(inputElementType);
    inputElement.focus();
    inputElement.value = value;
    inputElement.setSelectionRange(position, position);
};

export const getIcon = (kind: CompletionItemKind) => {
    if (Object.values(COMPLETION_ITEM_KIND).includes(kind)) {
        return <Codicon name={`symbol-${kind}`} />;
    }

    return <Codicon name="symbol-variable" />;
};
