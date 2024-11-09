/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FormField } from '../Form/types';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { Button, CompletionItem, ExpressionBar, ExpressionBarRef, InputProps, RequiredFormInput } from '@wso2-enterprise/ui-toolkit';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { useFormContext } from '../../context';
import { ConfigurePanelData, LineRange, SubPanel, SubPanelView, SubPanelViewProps } from '@wso2-enterprise/ballerina-core';
import { debounce } from 'lodash';
import { Colors } from '../../resources/constants';

type ContextAwareExpressionEditorProps = {
    field: FormField;
    openSubPanel?: (subPanel: SubPanel) => void;
    isActiveSubPanel?: boolean;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
}

type ExpressionEditorProps = ContextAwareExpressionEditorProps & {
    control: Control<FieldValues, any>;
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
    onFocus?: () => void | Promise<void>;
    onBlur?: () => void | Promise<void>;
    onCompletionSelect?: (value: string) => void | Promise<void>;
    onSave?: (value: string) => void | Promise<void>;
    onCancel: () => void;
    onRemove?: () => void;
    targetLineRange?: LineRange;
    fileName: string;
};

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

    export const Type = styled.div({
        color: 'var(--vscode-list-deemphasizedForeground)',
        fontFamily: 'monospace'
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
        textTransform: 'capitalize',
    });

    export const Description = styled.div({
        color: 'var(--vscode-list-deemphasizedForeground)',
    });

    export const Error = styled.div({
        color: Colors.ERROR,
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

export const ContextAwareExpressionEditor = forwardRef<ExpressionBarRef, ContextAwareExpressionEditorProps>((props, ref) => {
    const { form, expressionEditor, targetLineRange, fileName } = useFormContext();

    return <ExpressionEditor ref={ref} fileName={fileName} {...targetLineRange} {...props} {...form} {...expressionEditor} />;
});

export const ExpressionEditor = forwardRef<ExpressionBarRef, ExpressionEditorProps>((props, ref) => {
    const {
        control,
        field,
        completions,
        triggerCharacters,
        retrieveCompletions,
        extractArgsFromFunction,
        onFocus,
        onBlur,
        onCompletionSelect,
        onSave,
        onCancel,
        onRemove,
        openSubPanel,
        isActiveSubPanel,
        targetLineRange,
        fileName,
        handleOnFieldFocus,
        autoFocus
    } = props as ExpressionEditorProps;


        // If Form directly  calls ExpressionEditor without setting targetLineRange and fileName through context
    const { targetLineRange: contextTargetLineRange, fileName: contextFileName } = useFormContext();
    const effectiveTargetLineRange = targetLineRange ?? contextTargetLineRange;
    const effectiveFileName = fileName ?? contextFileName;

    const exprRef = useRef<ExpressionBarRef>(null);

    useImperativeHandle(ref, () => exprRef.current);

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

        // Trigger actions on focus
        await onFocus?.();
        await retrieveCompletions(value, cursorPosition, undefined, true);
        handleOnFieldFocus?.(field.key);
    };

    const handleBlur = async () => {
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

    const handleHelperPaneOpen = () => {
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
                    value: field.value
                };
                subPanelProps.sidePanelData.configurePanelData = configurePanelData;
            }

            handleOpenSubPanel(SubPanelView.HELPER_PANEL, subPanelProps);
            handleOnFieldFocus?.(field.key);
        }
    };

    const updateSubPanelData = (value: string) => {
        if (isActiveSubPanel && effectiveTargetLineRange && effectiveFileName && field.type === 'RECORD_EXPRESSION') {
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
    const errorMsg = field.diagnostics?.map((diagnostic) => diagnostic.message).join('\n');

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
                {field.type && field.type !== 'EXPRESSION' && field.type !== 'FLAG' && <S.Type>{field.type}</S.Type>}
            </S.HeaderContainer>
            <Controller
                control={control}
                name={field.key}
                rules={{ required: !field.optional && !field.placeholder }}
                render={({ field: { name, value, onChange } }) => (
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

                            // HACK: Fix diagnostics from the expression editor
                            field.diagnostics = [];

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
                        useTransaction={useTransaction}
                        shouldDisableOnSave={false}
                        inputProps={endAdornment}
                        handleHelperPaneOpen={handleHelperPaneOpen}
                        placeholder={field.placeholder}
                        sx={{ paddingInline: '0' }}
                    />
                )}
            />
            {errorMsg && <S.Error>{errorMsg}</S.Error>}
        </S.Container>
    );
});
