/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback, useRef, useState } from 'react';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import {
    Button,
    CompletionItem,
    ErrorBanner,
    ExpressionBar,
    ExpressionBarRef,
    RequiredFormInput,
} from '@wso2-enterprise/ui-toolkit';
import { Position } from 'vscode-languageserver-types';
import { modifyCompletion } from './utils';
import { debounce } from 'lodash';
import styled from '@emotion/styled';

/**
 * Props for ExpressionEditor
 * @param documentUri - The URI of the document
 * @param label - The label of the expression
 * @param required - Whether the expression is required
 * @param value - The value of the expression
 * @param placeholder - The placeholder of the expression
 * @param position - The position of the node with the expression
 * @param onChange - Callback function to be called when the expression changes
 * @param onFocus - Callback function to be called when the expression is focused
 * @param onBlur - Callback function to be called when the expression is blurred
 * @param onCancel - Callback function to be called when the completions dropdown is closed
 * @param errorMsg - The error message to display
 */
type FormExpressionFieldProps = {
    documentUri: string;
    label: string;
    required: boolean;
    value: string;
    placeholder: string;
    position: Position;
    onChange: (value: string) => void;
    onFocus?: (e?: any) => void | Promise<void>;
    onBlur?: (e?: any) => void | Promise<void>;
    onCancel?: () => void;
    errorMsg: string;
};

export namespace S {
    export const Container = styled.div({
        width: '100%',
        fontFamily: 'var(--font-family)',
    });

    export const Header = styled.div({
        display: 'flex',
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
        textTransform: 'capitalize',
    });
}

/**
 * The FormExpressionField component for MI forms.
 * This component should be used with a Controller when using react-hook-forms.
 */
export const FormExpressionField = (params: FormExpressionFieldProps) => {
    const {
        documentUri,
        label,
        required,
        value,
        placeholder,
        position,
        onChange,
        onCancel,
        errorMsg,
        onFocus,
        onBlur,
    } = params;

    const { rpcClient } = useVisualizerContext();

    const expressionRef = useRef<ExpressionBarRef>(null);
    const cursorPositionRef = useRef<number>(null);
    const [completions, setCompletions] = useState<CompletionItem[]>([]);

    const debouncedRetrieveCompletions = useCallback(
        async (expression: string, cursorPosition: number) => {
            const completions = await rpcClient.getMiDiagramRpcClient().getExpressionCompletions({
                documentUri,
                expression,
                position,
                offset: cursorPosition,
            });
            const modifiedCompletions =
                completions?.items.map((completion: any) => modifyCompletion(completion)) ?? [];
            setCompletions(modifiedCompletions);
        },
        [rpcClient]
    );

    const retrieveCompletions = useCallback(debounce(debouncedRetrieveCompletions, 300), [
        debouncedRetrieveCompletions,
    ]);

    const useTransaction = (fn: (...args: any[]) => Promise<any>): { mutate: any; data: any; isLoading: boolean } => {
        return {
            mutate: fn,
            data: null,
            isLoading: false
        };
    };

    const handleChange = async (value: string, updatedCursorPosition: number) => {
        onChange(value);
        cursorPositionRef.current = updatedCursorPosition;

        retrieveCompletions(value, updatedCursorPosition);
    };

    const handleCancel = () => {
        retrieveCompletions.cancel();
        setCompletions([]);
    };

    const handleFocus = async () => {
        await onFocus?.();

        const cursorPosition = expressionRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        retrieveCompletions(value, cursorPosition);
    };

    const handleBlur = async () => {
        await onBlur?.();

        handleCancel();
    };

    return (
        <S.Container>
            <S.Header>
                <S.Label>{label}</S.Label>
                {required && <RequiredFormInput />}
            </S.Header>
            <div>
                <ExpressionBar
                    ref={expressionRef}
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onCancel={onCancel}
                    completions={completions}
                    shouldDisableOnSave={false}
                    useTransaction={useTransaction}
                />
                {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
            </div>
        </S.Container>
    );
};
