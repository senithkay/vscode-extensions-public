/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

const EXPRESSION_REGEX = /\$\{([^}]+)\}/g;
const EXPRESSION_TOKEN_REGEX = /<div[^>]*>\s*([^<]+?)\s*.+\s*<\/div>/g;

const wrapTextInDiv = (text: string): string => {
    return `<div class="expression-token" contenteditable="false">
    ${text}
    <span class="expression-token-close">×</span>
</div>`;
};

export const transformExpressions = (content: string): string => {
    return content.replace(EXPRESSION_REGEX, (_, expression) => {
        return wrapTextInDiv(expression.trim());
    });
};

export const setValue = (element: HTMLDivElement, value: string) => {
    element.innerHTML = transformExpressions(value);
}

export const extractExpressions = (content: string): string => {
    let updatedContent;

    // Replace the expression tokens with the actual value
    updatedContent = content.replace(EXPRESSION_TOKEN_REGEX, (_, expression) => {
        return `\${${expression.trim()}}`;
    });

    // Remove html escape characters for spaces
    updatedContent = updatedContent.replace(/&nbsp;/g, ' ');

    return updatedContent;
}
