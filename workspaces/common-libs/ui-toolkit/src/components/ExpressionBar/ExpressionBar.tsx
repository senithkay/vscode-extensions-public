/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React, { forwardRef, ReactNode } from 'react';
import { ExpressionEditor } from './ExpressionEditor';
import { InputProps } from '../TextField/TextField';
import { Button } from '../Button/Button';
import { ThemeColors } from '../../styles';
import { Icon } from '../Icon/Icon';

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
    inputProps?: InputProps;
    onChange: (value: string, updatedCursorPosition: number) => void | Promise<void>;
    onFocus?: () => void | Promise<void>;
    onBlur?: (e?: any) => void | Promise<void>;
    onSave?: (value: string) => void | Promise<void>;
    onCancel: () => void;
    useTransaction: (fn: (...args: any[]) => Promise<any>) => any;
    shouldDisableOnSave?: boolean;

    // Completion item props
    // - The list of completions to be displayed
    completions: CompletionItem[];
    // - Get a custom icon for the expression bar
    getExpressionBarIcon?: () => ReactNode;
    // - Should display the default completion item at the top of the completion list
    showDefaultCompletion?: boolean;
    // - Get default completion item to be displayed at the top of the completion list
    getDefaultCompletion?: () => ReactNode;
    // - The function to be called when a completion is selected
    onCompletionSelect?: (value: string) => void | Promise<void>;
    // - The function to be called when the default completion is selected
    onDefaultCompletionSelect?: () => void | Promise<void>;

    // Function signature props
    // - Returns information about the function that is currently being edited
    extractArgsFromFunction?: (
        value: string,
        cursorPosition: number
    ) => Promise<{
        label: string;
        args: string[];
        currentArgIndex: number;
    }>;
    handleHelperPaneOpen?: () => void;
};

export type ExpressionBarProps = ExpressionBarBaseProps & {
    id?: string;
    name?: string;
};

export type ExpressionBarRef = {
    shadowRoot: ShadowRoot;
    focus: () => void;
    blur: (value?: string) => Promise<void>; // Blurs the expression editor and optionally saves the expression with the provided value
    saveExpression: (value?: string, ref?: React.MutableRefObject<string>) => Promise<void>; // Saves the expression with the provided value
};

// Styled Components
namespace Ex {
    export const Container = styled.div`
        width: 100%;
        display: flex;
        color: var(--vscode-foreground);
        align-items: center;
        min-height: 32px;
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
    const { id, handleHelperPaneOpen, getExpressionBarIcon, ...rest } = props;

    return (
        <Ex.Container id={id}>
            <Ex.ExpressionBox>
                <ExpressionEditor ref={ref} {...rest} />
            </Ex.ExpressionBox>
            <Button appearance="icon" onClick={handleHelperPaneOpen} tooltip="Open Helper View">
                {getExpressionBarIcon ? (
                    getExpressionBarIcon()
                ) : (
                    <Icon name="function-icon" sx={{ color: ThemeColors.PRIMARY }} />
                )}
            </Button>
        </Ex.Container>
    );
});
ExpressionBar.displayName = 'ExpressionBar';
