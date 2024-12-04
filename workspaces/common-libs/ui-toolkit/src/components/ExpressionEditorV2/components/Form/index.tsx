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
import { ExpressionEditor } from './ExpressionEditor';
import { FormExpressionEditorRef, FormExpressionEditorProps } from '../../types/form';
import { Button } from '../../../Button/Button';
import { Icon } from '../../../Icon/Icon';
import { Codicon } from '../../../Codicon/Codicon';
import { ThemeColors } from '../../../../styles';

// Styled Components
namespace Ex {
    export const Container = styled.div`
        width: 100%;
        display: flex;
        color: ${ThemeColors.ON_SURFACE};
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

export const FormExpressionEditorWrapper = forwardRef<FormExpressionEditorRef, FormExpressionEditorProps>((props, ref) => {
    const { id, getExpressionEditorIcon, onRemove, ...rest } = props;

    const handleHelperPaneToggle = () => {
        props.toggleHelperPane?.();
    };

    return (
        <Ex.Container id={id}>
            <Ex.ExpressionBox>
                <ExpressionEditor ref={ref} {...rest} />
            </Ex.ExpressionBox>
            {(props.toggleHelperPane || getExpressionEditorIcon) && (
                <Button appearance="icon" onClick={handleHelperPaneToggle} tooltip="Open Helper View">
                    {getExpressionEditorIcon ? (
                        getExpressionEditorIcon()
                    ) : (
                        <Icon name="function-icon" sx={{ color: ThemeColors.PRIMARY }} />
                    )}
                </Button>
            )}
            {onRemove && (
                <Button appearance="icon" onClick={onRemove} tooltip="Remove Expression">
                    <Codicon name="trash" sx={{ color: ThemeColors.ERROR }} />
                </Button>
            )}
        </Ex.Container>
    );
});
FormExpressionEditorWrapper.displayName = 'FormExpressionEditorWrapper';
