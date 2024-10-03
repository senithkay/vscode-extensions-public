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
import { InputProps } from '../TextField/TextField';

// Types
export const COMPLETION_ITEM_KIND = {
    Array: 'array',
    Boolean: 'boolean',
    Class: 'class',
    Color: 'color',
    Constant: 'constant',
    Constructor: 'constructor',
    Enum: 'enum',
    EnumMember: 'enum-member',
    Event: 'event',
    Field: 'field',
    File: 'file',
    Folder: 'folder',
    Function: 'function',
    Interface: 'interface',
    Key: 'key',
    Keyword: 'keyword',
    Method: 'method',
    Misc: 'misc',
    Module: 'module',
    Namespace: 'namespace',
    Null: 'null',
    Number: 'number',
    Object: 'object',
    Operator: 'operator',
    Package: 'package',
    Parameter: 'parameter',
    Property: 'property',
    Reference: 'reference',
    Ruler: 'ruler',
    Snippet: 'snippet',
    String: 'string',
    Struct: 'struct',
    Structure: 'structure',
    Text: 'text',
    TypeParameter: 'type-parameter',
    Unit: 'unit',
    Value: 'value',
    Variable: 'variable',
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
    sortText?: string;
};

export type ExpressionBarBaseProps = {
    autoFocus?: boolean;
    disabled?: boolean;
    value: string;
    placeholder?: string;
    sx?: React.CSSProperties;
    completions: CompletionItem[];
    inputProps?: InputProps;
    onChange: (value: string, updatedCursorPosition: number) => void | Promise<void>;
    onFocus?: () => void | Promise<void>;
    onBlur?: () => void | Promise<void>;
    onCompletionSelect?: (value: string) => void | Promise<void>;
    onSave?: (value: string) => void | Promise<void>;
    onCancel: () => void;
    useTransaction: (fn: (...args: any[]) => Promise<any>) => any;
    shouldDisableOnSave?: boolean;
};

export type ExpressionBarProps = ExpressionBarBaseProps & {
    id?: string;
    name?: string;
};

export type ExpressionBarRef = {
    shadowRoot: ShadowRoot;
    focus: () => void;
    blur: (value?: string) => Promise<void>; // Blurs the expression editor and optionally saves the expression with the provided value
    saveExpression: (value?: string) => Promise<void>; // Saves the expression with the provided value
};

// Styled Components
namespace Ex {
    export const Container = styled.div`
        width: 100%;
        display: flex;
        color: var(--vscode-foreground);
        align-items: center;
        height: 32px;
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
