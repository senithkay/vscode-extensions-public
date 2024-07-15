/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { ExpressionEditor } from './SearchBox';

// Types
export const ITEM_TYPE_KIND = {
    Function: 'function',
    Method: 'method',
    Parameter: 'parameter',
    Property: 'property',
} as const;

export type ItemTypeKind = (typeof ITEM_TYPE_KIND)[keyof typeof ITEM_TYPE_KIND];

export type ItemType = {
    tag?: string;
    label: string;
    value: string;
    description: string;
    kind: ItemTypeKind;
    args?: string[];
};

export type ExpressionBarBaseProps = {
    autoFocus?: boolean;
    disabled?: boolean;
    value: string;
    placeholder?: string;
    sx?: React.CSSProperties;
    onChange: (value: string) => Promise<void>;
    onFocus?: () => void;
    onBlur?: () => void;
    onItemSelect: (value: string) => Promise<void>;
    onSave: (value: string) => Promise<void>;
    getCompletions: () => Promise<ItemType[]>;
};

export type ExpressionBarProps = ExpressionBarBaseProps & {
    id?: string;
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

export const ExpressionBar = forwardRef<HTMLInputElement, ExpressionBarProps>((props, ref) => {
    const { id, ...rest } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current);

    return (
        <Ex.Container id={id}>
            <Icon name="function-icon" />
            <Ex.ExpressionBox>
                <ExpressionEditor ref={inputRef} {...rest} />
            </Ex.ExpressionBox>
        </Ex.Container>
    );
});
ExpressionBar.displayName = 'ExpressionBar';
