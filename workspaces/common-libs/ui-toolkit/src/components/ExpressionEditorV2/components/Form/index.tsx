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
        flex-direction: column;
        color: ${ThemeColors.ON_SURFACE};
        min-height: 32px;
        gap: 4px;
        box-sizing: border-box;

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
    `;

    export const CodeActionsContainer = styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    export const EditorContainer = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    export const ExpressionBox = styled.div`
        display: flex;
        flex: 1 1 auto;
    `;
}

export const FormExpressionEditorWrapper = forwardRef<FormExpressionEditorRef, FormExpressionEditorProps>((props, ref) => {
    const { id, getExpressionEditorIcon, onRemove, codeActions, startAdornment, endAdornment, ...rest } = props;
    const expressionEditorRef = useRef<FormExpressionEditorRef>(null);
    const buttonRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => expressionEditorRef.current);

    const handleHelperPaneToggle = () => {
        if (!props.isHelperPaneOpen) {
            expressionEditorRef.current?.focus();
        } else {
            props.changeHelperPaneState?.(false);
        }
    };

    return (
        <Ex.Container id={id}>
            {codeActions && codeActions.length > 0 && (
                <Ex.CodeActionsContainer>
                    {codeActions.map((button, index) => (
                        <React.Fragment key={index}>
                            {button}
                        </React.Fragment>
                    ))}
                </Ex.CodeActionsContainer>
            )}
            <Ex.EditorContainer>
                <Ex.ExpressionBox>
                    <ExpressionEditor ref={expressionEditorRef} buttonRef={buttonRef} {...rest} />
                </Ex.ExpressionBox>
                {getExpressionEditorIcon
                    ? getExpressionEditorIcon()
                    : props.changeHelperPaneState && (
                        <Button
                            ref={buttonRef}
                            appearance="icon"
                            onClick={handleHelperPaneToggle}
                            tooltip="Open Helper View"
                            {...(props.isHelperPaneOpen && {
                                sx: { backgroundColor: ThemeColors.PRIMARY, borderRadius: "2px" },
                            })}
                        >
                            <Icon
                                name="function-icon"
                                sx={{
                                    height: "19px",
                                    width: "17px",
                                    ...props.isHelperPaneOpen && { color: ThemeColors.ON_PRIMARY },
                                }}
                                iconSx={{ fontSize: "16px" }}
                                
                            />
                        </Button>
                    )}
                {onRemove && (
                    <Button appearance="icon" onClick={onRemove} tooltip="Remove Expression">
                        <Codicon name="trash" sx={{ color: ThemeColors.ERROR }} />
                    </Button>
                )}
            </Ex.EditorContainer>
        </Ex.Container>
    );
});
FormExpressionEditorWrapper.displayName = 'FormExpressionEditorWrapper';
