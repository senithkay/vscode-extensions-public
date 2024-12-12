/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { FormExpressionEditorRef, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneCompletionItem, HelperPaneFunctionInfo } from '@wso2-enterprise/mi-core';
import { CategoryPage } from './CategoryPage';
import { VariablesPage } from './VariablesPage';
import { FunctionsPage } from './FunctionsPage';
import { PayloadPage } from './PayloadPage';
import { PropertiesPage } from './PropertiesPage';
import { ConfigsPage } from './ConfigsPage';
import { HeadersPage } from './HeadersPage';
import { ParamsPage } from './ParamsPage';

export type HelperPaneProps = {
    exprRef: React.RefObject<FormExpressionEditorRef>;
    isLoadingHelperPaneInfo: boolean;
    payloadInfo: HelperPaneCompletionItem[];
    variableInfo: HelperPaneCompletionItem[];
    attributesInfo: HelperPaneCompletionItem[];
    functionInfo: HelperPaneFunctionInfo;
    configInfo: HelperPaneCompletionItem[];
    headerInfo: HelperPaneCompletionItem[];
    paramInfo: HelperPaneCompletionItem[];
    onClose: () => void;
    setFilterText: (type: string, filterText: string) => void;
    currentValue: string;
    onChange: (value: string, updatedCursorPosition: number) => void;
};

const HelperPaneEl = ({
    exprRef,
    isLoadingHelperPaneInfo,
    payloadInfo,
    variableInfo,
    attributesInfo,
    functionInfo,
    configInfo,
    headerInfo,
    paramInfo,
    onClose,
    setFilterText,
    currentValue,
    onChange
}: HelperPaneProps) => {
    const [currentPage, setCurrentPage] = useState<number>(0);

    const handleChange = (value: string) => {
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        const updatedValue = currentValue.slice(0, cursorPosition) + value + currentValue.slice(cursorPosition);
        const updatedCursorPosition = cursorPosition + value.length;

        // Update the value in the expression editor
        onChange(updatedValue, updatedCursorPosition);
        // Focus the expression editor
        exprRef.current?.focus();
        // Set the cursor
        exprRef.current?.setCursor(updatedValue, updatedCursorPosition);
        // Close the helper pane
        onClose();
    };

    return (
        <HelperPane sx={{ '> *': { boxSizing: 'border-box' } }}>
            {currentPage === 0 && <CategoryPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 1 && (
                <PayloadPage
                    isLoading={isLoadingHelperPaneInfo}
                    payloadInfo={payloadInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('payload', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 2 && (
                <VariablesPage
                    isLoading={isLoadingHelperPaneInfo}
                    variableInfo={variableInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('variables', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 3 && (
                <PropertiesPage
                    isLoading={isLoadingHelperPaneInfo}
                    propertiesInfo={attributesInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('properties', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 4 && (
                <FunctionsPage
                    isLoading={isLoadingHelperPaneInfo}
                    functionInfo={functionInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('functions', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 5 && (
                <ConfigsPage
                    isLoading={isLoadingHelperPaneInfo}
                    configInfo={configInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('configs', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 6 && (
                <HeadersPage
                    isLoading={isLoadingHelperPaneInfo}
                    headerInfo={headerInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('headers', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 7 && (
                <ParamsPage
                    isLoading={isLoadingHelperPaneInfo}
                    paramInfo={paramInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('params', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
        </HelperPane>
    );
};

export const getHelperPane = (
    exprRef: React.RefObject<FormExpressionEditorRef>,
    isLoadingHelperPaneInfo: boolean,
    payloadInfo: HelperPaneCompletionItem[],
    variableInfo: HelperPaneCompletionItem[],
    attributesInfo: HelperPaneCompletionItem[],
    functionInfo: HelperPaneFunctionInfo,
    configInfo: HelperPaneCompletionItem[],
    headerInfo: HelperPaneCompletionItem[],
    paramInfo: HelperPaneCompletionItem[],
    onClose: () => void,
    setFilterText: (type: string, filterText: string) => void,
    currentValue: string,
    onChange: (value: string, updatedCursorPosition: number) => void
) => {
    return (
        <HelperPaneEl
            exprRef={exprRef}
            isLoadingHelperPaneInfo={isLoadingHelperPaneInfo}
            payloadInfo={payloadInfo}
            variableInfo={variableInfo}
            attributesInfo={attributesInfo}
            functionInfo={functionInfo}
            configInfo={configInfo}
            headerInfo={headerInfo}
            paramInfo={paramInfo}
            onClose={onClose}
            setFilterText={setFilterText}
            currentValue={currentValue}
            onChange={onChange}
        />
    );
};
