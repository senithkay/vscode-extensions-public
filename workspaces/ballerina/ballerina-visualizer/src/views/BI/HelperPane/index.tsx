/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RefObject } from 'react';
import { FormExpressionEditorRef, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { ConfigurablePage } from './ConfigurablePage';
import { FunctionsPage } from './FunctionsPage';
import { SuggestionsPage } from './SuggestionsPage';
import { LineRange } from '@wso2-enterprise/ballerina-core';

export type HelperPaneProps = {
    fileName: string;
    targetLineRange: LineRange;
    exprRef: RefObject<FormExpressionEditorRef>;
    onClose: () => void;
    defaultValue: string;
    currentValue: string;
    onChange: (value: string, updatedCursorPosition: number) => void;
};

const HelperPaneEl = ({
    fileName,
    targetLineRange,
    exprRef,
    onClose,
    defaultValue,
    currentValue,
    onChange
}: HelperPaneProps) => {
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
            <HelperPane.Header title="Expression Helper" titleSx={{ fontFamily: "GilmerRegular" }} onClose={onClose} />
            <HelperPane.Body>
            <HelperPane.Panels>
                {/* Tabs for the helper pane */}
                <HelperPane.PanelTab id={0} title="Suggestions" />
                <HelperPane.PanelTab id={1} title="Functions" />
                <HelperPane.PanelTab id={2} title="Configurables" />
                
                {/* Panels for the helper pane */}
                <HelperPane.PanelView id={0}>
                    <SuggestionsPage
                        fileName={fileName}
                        targetLineRange={targetLineRange}
                        defaultValue={defaultValue}
                        onChange={handleChange}
                    />
                </HelperPane.PanelView>
                <HelperPane.PanelView id={1}>
                    <FunctionsPage
                        fileName={fileName}
                        targetLineRange={targetLineRange}
                        onClose={onClose}
                        onChange={handleChange}
                    />
                </HelperPane.PanelView>
                <HelperPane.PanelView id={2}>
                    <ConfigurablePage
                        fileName={fileName}
                        targetLineRange={targetLineRange}
                        onChange={handleChange}
                    />
                </HelperPane.PanelView>
            </HelperPane.Panels>
            </HelperPane.Body>
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
 * @param defaultValue Default value for the expression editor
 * @param currentValue Current value of the expression editor
 * @param onChange Function to handle changes in the expression editor
 * @returns JSX.Element Helper pane element
 */
export const getHelperPane = (props: HelperPaneProps) => {
    const { fileName, targetLineRange, exprRef, onClose, defaultValue, currentValue, onChange } = props;

    return (
        <HelperPaneEl
            fileName={fileName}
            targetLineRange={targetLineRange}
            exprRef={exprRef}
            onClose={onClose}
            defaultValue={defaultValue}
            currentValue={currentValue}
            onChange={onChange}
        />
    );
};
