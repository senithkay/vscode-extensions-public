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
import { HelperPaneCompletionItem, HelperPaneFunctionInfo } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import {
    CompletionItem,
    ErrorBanner,
    FormExpressionEditor,
    FormExpressionEditorRef,
    RequiredFormInput,
} from '@wso2-enterprise/ui-toolkit';
import { getHelperPane } from './HelperPane';
import { modifyCompletion } from './utils';

/**
 * Props for ExpressionEditor
 * @param documentUri - The URI of the document
 * @param label - The label of the expression
 * @param required - Whether the expression is required
 * @param value - The value of the expression
 * @param placeholder - The placeholder of the expression
 * @param nodeRange - The range of the node with the expression
 * @param onChange - Callback function to be called when the expression changes
 * @param onFocus - Callback function to be called when the expression is focused
 * @param onBlur - Callback function to be called when the expression is blurred
 * @param onCancel - Callback function to be called when the completions dropdown is closed
 * @param errorMsg - The error message to display
 */
type FormExpressionFieldProps = {
    label: string;
    required: boolean;
    value: string;
    placeholder: string;
    nodeRange: Range;
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
        label,
        required,
        value,
        placeholder,
        nodeRange,
        onChange,
        onCancel,
        errorMsg,
        onFocus,
        onBlur,
    } = params;

    const { rpcClient } = useVisualizerContext();

    const expressionRef = useRef<FormExpressionEditorRef>(null);
    const cursorPositionRef = useRef<number>(null);
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [isHelperPaneOpen, setIsHelperPaneOpen] = useState<boolean>(false);
    const [isLoadingHelperPaneInfo, setIsLoadingHelperPaneInfo] = useState<boolean>(false);
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

    const handleChange = async (value: string, updatedCursorPosition: number) => {
        onChange(value);
        cursorPositionRef.current = updatedCursorPosition;

        const isHelperPaneOpen = value === "" ? true : false;
        setIsHelperPaneOpen(isHelperPaneOpen);

        if (!isHelperPaneOpen) {
            retrieveCompletions(value, updatedCursorPosition);
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
                            setPayloadInfo(response.payload);
                            break;
                        case 'variables':
                            setVariableInfo(response.variables);
                            break;
                        case 'properties':
                            setPropertiesInfo(response.properties);
                            break;
                        case 'functions':
                            setFunctionInfo(response.functions);
                            break;
                        case 'configs':
                            setConfigInfo(response.configs);
                            break;
                        case 'headers':
                            setHeaderInfo(response.headers);
                            break;
                        case 'params':
                            setParamInfo(response.params);
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
            () => setIsHelperPaneOpen(false),
            handleGetHelperPaneInfo,
            value,
            onChange
        );
    }

    return (
        <S.Container>
            <S.Header>
                <S.Label>{label}</S.Label>
                {required && <RequiredFormInput />}
            </S.Header>
            <div>
                <FormExpressionEditor
                    ref={expressionRef}
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onCancel={handleCancel}
                    completions={completions}
                    isHelperPaneOpen={isHelperPaneOpen}
                    changeHelperPaneState={handleChangeHelperPaneState}
                    getHelperPane={handleGetHelperPane}
                />
                {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
            </div>
        </S.Container>
    );
};
