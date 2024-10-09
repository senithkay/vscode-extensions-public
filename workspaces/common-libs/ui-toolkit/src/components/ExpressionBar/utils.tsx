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

const FUNCTION_NAME_REGEX = /[a-zA-Z0-9_']+$/;

export const getFunctionInfo = (text: string, cursorPosition: number) => {
    const effectiveText = text.substring(0, cursorPosition);
    const lastOpenBracketIndex = effectiveText.lastIndexOf('(');
    const lastCloseBracketIndex = effectiveText.lastIndexOf(')') ?? 0;
    const isCursorInFunction = lastOpenBracketIndex && (lastOpenBracketIndex > lastCloseBracketIndex);

    let functionName: string;
    let args: string;
    if (isCursorInFunction) {
        functionName = effectiveText.substring(lastCloseBracketIndex + 1, lastOpenBracketIndex).match(FUNCTION_NAME_REGEX)[0];
        args = effectiveText.substring(lastOpenBracketIndex + 1, cursorPosition);
    }

    return { isCursorInFunction, functionName, args };
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

export const setCursor = (inputRef: RefObject<HTMLInputElement>, position: number) => {
    inputRef.current.focus();
    inputRef.current.shadowRoot.querySelector('input').setSelectionRange(position, position);
};

export const getIcon = (kind: CompletionItemKind) => {
    if (Object.values(COMPLETION_ITEM_KIND).includes(kind)) {
        return <Codicon name={`symbol-${kind}`} />;
    }

    return <Codicon name="symbol-variable" />;
};

