/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef } from 'react';
import { FormField } from '../Form/types';
import { Controller } from 'react-hook-form';
import { ExpressionBar, ExpressionBarRef, RequiredFormInput } from '@wso2-enterprise/ui-toolkit';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { useFormContext } from '../../context';

interface ExpressionEditorProps {
    field: FormField;
}

namespace S {
    export const Container = styled.div({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontFamily: 'var(--font-family)',
    });

    export const LabelContainer = styled.div({
        display: 'flex',
        alignItems: 'center',
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
    });

    export const Description = styled.div({
        color: 'var(--vscode-list-deemphasizedForeground)',
    });
}

export function ExpressionEditor(props: ExpressionEditorProps) {
    const { field } = props;
    const { form, expressionEditor } = useFormContext();
    const { control } = form;
    const { completions, triggerCharacters, onRetrieveCompletions, onCancel } = expressionEditor;
    const exprRef = useRef<ExpressionBarRef>(null);

    const useTransaction = (fn: (...args: any[]) => Promise<any>) => {
        return useMutation({
            mutationFn: fn,
        });
    };

    return (
        <S.Container>
            <S.LabelContainer>
                <S.Label>{field.label}</S.Label>
                {!field.optional && <RequiredFormInput />}
            </S.LabelContainer>
            <S.Description>{field.documentation}</S.Description>
            <Controller
                control={control}
                name={field.key}
                render={({ field: { name, value, onChange } }) => (
                    <ExpressionBar
                        ref={exprRef}
                        name={name}
                        completions={completions}
                        value={value}
                        onChange={async (value: string) => {
                            onChange(value);

                            // Check if the current character is a trigger character
                            const cursorPosition = exprRef.current?.shadowRoot.querySelector('input').selectionStart;
                            const triggerCharacter =
                                cursorPosition > 0
                                    ? triggerCharacters.find((char) => value[cursorPosition - 1] === char)
                                    : undefined;
                            if (triggerCharacter) {
                                await onRetrieveCompletions(
                                    value,
                                    exprRef.current?.shadowRoot.querySelector('input').selectionStart,
                                    triggerCharacter
                                );
                            } else {
                                await onRetrieveCompletions(
                                    value,
                                    exprRef.current?.shadowRoot.querySelector('input').selectionStart
                                );
                            }
                        }}
                        onCancel={onCancel}
                        useTransaction={useTransaction}
                        sx={{ paddingInline: '0' }}
                    />
                )}
            />
        </S.Container>
    );
}
