/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debounce } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { Range } from 'vscode-languageserver-types';
import styled from '@emotion/styled';
import { HelperPaneCompletionItem, HelperPaneFunctionInfo, FormExpressionFieldValue } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import {
    Button,
    Codicon,
    CompletionItem,
    ErrorBanner,
    FormExpressionEditor,
    FormExpressionEditorRef,
    Icon,
    RequiredFormInput,
    Typography,
} from '@wso2-enterprise/ui-toolkit';
import { getHelperPane } from './HelperPane';
import { filterHelperPaneCompletionItems, filterHelperPaneFunctionCompletionItems, modifyCompletion } from './utils';

type EXProps = {
    isActive: boolean;
}

/**
 * Props for ExpressionEditor
 * @param documentUri - The URI of the document
 * @param label - The label of the expression
 * @param required - Whether the expression is required
 * @param value - The value of the expression
 * @param placeholder - The placeholder of the expression
 * @param nodeRange - The range of the node with the expression
 * @param canChange - Whether the expression mode can be toggled
 * @param onChange - Callback function to be called when the expression changes
 * @param onFocus - Callback function to be called when the expression is focused
 * @param onBlur - Callback function to be called when the expression is blurred
 * @param onCancel - Callback function to be called when the completions dropdown is closed
 * @param openExpressionEditor - Callback function to be called when the expression editor is opened
 * @param errorMsg - The error message to display
 */
type FormExpressionFieldProps = {
    label: string;
    required: boolean;
    value: FormExpressionFieldValue;
    placeholder: string;
    nodeRange: Range;
    canChange: boolean;
    onChange: (value: FormExpressionFieldValue) => void;
    onFocus?: (e?: any) => void | Promise<void>;
    onBlur?: (e?: any) => void | Promise<void>;
    onCancel?: () => void;
    openExpressionEditor: (value: FormExpressionFieldValue, setValue: (value: FormExpressionFieldValue) => void) => void;
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

    export const LabelEndAdornment = styled.div({
        marginLeft: 'auto',
        marginRight: '44px'
    });

    export const EX = styled.div<EXProps>(({ isActive }: EXProps) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        border: `1px solid ${isActive ? 'var(--focus-border)' : 'var(--dropdown-border)'}`,
        cursor: 'pointer',
    }));

    export const EXText = styled(Typography)<EXProps>(({ isActive }: EXProps) => ({
        fontSize: '10px',
        fontWeight: 600,
        color: isActive ? 'var(--focus-border)' : 'inherit',
    }));
}

/**
 * The FormExpressionField component for MI forms.
 * This component should be used with a Controller when using react-hook-forms.
 */
