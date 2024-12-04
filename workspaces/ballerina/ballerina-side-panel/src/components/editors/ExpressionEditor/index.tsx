/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FormField } from '../../Form/types';
import { Control, Controller, FieldValues, UseFormWatch } from 'react-hook-form';
import {
    Button,
    CompletionItem,
    ErrorBanner,
    FormExpressionEditor,
    FormExpressionEditorRef,
    InputProps,
    RequiredFormInput
} from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useFormContext } from '../../../context';
import {
    LineRange,
    SubPanel,
    SubPanelView,
    SubPanelViewProps
} from '@wso2-enterprise/ballerina-core';
import { Colors } from '../../../resources/constants';
import { sanitizeType } from '../utils';

type ContextAwareExpressionEditorProps = {
    field: FormField;
    openSubPanel?: (subPanel: SubPanel) => void;
    isActiveSubPanel?: boolean;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
}

type ExpressionEditorProps = ContextAwareExpressionEditorProps & {
    control: Control<FieldValues, any>;
    watch: UseFormWatch<any>;
    completions: CompletionItem[];
    triggerCharacters?: readonly string[];
    autoFocus?: boolean;
    retrieveCompletions?: (
        value: string,
        offset: number,
        triggerCharacter?: string,
        onlyVariables?: boolean
    ) => Promise<void>;
    extractArgsFromFunction?: (value: string, cursorPosition: number) => Promise<{
        label: string;
        args: string[];
        currentArgIndex: number;
    }>;
    getExpressionDiagnostics?: (
        showDiagnostics: boolean,
        expression: string,
        key: string
    ) => Promise<void>;
    onFocus?: () => void | Promise<void>;
    onBlur?: () => void | Promise<void>;
    onCompletionSelect?: (value: string) => void | Promise<void>;
    onSave?: (value: string) => void | Promise<void>;
    onCancel: () => void;
    onRemove?: () => void;
    targetLineRange?: LineRange;
    fileName: string;
};

export namespace S {
    export const Container = styled.div({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontFamily: 'var(--font-family)',
    });

    export const TitleContainer = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    export const LabelContainer = styled.div({
        display: 'flex',
        alignItems: 'center',
    });

    export const HeaderContainer = styled.div({
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    });

    export const Header = styled.div({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    });

    export const Type = styled.div<{ isVisible: boolean }>(({ isVisible }) => ({
        color: Colors.PRIMARY,
        fontFamily: 'monospace',
        fontSize: '12px',
        border: `1px solid ${Colors.PRIMARY}`,
        borderRadius: '999px',
        padding: '2px 8px',
        display: 'inline-block',
        userSelect: 'none',
        maxWidth: '148px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        opacity: 0,
        animation: `${isVisible ? 'fadeIn' : 'fadeOut'} 0.2s ease-${isVisible ? 'in' : 'out'} forwards`,
        '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
        },
        '@keyframes fadeOut': {
            '0%': { opacity: 1 },
            '100%': { opacity: 0 }
        }
    }));

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
        textTransform: 'capitalize',
    });

    export const Description = styled.div({
        color: 'var(--vscode-list-deemphasizedForeground)',
    });

    export const EndAdornment = styled(Button)`
        & > vscode-button {
            color: var(--vscode-button-secondaryForeground);
            font-size: 10px;
        }
    `;

    export const EndAdornmentText = styled.p`
        font-size: 10px;
        margin: 0;
    `;
}

export const ContextAwareExpressionEditor = forwardRef<FormExpressionEditorRef, ContextAwareExpressionEditorProps>((props, ref) => {
    const { form, expressionEditor, targetLineRange, fileName } = useFormContext();

    return (
        <ExpressionEditor
            ref={ref}
            fileName={fileName}
            {...targetLineRange}
            {...props}
            {...form}
            {...expressionEditor}
        />
    );
});

