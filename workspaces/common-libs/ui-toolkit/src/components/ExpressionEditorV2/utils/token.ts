/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

const EXPRESSION_REGEX = /\$\{([^}]+)\}/g;

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
