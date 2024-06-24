/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React from 'react';
import { Icon } from '../Icon/Icon';
import { ExpressionEditor, ItemType } from './SearchBox';

// Types
export type ExpressionBarProps = {
    autoFocus?: boolean;
    functionNames: ItemType[];
    value: string;
    sx?: React.CSSProperties;
    input?: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
};

// Styled Components
namespace Ex {
    export const Container = styled.div`
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

export const ExpressionBar = (props: ExpressionBarProps) => {
    const { functionNames, value, sx, input, onChange, ...rest } = props;

    return (
        <Ex.Container>
            <Icon name="function-icon" />
            <Ex.ExpressionBox>
                <ExpressionEditor
                    items={functionNames}
                    value={value}
                    sx={sx}
                    input={input}
                    onChange={onChange}
                    {...rest}
                />
            </Ex.ExpressionBox>
        </Ex.Container>
    );
};

