/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debounce } from 'lodash';
import React, { CSSProperties, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
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
import { enrichExpressionValue, extractExpressionValue, filterHelperPaneCompletionItems, filterHelperPaneFunctionCompletionItems, modifyCompletion } from './utils';

type EXProps = {
    isActive: boolean;
}

type StyleProps = {
    sx?: CSSProperties;
}

/**
 * Props for ExpressionEditor
 * @param labelAdornment - The label adornment to display
 * @param id - The id of the expression field
 * @param disabled - Whether the expression field is disabled
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
 * @param expressionType - Whether the expression is of type xpath/jsonPath or synapse
 * @param errorMsg - The error message to display
 * @param sx - The style to apply to the container
 */
type FormExpressionFieldProps = {
    labelAdornment?: ReactNode;
    id?: string;
    disabled?: boolean;
    label: string;
    required?: boolean;
    value: FormExpressionFieldValue;
    placeholder: string;
    nodeRange: Range;
    canChange: boolean;
    onChange: (value: FormExpressionFieldValue) => void;
    onFocus?: (e?: any) => void | Promise<void>;
    onBlur?: (e?: any) => void | Promise<void>;
    onCancel?: () => void;
    openExpressionEditor: (value: FormExpressionFieldValue, setValue: (value: FormExpressionFieldValue) => void) => void;
    expressionType?: 'xpath/jsonPath' | 'synapse';
    errorMsg: string;
    sx?: CSSProperties;
};

export namespace S {
    export const Container = styled.div<StyleProps>(({ sx }: StyleProps) => ({
        width: '100%',
        fontFamily: 'var(--font-family)',
        ...sx
    }));

    export const Header = styled.div({
        display: 'flex',
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
        textTransform: 'capitalize',
    });

    export const AdornmentContainer = styled.div({
        marginTop: '3.75px',
        marginBottom: '2.5px',
        width: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--vscode-inputOption-activeBackground)'
    })

    export const EX = styled.div<EXProps>(({ isActive }: EXProps) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        border: '1px solid transparent',
        cursor: 'pointer',

        '&:hover': {
            backgroundColor: 'var(--vscode-inputOption-activeBackground)'
        },

        ...(isActive && {
            backgroundColor: 'var(--vscode-inputOption-activeBackground)',
            borderColor: 'var(--vscode-inputOption-activeBorder)'
        }),
    }));

    export const EXText = styled(Typography)<EXProps>(({ isActive }: EXProps) => ({
        color: isActive ? 'var(--focus-border)' : 'inherit',
    }));
}

/**
 * The FormExpressionField component for MI forms.
 * This component should be used with a Controller when using react-hook-forms.
 */
export const FormExpressionField = (params: FormExpressionFieldProps) => {
    const {
        labelAdornment,
        id,
        disabled,
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
        expressionType = 'synapse',
        openExpressionEditor,
        sx
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
                expression: expression,
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
        onChange({ ...value, value: enrichExpressionValue(expression, expressionType) });
        cursorPositionRef.current = updatedCursorPosition;

        // Only retrieve completions if the value is an expression
        if (value.isExpression) {
            const isHelperPaneOpen = expression === "" ? true : false;
            handleChangeHelperPaneState(isHelperPaneOpen);

            if (!isHelperPaneOpen) {
                retrieveCompletions(expression, updatedCursorPosition);
            }
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
                <S.EXText variant='h6' sx={{ margin: 0 }} isActive={value.isExpression}>EX</S.EXText>
            </S.EX>
        );
    }

    const actionButtons = useMemo(() => {
        if (!value.isExpression) {
            return [];
        }

        return [
            ...(isExActive ? [{
                tooltip: 'Open Expression Editor',
                iconType: 'codicon' as any,
                name: 'edit',
                onClick: () => openExpressionEditor(value, onChange)
            }] : []),
            {
                tooltip: 'Open Helper Pane',
                iconType: 'icon' as any,
                name: 'function-icon',
                onClick: () => {
                    expressionRef.current?.focus();
                    handleChangeHelperPaneState(!isHelperPaneOpen)
                }
            }
        ];
    }, [isExActive, isHelperPaneOpen, value, handleChangeHelperPaneState, openExpressionEditor, onChange]);

    return (
        <S.Container id={id} sx={sx}>
            <S.Header>
                <S.Label>{label}</S.Label>
                {required && <RequiredFormInput />}
                {labelAdornment}
            </S.Header>
            <div>
                <FormExpressionEditor
                    ref={expressionRef}
                    disabled={disabled}
                    value={extractExpressionValue(value.value)}
                    placeholder={placeholder}
                    onChange={handleExpressionChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onCancel={handleCancel}
                    getExpressionEditorIcon={handleGetExpressionEditorIcon}
                    {...(expressionType === 'synapse' && {
                        startAdornment: <S.AdornmentContainer>
                            <Typography variant='h4' sx={{ margin: 0 }}>{'${'}</Typography>
                        </S.AdornmentContainer>,
                        endAdornment: <S.AdornmentContainer>
                            <Typography variant='h4' sx={{ margin: 0 }}>{'}'}</Typography>
                        </S.AdornmentContainer>
                    })}
                    {...(expressionType !== 'xpath/jsonPath' && value.isExpression && {
                        completions,
                        actionButtons,
                        isHelperPaneOpen,
                        changeHelperPaneState: handleChangeHelperPaneState,
                        getHelperPane: handleGetHelperPane,
                        onFunctionEdit: handleFunctionEdit
                    })}
                />
                {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
            </div>
        </S.Container>
    );
};