export const FormExpressionField = (params: FormExpressionFieldProps) => {
    const {
        label,
        required,
        value,
        placeholder,
        nodeRange,
        canChange,
        onChange,
        onCancel,
        errorMsg,
        onFocus,
        onBlur,
        openExpressionEditor
    } = params;

    const { rpcClient } = useVisualizerContext();

    const expressionRef = useRef<FormExpressionEditorRef>(null);
    const cursorPositionRef = useRef<number>(null);
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [isHelperPaneOpen, setIsHelperPaneOpen] = useState<boolean>(false);
    const [isLoadingHelperPaneInfo, setIsLoadingHelperPaneInfo] = useState<boolean>(false);
    const [isExActive, setIsExActive] = useState<boolean>(false);
    const [payloadInfo, setPayloadInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [variableInfo, setVariableInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [propertiesInfo, setPropertiesInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [functionInfo, setFunctionInfo] = useState<HelperPaneFunctionInfo>(null);
    const [configInfo, setConfigInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [headerInfo, setHeaderInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [paramInfo, setParamInfo] = useState<HelperPaneCompletionItem[]>(null);

    const debouncedRetrieveCompletions = useCallback(
        async (expression: string, cursorPosition: number) => {
            const machineView = await rpcClient.getVisualizerState();
            const completions = await rpcClient.getMiDiagramRpcClient().getExpressionCompletions({
                documentUri: machineView.documentUri,
                expression,
                position: nodeRange.start,
                offset: cursorPosition,
            });
            const modifiedCompletions =
                completions?.items
                    .map((completion: any) => modifyCompletion(completion))
                    .sort((a, b) => a.sortText.localeCompare(b.sortText)) ?? [];
            setCompletions(modifiedCompletions);
        },
        [rpcClient]
    );

    const retrieveCompletions = useCallback(debounce(debouncedRetrieveCompletions, 300), [
        debouncedRetrieveCompletions,
    ]);

    const handleExpressionChange = async (expression: string, updatedCursorPosition: number) => {
        onChange({ ...value, value: expression });
        cursorPositionRef.current = updatedCursorPosition;

        const isHelperPaneOpen = expression === "" ? true : false;
        handleChangeHelperPaneState(isHelperPaneOpen);

        if (!isHelperPaneOpen) {
            retrieveCompletions(expression, updatedCursorPosition);
        }
    };

    const handleCancel = () => {
        retrieveCompletions.cancel();
        setCompletions([]);

        onCancel?.();
    };

    const handleFocus = async () => {
        await onFocus?.();
    };

    const handleBlur = async () => {
        await onBlur?.();

        handleCancel();
    };

    const getHelperPaneInfo = useCallback(debounce((type: string, filterText: string) => {
        rpcClient.getVisualizerState().then((machineView) => {
            rpcClient
                .getMiDiagramRpcClient()
                .getHelperPaneInfo({
                    documentUri: machineView.documentUri,
                    position: nodeRange?.start
                })
                .then((response) => {
                    switch (type) {
                        case 'payload':
                            setPayloadInfo(filterHelperPaneCompletionItems(response.payload, filterText));
                            break;
                        case 'variables':
                            setVariableInfo(filterHelperPaneCompletionItems(response.variables, filterText));
                            break;
                        case 'properties':
                            setPropertiesInfo(filterHelperPaneCompletionItems(response.properties, filterText));
                            break;
                        case 'functions':
                            setFunctionInfo(filterHelperPaneFunctionCompletionItems(response.functions, filterText));
                            break;
                        case 'configs':
                            setConfigInfo(filterHelperPaneCompletionItems(response.configs, filterText));
                            break;
                        case 'headers':
                            setHeaderInfo(filterHelperPaneCompletionItems(response.headers, filterText));
                            break;
                        case 'params':
                            setParamInfo(filterHelperPaneCompletionItems(response.params, filterText));
                            break;
                    }
                })
                .finally(() => {
                    setIsLoadingHelperPaneInfo(false);
                });
            });
        }, 300),
        [rpcClient, nodeRange?.start]
    );

    const handleGetHelperPaneInfo = useCallback((type: string, filterText: string) => {
        setIsLoadingHelperPaneInfo(true);
        getHelperPaneInfo(type, filterText);
    }, [getHelperPaneInfo]);

    const handleChangeHelperPaneState = (isOpen: boolean) => {
        if (isOpen) {
            expressionRef.current?.focus();
        } else {
            expressionRef.current?.blur();
        }

        setIsHelperPaneOpen(isOpen);
    }

    const handleGetHelperPane = (value: string, onChange: (value: string, updatedCursorPosition: number) => void) => {
        return getHelperPane(
            expressionRef,
            isLoadingHelperPaneInfo,
            payloadInfo,
            variableInfo,
            propertiesInfo,
            functionInfo,
            configInfo,
            headerInfo,
            paramInfo,
            () => handleChangeHelperPaneState(false),
            handleGetHelperPaneInfo,
            value,
            onChange
        );
    }

    const handleFunctionEdit = (functionName: string) => {
        // Open Expression Editor for xpath
        if (functionName === 'xpath') {
            setIsExActive(true);
        } else {
            setIsExActive(false);
        }
    }

    const handleGetExpressionEditorIcon = () => {
        const handleClick = () => {
            if (canChange) {
                onChange({ ...value, isExpression: !value.isExpression });
            }
        }

        return (
            <S.EX isActive={value.isExpression} onClick={handleClick}>
                <S.EXText isActive={value.isExpression}>EX</S.EXText>
            </S.EX>
        );
    }

    return (
        <S.Container>
            <S.Header>
                <S.Label>{label}</S.Label>
                {required && <RequiredFormInput />}
                <S.LabelEndAdornment>
                    {value.isExpression && (
                        <>
                            {isExActive && (
                                <Button
                                    tooltip="Open Expression editor"
                                    appearance='icon'
                                    onClick={() => openExpressionEditor(value, onChange)}
                                    sx={{ height: '14px', width: '12px' }}
                                >
                                    <Codicon name="edit" iconSx={{ fontSize: '12px' }} sx={{ height: '12px', width: '12px' }} />
                                </Button>
                            )}
                            <Button
                                tooltip="Open Helper Pane"
                                appearance='icon'
                                onClick={() => handleChangeHelperPaneState(!isHelperPaneOpen)}
                                sx={{ height: '14px', width: '12px' }}
                            >
                                <Icon name="function-icon" sx={{ color: 'var(--vscode-button-background)' }} />
                            </Button>
                        </>
                    )}
                </S.LabelEndAdornment>
            </S.Header>
            <div>
                <FormExpressionEditor
                    ref={expressionRef}
                    value={value.value}
                    placeholder={placeholder}
                    onChange={handleExpressionChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onCancel={handleCancel}
                    getExpressionEditorIcon={handleGetExpressionEditorIcon}
                    {...(value.isExpression && {
                        completions,
                        isHelperPaneOpen,
                        changeHelperPaneState: handleChangeHelperPaneState,
                        getHelperPane: handleGetHelperPane,
                        onFunctionEdit: handleFunctionEdit,
                    })}
                />
                {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
            </div>
        </S.Container>
    );
};
