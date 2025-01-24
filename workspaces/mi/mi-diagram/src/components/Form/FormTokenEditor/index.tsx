/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debounce } from "lodash";
import React, { CSSProperties, ReactNode, useCallback, useState } from "react";
import { Range } from 'vscode-languageserver-types';

import styled from "@emotion/styled";
import { HelperPaneFunctionInfo, HelperPaneCompletionItem } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { ErrorBanner, RequiredFormInput, TokenEditor } from "@wso2-enterprise/ui-toolkit";

import { filterHelperPaneCompletionItems, filterHelperPaneFunctionCompletionItems } from "../FormExpressionField/utils";
import { getHelperPane } from "../HelperPane";

namespace S {
    export const Container = styled.div<{ sx?: CSSProperties }>`
        width: 100%;

        ${({ sx }: { sx?: CSSProperties }) => sx}
    `

    export const Header = styled.div({
        display: 'flex',
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
        textTransform: 'capitalize',
    });
}

/**
 * Props for FormTokenEditor
 * @param nodeRange - The range of the node with the token editor
 * @param id - The id of the token editor
 * @param value - The value of the token editor
 * @param onChange - Callback function to be called when the value changes
 * @param labelAdornment - The label adornment to display
 * @param label - The label of the token editor
 * @param placeholder - The placeholder of the token editor
 * @param required - Whether the token editor is required
 * @param errorMsg - The error message to display
 */
type FormTokenEditorProps = {
    nodeRange: Range;
    id?: string;
    value: string;
    onChange: (value: string) => void;
    labelAdornment?: ReactNode;
    label?: string;
    placeholder?: string;
    required?: boolean;
    errorMsg?: string;

    sx?: CSSProperties;
}

export const FormTokenEditor = ({
    nodeRange,
    id,
    value,
    onChange,
    labelAdornment,
    label,
    placeholder,
    required,
    errorMsg,
    sx
}: FormTokenEditorProps) => {
    const { rpcClient } = useVisualizerContext();
    
    const [isHelperPaneOpen, setIsHelperPaneOpen] = useState<boolean>(false);
    const [isLoadingHelperPaneInfo, setIsLoadingHelperPaneInfo] = useState<boolean>(false);
    const [payloadInfo, setPayloadInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [variableInfo, setVariableInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [propertiesInfo, setPropertiesInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [functionInfo, setFunctionInfo] = useState<HelperPaneFunctionInfo>(null);
    const [configInfo, setConfigInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [headerInfo, setHeaderInfo] = useState<HelperPaneCompletionItem[]>(null);
    const [paramInfo, setParamInfo] = useState<HelperPaneCompletionItem[]>(null);
    
    const getHelperPaneInfo = useCallback(debounce((type: string, filterText: string) => {
        rpcClient.getVisualizerState().then((machineView) => {
            let position = nodeRange?.start == nodeRange?.end ? nodeRange.start :
                { line: nodeRange.start.line, character: nodeRange.start.character + 1 };
            rpcClient
                .getMiDiagramRpcClient()
                .getHelperPaneInfo({
                    documentUri: machineView.documentUri,
                    position: position,
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
    
    const getHelperPaneEl = () => {
        return getHelperPane(
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


    return (
        <S.Container id={id} sx={sx}>
            <S.Header>
                <S.Label>{label}</S.Label>
                {required && <RequiredFormInput />}
                {labelAdornment}
            </S.Header>
            <TokenEditor
                value={value}
                onChange={onChange}
                getHelperPane={getHelperPaneEl}
                helperPaneOrigin="left"
                isHelperPaneOpen={isHelperPaneOpen}
                changeHelperPaneState={setIsHelperPaneOpen}
            />
            {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
        </S.Container>
    );
}
