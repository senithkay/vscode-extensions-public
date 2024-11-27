/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FormField } from '../Form/types';
import { Control, Controller, FieldValues, UseFormWatch } from 'react-hook-form';
import { Button, Codicon, CompletionItem, ErrorBanner, ExpressionBar, ExpressionBarRef, Icon, RequiredFormInput, ThemeColors } from '@wso2-enterprise/ui-toolkit';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { useFormContext } from '../../context';
import { ConfigurePanelData, LineRange, SubPanel, SubPanelView, SubPanelViewProps } from '@wso2-enterprise/ballerina-core';
import { debounce } from 'lodash';
import { Colors } from '../../resources/constants';
import { sanitizeType } from './utils';

type ContextAwareExpressionEditorProps = {
    field: FormField;
    openSubPanel?: (subPanel: SubPanel) => void;
    subPanelView?: SubPanelView;
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

    export const DataMapperBtnTxt = styled.p`
        font-size: 10px;
        margin: 0;
        color: var(--vscode-button-background);
    `;
}

export const ContextAwareExpressionEditor = forwardRef<ExpressionBarRef, ContextAwareExpressionEditorProps>((props, ref) => {
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

export const ExpressionEditor = forwardRef<ExpressionBarRef, ExpressionEditorProps>((props, ref) => {
    const {
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
        subPanelView,
        targetLineRange,
        fileName,
        handleOnFieldFocus,
        autoFocus
    } = props as ExpressionEditorProps;
    const [focused, setFocused] = useState(false);

    // If Form directly  calls ExpressionEditor without setting targetLineRange and fileName through context
    const { targetLineRange: contextTargetLineRange, fileName: contextFileName } = useFormContext();
    const effectiveTargetLineRange = targetLineRange ?? contextTargetLineRange;
    const effectiveFileName = fileName ?? contextFileName;

    const exprRef = useRef<ExpressionBarRef>(null);

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

    // Use to disable the expression editor on save and completion selection
    const useTransaction = (fn: (...args: any[]) => Promise<any>) => {
        return useMutation({
            mutationFn: fn,
            networkMode: 'always',
        });
    };

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

    const handleInlineDataMapperOpen = (isUpdate: boolean) => {
        if (subPanelView === SubPanelView.INLINE_DATA_MAPPER && !isUpdate) {
            openSubPanel({view: SubPanelView.UNDEFINED});
        } else {
            handleOpenSubPanel(SubPanelView.INLINE_DATA_MAPPER, { inlineDataMapper: {
                filePath: contextFileName,
                flowNode: undefined, // This will be updated in the Form component
                position: {
                    line: effectiveTargetLineRange.startLine.line,
                    offset: effectiveTargetLineRange.startLine.offset,
                },
                propertyKey: field.type,
                editorKey: field.key
            }});
            handleOnFieldFocus?.(field.key);
        }
    };

    const handleHelperPaneOpen = () => {
        if (subPanelView === SubPanelView.HELPER_PANEL) {
            openSubPanel({view: SubPanelView.UNDEFINED});
        } else {
            if (effectiveTargetLineRange && effectiveFileName) {
                const subPanelProps: SubPanelViewProps = {
                    sidePanelData: {
                        filePath: effectiveFileName,
                        range: {
                            startLine: effectiveTargetLineRange.startLine,
                            endLine: effectiveTargetLineRange.endLine,
                        },
                        editorKey: field.key
                    }
                };
                if (field.type === 'RECORD_EXPRESSION') { // TODO: update the type based on the LS API
                    const configurePanelData: ConfigurePanelData = {
                        isEnable: true,
                        name: field.label,
                        documentation: field.documentation,
                        value: field.value as string
                    };
                    subPanelProps.sidePanelData.configurePanelData = configurePanelData;
                }
    
                handleOpenSubPanel(SubPanelView.HELPER_PANEL, subPanelProps);
                handleOnFieldFocus?.(field.key);
            }
        }
    };

    const updateSubPanelData = (value: string) => {
        const isActiveSubPanel = subPanelView !== SubPanelView.UNDEFINED;

        if (subPanelView === SubPanelView.INLINE_DATA_MAPPER) {
            handleInlineDataMapperOpen(true);
        } else if (isActiveSubPanel && effectiveTargetLineRange && effectiveFileName && field.type === 'RECORD_EXPRESSION') {
            const subPanelProps: SubPanelViewProps = {
                sidePanelData: {
                    filePath: effectiveFileName,
                    range: {
                        startLine: effectiveTargetLineRange.startLine,
                        endLine: effectiveTargetLineRange.endLine,
                    },
                    editorKey: field.key,
                    configurePanelData: {
                        isEnable: true,
                        name: field.label,
                        documentation: field.documentation,
                        value: value
                    }
                }
            };

            handleOpenSubPanel(SubPanelView.HELPER_PANEL, subPanelProps);
        };
    };

    const debouncedUpdateSubPanelData = debounce(updateSubPanelData, 300);

    const actionButtons = [
        <Button appearance="icon" onClick={handleHelperPaneOpen} tooltip="Open Helper View">
            <Icon name="function-icon" sx={{ color: ThemeColors.PRIMARY }} />
        </Button>,
        // TODO: Render the Data Mapper button whenever the `visualizable` flag is set to true
        <Button appearance="icon" onClick={() => handleInlineDataMapperOpen(false)} tooltip="Create using Data Mapper">
            <S.DataMapperBtnTxt>DM</S.DataMapperBtnTxt>
        </Button>,
        onRemove && (
            <Button appearance="icon" onClick={onRemove} tooltip="Remove Expression">
                <Codicon name="trash" sx={{ color: ThemeColors.ERROR }} />
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
                        <ExpressionBar
                            key={field.key}
                            ref={exprRef}
                            name={name}
                            completions={completions}
                            value={value}
                            autoFocus={props.autoFocus}
                            onChange={async (value: string, updatedCursorPosition: number) => {
                                onChange(value);
                                debouncedUpdateSubPanelData(value);

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
                            useTransaction={useTransaction}
                            shouldDisableOnSave={false}
                            placeholder={field.placeholder}
                            sx={{ paddingInline: '0' }}
                            actionButtons={actionButtons}
                        />
                        {error && <ErrorBanner errorMsg={error.message.toString()} />}
                    </div>
                )}
            />
        </S.Container>
    );
});