export const ExpressionEditor = forwardRef<FormExpressionEditorRef, ExpressionEditorProps>((props, ref) => {
    const {
        autoFocus,
        control,
        field,
        watch,
        completions,
        triggerCharacters,
        retrieveCompletions,
        extractArgsFromFunction,
        getExpressionDiagnostics,
        onFocus,
        onBlur,
        onCompletionSelect,
        onSave,
        onCancel,
        onRemove,
        openSubPanel,
        handleOnFieldFocus
    } = props as ExpressionEditorProps;
    const [focused, setFocused] = useState(false);
    
    // If Form directly  calls ExpressionEditor without setting targetLineRange and fileName through context
    const { targetLineRange: contextTargetLineRange, fileName: contextFileName } = useFormContext();

    const exprRef = useRef<FormExpressionEditorRef>(null);

    // Use to fetch initial diagnostics
    const fetchInitialDiagnostics = useRef<boolean>(true);
    const fieldValue = watch(field.key);

    useImperativeHandle(ref, () => exprRef.current);

    // Initial render
    useEffect(() => {
        // Fetch initial diagnostics
        if (fieldValue !== undefined && fetchInitialDiagnostics.current) {
            fetchInitialDiagnostics.current = false;
            getExpressionDiagnostics(!field.optional || fieldValue !== "", fieldValue, field.key);
        }
    }, [fieldValue]);

    const cursorPositionRef = useRef<number | undefined>(undefined);

    const handleFocus = async (value?: string) => {
        // Retrieve the cursor position from the expression editor
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;

        setFocused(true);
        // Trigger actions on focus
        await onFocus?.();
        await retrieveCompletions(value, cursorPosition, undefined, true);
        handleOnFieldFocus?.(field.key);
    };

    const handleBlur = async () => {
        setFocused(false);
        // Trigger actions on blur
        await onBlur?.();

        // Clean up memory
        cursorPositionRef.current = undefined;
    };

    const handleCompletionSelect = async (value: string) => {
        // Trigger actions on completion select
        await onCompletionSelect?.(value);

        // Set cursor position
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        cursorPositionRef.current = cursorPosition;
    };

    const handleOpenSubPanel = (view: SubPanelView, subPanelInfo: SubPanelViewProps) => {
        openSubPanel({
            view: view,
            props: view === SubPanelView.UNDEFINED ? undefined : subPanelInfo
        });
    };

    const endAdornment: InputProps = {
        endAdornment: (
            <S.EndAdornment
                appearance="icon"
                tooltip="Create using Data Mapper"
                onClick={() => handleOpenSubPanel(SubPanelView.INLINE_DATA_MAPPER, { inlineDataMapper: {
                    // TODO: get filePath and range from getFlowModel API
                    filePath: "path/to/file",
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 },
                    }
                }})}
                disabled={true} // TODO: enable when file path and range are available
            >
                <S.EndAdornmentText>DM</S.EndAdornmentText>
            </S.EndAdornment>
        )
    };

    return (
        <S.Container>
            <S.HeaderContainer>
                <S.Header>
                    <S.LabelContainer>
                        <S.Label>{field.label}</S.Label>
                        {!field.optional && <RequiredFormInput />}
                    </S.LabelContainer>
                    <S.Description>{field.documentation}</S.Description>
                </S.Header>
                {field.valueType && <S.Type isVisible={focused} title={field.valueType}>{sanitizeType(field.valueType)}</S.Type>}
            </S.HeaderContainer>
            <Controller
                control={control}
                name={field.key}
                rules={{ required: !field.optional && !field.placeholder }}
                render={({ field: { name, value, onChange }, fieldState: { error } }) => (
                    <div>
                        <FormExpressionEditor
                            key={field.key}
                            ref={exprRef}
                            name={name}
                            completions={completions}
                            value={value}
                            autoFocus={autoFocus}
                            onChange={async (value: string, updatedCursorPosition: number) => {
                                onChange(value);

                                getExpressionDiagnostics(!field.optional || value !== "", value, field.key);

                                // Check if the current character is a trigger character
                                cursorPositionRef.current = updatedCursorPosition;
                                const triggerCharacter =
                                    updatedCursorPosition > 0
                                        ? triggerCharacters.find((char) => value[updatedCursorPosition - 1] === char)
                                        : undefined;
                                if (triggerCharacter) {
                                    await retrieveCompletions(value, updatedCursorPosition, triggerCharacter);
                                } else {
                                    await retrieveCompletions(value, updatedCursorPosition);
                                }
                            }}
                            extractArgsFromFunction={extractArgsFromFunction}
                            onCompletionSelect={handleCompletionSelect}
                            onFocus={() => handleFocus(value)}
                            onBlur={handleBlur}
                            onSave={onSave}
                            onCancel={onCancel}
                            onRemove={onRemove}
                            inputProps={endAdornment}
                            isHelperPaneOpen={}
                            toggleHelperPane={}
                            getHelperPane={}
                            placeholder={field.placeholder}
                            sx={{ paddingInline: '0' }}
                        />
                        {error && <ErrorBanner errorMsg={error.message.toString()} />}
                    </div>
                )}
            />
        </S.Container>
    );
});
