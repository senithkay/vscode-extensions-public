/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RefObject } from 'react';
import { ItemType } from './ExpressionBar';

export const filterItems = (items: ItemType[], text: string, maxItems: number) => {
    const filtered = items.filter((item: ItemType) => item.label.toLowerCase().includes(text.toLowerCase()));
    return filtered.sort((a, b) => a.label.length - b.label.length).slice(0, maxItems);
};

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
    let cursorPosition = (inputRef.current!.shadowRoot.getElementById('control') as HTMLInputElement).selectionStart;

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
    (inputRef.current.shadowRoot.getElementById('control') as HTMLInputElement).setSelectionRange(position, position);
};

