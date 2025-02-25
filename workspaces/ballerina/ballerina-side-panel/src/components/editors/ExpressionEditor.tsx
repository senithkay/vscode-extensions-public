/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debounce } from 'lodash';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Control, Controller, FieldValues, UseFormWatch } from 'react-hook-form';
import styled from '@emotion/styled';
import {
    Button,
    CompletionItem,
    ErrorBanner,
    FormExpressionEditor,
    FormExpressionEditorRef,
    RequiredFormInput,
    ThemeColors
} from '@wso2-enterprise/ui-toolkit';
import { sanitizeType } from './utils';
import { FormField, FormExpressionEditorProps } from '../Form/types';
import { useFormContext } from '../../context';
import {
    LineRange,
    SubPanel,
    SubPanelView,
    SubPanelViewProps
} from '@wso2-enterprise/ballerina-core';

type ContextAwareExpressionEditorProps = {
    field: FormField;
    openSubPanel?: (subPanel: SubPanel) => void;
    subPanelView?: SubPanelView;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
    visualizable?: boolean;
}

type ExpressionEditorProps = ContextAwareExpressionEditorProps & FormExpressionEditorProps & {
    control: Control<FieldValues, any>;
    watch: UseFormWatch<any>;
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
        color: ThemeColors.PRIMARY,
        fontFamily: 'monospace',
        fontSize: '12px',
        border: `1px solid ${ThemeColors.PRIMARY}`,
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

    export const DataMapperBtnTxt = styled.p`
        font-size: 10px;
        margin: 0;
        color: var(--vscode-button-background);
    `;

    export const AddNewButton = styled(Button)`
        & > vscode-button {
            color: var(--vscode-textLink-activeForeground);
            border-radius: 0px;
            padding: 3px 5px;
            margin-top: 4px;
        };
        & > vscode-button > * {
            margin-right: 6px;
        };
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
        getExpressionEditorDiagnostics,
        getHelperPane,
        onFocus,
        onBlur,
        onCompletionItemSelect,
        onSave,
        onCancel,
        onRemove,
        openSubPanel,
        handleOnFieldFocus,
        subPanelView,
        targetLineRange,
        fileName,
        visualizable,
        helperPaneOrigin
    } = props as ExpressionEditorProps;
    const [focused, setFocused] = useState<boolean>(false);

    // If Form directly  calls ExpressionEditor without setting targetLineRange and fileName through context
    const { targetLineRange: contextTargetLineRange, fileName: contextFileName } = useFormContext();
    const effectiveTargetLineRange = targetLineRange ?? contextTargetLineRange;
    const effectiveFileName = fileName ?? contextFileName;

    const [isHelperPaneOpen, setIsHelperPaneOpen] = useState<boolean>(false);
    /* Define state to retrieve helper pane data */

    const exprRef = useRef<FormExpressionEditorRef>(null);

    // Use to fetch initial diagnostics
    const fetchInitialDiagnostics = useRef<boolean>(true);
    const fieldValue = watch(field.key);

    useImperativeHandle(ref, () => exprRef.current);

    // Initial render
    useEffect(() => {
        // Fetch initial diagnostics
        if (getExpressionEditorDiagnostics && fieldValue !== undefined && fetchInitialDiagnostics.current) {
            fetchInitialDiagnostics.current = false;
            getExpressionEditorDiagnostics(!field.optional || fieldValue !== "", fieldValue, field.key);
        }
    }, [fieldValue]);

    const cursorPositionRef = useRef<number | undefined>(undefined);

    const handleFocus = async () => {
        setFocused(true);
        // Trigger actions on focus
        await onFocus?.();
        handleOnFieldFocus?.(field.key);
    };

    const handleBlur = async () => {
        setFocused(false);
        // Trigger actions on blur
        await onBlur?.();

        // Clean up memory
        cursorPositionRef.current = undefined;
    };

    const handleCompletionSelect = async (value: string, item: CompletionItem) => {
        // Trigger actions on completion select
        await onCompletionItemSelect?.(value, item.additionalTextEdits);

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

    const handleInlineDataMapperOpen = (isUpdate: boolean) => {
        if (subPanelView === SubPanelView.INLINE_DATA_MAPPER && !isUpdate) {
            openSubPanel({ view: SubPanelView.UNDEFINED });
        } else {
            handleOpenSubPanel(SubPanelView.INLINE_DATA_MAPPER, {
                inlineDataMapper: {
                    filePath: effectiveFileName,
                    flowNode: undefined, // This will be updated in the Form component
                    position: {
                        line: effectiveTargetLineRange.startLine.line,
                        offset: effectiveTargetLineRange.startLine.offset,
                    },
                    propertyKey: field.key,
                    editorKey: field.key
                }
            });
            handleOnFieldFocus?.(field.key);
        }
    };

    const handleChangeHelperPaneState = (isOpen: boolean) => {
        setIsHelperPaneOpen(isOpen);
    }

    const handleGetHelperPane = (value: string, onChange: (value: string, updatedCursorPosition: number) => void) => {
        return getHelperPane?.(exprRef, field.placeholder, value, onChange, handleChangeHelperPaneState);
    }

    const updateSubPanelData = (value: string) => {
        if (subPanelView === SubPanelView.INLINE_DATA_MAPPER) {
            handleInlineDataMapperOpen(true);
        }
    };

    const handleExtractArgsFromFunction = async (value: string, cursorPosition: number) => {
        return await extractArgsFromFunction(value, field.key, cursorPosition);
    };

    const debouncedUpdateSubPanelData = debounce(updateSubPanelData, 300);

    const codeActions = [
        visualizable && (
            <Button appearance="icon" onClick={() => handleInlineDataMapperOpen(false)}>
                <S.DataMapperBtnTxt>Map Data Inline</S.DataMapperBtnTxt>
            </Button>
        )
    ];

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
                                debouncedUpdateSubPanelData(value);
                                cursorPositionRef.current = updatedCursorPosition;

                                if (getExpressionEditorDiagnostics) {
                                    getExpressionEditorDiagnostics(!field.optional || value !== '', value, field.key);
                                }

                                // Check if the current character is a trigger character
                                const triggerCharacter =
                                    updatedCursorPosition > 0
                                        ? triggerCharacters.find((char) => value[updatedCursorPosition - 1] === char)
                                        : undefined;
                                if (triggerCharacter) {
                                    await retrieveCompletions(value, field.key, updatedCursorPosition, triggerCharacter);
                                } else {
                                    await retrieveCompletions(value, field.key, updatedCursorPosition);
                                }
                            }}
                            extractArgsFromFunction={handleExtractArgsFromFunction}
                            onCompletionSelect={handleCompletionSelect}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSave={onSave}
                            onCancel={onCancel}
                            onRemove={onRemove}
                            isHelperPaneOpen={isHelperPaneOpen}
                            changeHelperPaneState={handleChangeHelperPaneState}
                            helperPaneOrigin={helperPaneOrigin}
                            getHelperPane={handleGetHelperPane}
                            placeholder={field.placeholder}
                            sx={{ paddingInline: '0' }}
                            codeActions={codeActions}
                        />
                        {error && <ErrorBanner errorMsg={error.message.toString()} />}
                    </div>
                )}
            />
        </S.Container>
    );
});
