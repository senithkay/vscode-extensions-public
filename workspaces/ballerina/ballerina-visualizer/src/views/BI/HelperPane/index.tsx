/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RefObject, useState } from 'react';
import { FormExpressionEditorRef, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { CategoryPage } from './CategoryPage';
import { ConfigurablePage } from './ConfigurablePage';
import { FunctionsPage } from './FunctionsPage';
import { VariablesPage } from './VariablesPage';
import { LineRange } from '@wso2-enterprise/ballerina-core';

export type HelperPaneProps = {
    fileName: string;
    targetLineRange: LineRange;
    exprRef: RefObject<FormExpressionEditorRef>;
    onClose: () => void;
    currentValue: string;
    onChange: (value: string, updatedCursorPosition: number) => void;
};

export const HELPER_PANE_PAGE = {
    CATEGORY: "CATEGORY",
    VARIABLES: "VARIABLES",
    FUNCTIONS: "FUNCTIONS",
    CONFIGURABLE: "CONFIGURABLE"
} as const;

export type HelperPanePageType = typeof HELPER_PANE_PAGE[keyof typeof HELPER_PANE_PAGE];

const HelperPaneEl = ({
    fileName,
    targetLineRange,
    exprRef,
    onClose,
    currentValue,
    onChange
}: HelperPaneProps) => {
    const [currentPage, setCurrentPage] = useState<HelperPanePageType>(HELPER_PANE_PAGE.CATEGORY);

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
        <HelperPane>
            {currentPage === HELPER_PANE_PAGE.CATEGORY && (
                <CategoryPage setCurrentPage={setCurrentPage} onClose={onClose} />
            )}
            {currentPage === HELPER_PANE_PAGE.VARIABLES && (
                <VariablesPage
                    fileName={fileName}
                    targetLineRange={targetLineRange}
                    setCurrentPage={setCurrentPage}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )}
            {currentPage === HELPER_PANE_PAGE.FUNCTIONS && (
                <FunctionsPage
                    fileName={fileName}
                    targetLineRange={targetLineRange}
                    setCurrentPage={setCurrentPage}
                    onClose={onClose}
                    onChange={handleChange}
                    />
                )}
            {currentPage === HELPER_PANE_PAGE.CONFIGURABLE && (
                <ConfigurablePage
                    fileName={fileName}
                    targetLineRange={targetLineRange}
                    setCurrentPage={setCurrentPage}
                    onClose={onClose}
                    onChange={handleChange}
                />
            )} 
        </HelperPane>
    );
};

/**
 * Function to render the helper pane for the expression editor
 * 
 * @param fileName File name of the expression editor
 * @param targetLineRange Modified line range of the expression editor
 * @param exprRef Ref object of the expression editor
 * @param onClose Function to close the helper pane
 * @param currentValue Current value of the expression editor
 * @param onChange Function to handle changes in the expression editor
 * @returns JSX.Element Helper pane element
 */
export const getHelperPane = (props: HelperPaneProps) => {
    const { fileName, targetLineRange, exprRef, onClose, currentValue, onChange } = props;

    return (
        <HelperPaneEl
            fileName={fileName}
            targetLineRange={targetLineRange}
            exprRef={exprRef}
            onClose={onClose}
            currentValue={currentValue}
            onChange={onChange}
        />
    );
};
