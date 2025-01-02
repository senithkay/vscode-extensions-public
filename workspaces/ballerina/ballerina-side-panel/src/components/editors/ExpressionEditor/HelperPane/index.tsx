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
import { CategoryPage } from './CategoryPage';
import { ConfigurablePage } from './ConfigurablePage';
import { FunctionsPage } from './FunctionsPage';
import { LibraryBrowser } from './LibraryBrowser';
import { VariablesPage } from './VariablesPage';
import { HelperPaneFunctionInfo } from '../../../Form/types';
import { HelperPaneVariableInfo } from '../../../Form/types';
import { HelperPaneData } from '../../../Form/types';

export type HelperPaneProps = {
    exprRef: React.RefObject<FormExpressionEditorRef>;
    isLoadingHelperPaneInfo: boolean;
    variableInfo: HelperPaneData;
    configVariableInfo: HelperPaneData;
    functionInfo: HelperPaneData;
    libraryBrowserInfo: HelperPaneData;
    onClose: () => void;
    setFilterText: (type: string, filterText: string) => void;
    currentValue: string;
    onChange: (value: string, updatedCursorPosition: number) => void;
    onSave: (values: any) => void;
};

const HelperPaneEl = ({
    exprRef,
    isLoadingHelperPaneInfo,
    variableInfo,
    configVariableInfo,
    functionInfo,
    libraryBrowserInfo,
    onClose,
    setFilterText,
    currentValue,
    onChange,
    onSave,
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

    function addConfigVariables(values: any): Promise<void> {
        return new Promise((resolve) => {
            onSave(values);
            resolve();
        });
    }

    return (
        <HelperPane>
            {currentPage === 0 && <CategoryPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 1 && (
                <VariablesPage
                    isLoading={isLoadingHelperPaneInfo}
                    variableInfo={variableInfo as HelperPaneVariableInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('variables', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 2 && (
                <FunctionsPage
                    isLoading={isLoadingHelperPaneInfo}
                    functionInfo={functionInfo as HelperPaneFunctionInfo}
                    libraryBrowserInfo={libraryBrowserInfo as HelperPaneFunctionInfo}
                    setCurrentPage={setCurrentPage}
                    setFunctionFilterText={(filterText) => setFilterText('functions', filterText)}
                    setLibraryFilterText={(filterText) => setFilterText('libraries', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === 3 && (
                <ConfigurablePage
                    isLoading={isLoadingHelperPaneInfo}
                    variableInfo={configVariableInfo as HelperPaneVariableInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('configurable', filterText)}
                    onClose={onClose}
                    onChange={handleChange}
                    onSave={addConfigVariables}
                />
            )} 
        </HelperPane>
    );
};

export const getHelperPane = (
    exprRef: React.RefObject<FormExpressionEditorRef>,
    isLoadingHelperPaneInfo: boolean,
    variableInfo: HelperPaneData,
    configVariableInfo: HelperPaneData,
    functionInfo: HelperPaneData,
    libraryBrowserInfo: HelperPaneData,
    onClose: () => void,
    setFilterText: (type: string, filterText: string) => void,
    currentValue: string,
    onChange: (value: string, updatedCursorPosition: number) => void,
    onSave: (values: any) => void
) => {
    
    function saveConfigVariables(values: any): void {
        onSave(values);
    }

    return (
        <HelperPaneEl
            exprRef={exprRef}
            isLoadingHelperPaneInfo={isLoadingHelperPaneInfo}
            variableInfo={variableInfo}
            configVariableInfo={configVariableInfo}
            libraryBrowserInfo={libraryBrowserInfo}
            functionInfo={functionInfo}
            onClose={onClose}
            setFilterText={setFilterText}
            currentValue={currentValue}
            onChange={onChange}
            onSave={saveConfigVariables}
        />
    );
};
