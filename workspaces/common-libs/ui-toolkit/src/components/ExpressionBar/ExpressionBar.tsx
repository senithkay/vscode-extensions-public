/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React, { forwardRef } from 'react';
import { Icon } from '../Icon/Icon';
import { ExpressionEditor } from './ExpressionEditor';

// Types
export const COMPLETION_ITEM_KIND = {
    Function: 'function',
    Method: 'method',
    Parameter: 'parameter',
    Property: 'property',
} as const;

export type CompletionItemKind = (typeof COMPLETION_ITEM_KIND)[keyof typeof COMPLETION_ITEM_KIND];

export type CompletionItem = {
    tag?: string;
    label: string;
    value: string;
    description: string;
    kind: CompletionItemKind;
    args?: string[];
    replacementSpan?: number;
};

export type ExpressionBarBaseProps = {
    autoFocus?: boolean;
    disabled?: boolean;
    value: string;
    placeholder?: string;
    sx?: React.CSSProperties;
    completions: CompletionItem[];
    onChange: (value: string) => Promise<void>;
    onFocus?: () => Promise<void>;
    onBlur?: () => Promise<void>;
    onCompletionSelect: (value: string) => Promise<void>;
    onSave: (value: string) => Promise<void>;
    onCancel: () => void;
    useTransaction?: (fn: (...args: any[]) => Promise<any>) => any;
};

export type ExpressionBarProps = ExpressionBarBaseProps & {
    id?: string;
};

export type ExpressionBarRef = {
    shadowRoot: ShadowRoot;
    focus: (text?: string) => Promise<void>;
    blur: (text?: string) => Promise<void>;
    saveExpression: (text?: string) => Promise<void>;
};

// Styled Components
namespace Ex {
    export const Container = styled.div`
        width: 100%;
        display: flex;
        color: var(--vscode-foreground);
        align-items: center;
        height: 32px;
        padding-inline: 8px;
        gap: 8px;
        box-sizing: border-box;

        * {
            box-sizing: border-box;
        }
    `;

    export const ExpressionBox = styled.div`
        display: flex;
        flex: 1 1 auto;
    `;
}

export const ExpressionBar = forwardRef<ExpressionBarRef, ExpressionBarProps>((props, ref) => {
    const { id, ...rest } = props;

    return (
        <Ex.Container id={id}>
            <Icon name="function-icon" />
            <Ex.ExpressionBox>
                <ExpressionEditor ref={ref} {...rest} />
            </Ex.ExpressionBox>
        </Ex.Container>
    );
});
ExpressionBar.displayName = 'ExpressionBar';
