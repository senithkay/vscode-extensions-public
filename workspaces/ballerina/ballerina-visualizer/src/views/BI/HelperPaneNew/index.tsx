/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RefObject, useState } from 'react';
import { Codicon, FormExpressionEditorRef, HelperPane, HelperPaneCustom, HelperPaneHeight } from '@wso2-enterprise/ui-toolkit';
// import { ConfigurablePage } from './ConfigurablePage';
// import { FunctionsPage } from './FunctionsPage';
// import { SuggestionsPage } from './SuggestionsPage';
// import { ConfigureRecordPage } from './ConfigureRecordPage';
import { LineRange } from '@wso2-enterprise/ballerina-core';
import { RecordTypeField } from '@wso2-enterprise/ballerina-core';
import { SuggestionsPage } from '../HelperPane/SuggestionsPage';
import styled from '@emotion/styled';
import { HelperBackground } from './styles/Backgrounds';
import { ExpandableList } from './Components/ExpandableList';
import { transform } from 'lodash';

export type HelperPaneNewProps = {
    fieldKey: string;
    fileName: string;
    targetLineRange: LineRange;
    exprRef: RefObject<FormExpressionEditorRef>;
    anchorRef: RefObject<HTMLDivElement>;
    onClose: () => void;
    defaultValue: string;
    currentValue: string;
    onChange: (value: string, updatedCursorPosition: number) => void;
    helperPaneHeight: HelperPaneHeight;
    recordTypeField?: RecordTypeField;
    updateImports: (key: string, imports: {[key: string]: string}) => void;
    isAssignIdentifier?: boolean;
};

const HelperPaneNewEl = ({
    fieldKey,
    fileName,
    targetLineRange,
    exprRef,
    anchorRef,
    onClose,
    defaultValue,
    currentValue,
    onChange,
    helperPaneHeight,
    recordTypeField,
    updateImports,
    isAssignIdentifier
}: HelperPaneNewProps) => {
    const handleChange = (value: string, isRecordConfigureChange?: boolean) => {
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        const updatedCursorPosition = cursorPosition + value.length;
        let updatedValue = value;

        if (!isRecordConfigureChange) {
            updatedValue = currentValue.slice(0, cursorPosition) + value + currentValue.slice(cursorPosition);
        }

        // Update the value in the expression editor
        onChange(updatedValue, updatedCursorPosition);
        // Focus the expression editor
        exprRef.current?.focus();
        // Set the cursor
        exprRef.current?.setCursor(updatedValue, updatedCursorPosition);
        if (!isRecordConfigureChange) {
            // Close the helper pane
            onClose();
        }
    };
    const [currentPage, setCurrentPage] = useState(0);

    const next = () => {
        setCurrentPage(currentPage+1);
    };

    const prev = () => {
        setCurrentPage(currentPage-1);
    };

    return (
        <HelperPaneCustom sx={{ width: 300, padding: '10px 2px', height: '220px' }}>
            <SlidingWindow>
                <SlidingPane index={0} currentPage={currentPage}>
                    <HelperPane.Body>
                        <ExpandableList />
                    </HelperPane.Body>
                    <HelperPane.Footer>
                    <CopilotFooter >
                            <Codicon name="add"/> <span>Generate with BI Copilot</span>
                            <button onClick={next}>adwd</button>
                    </CopilotFooter>
                    </HelperPane.Footer>
                </SlidingPane>
                <SlidingPane index={1} currentPage={currentPage}>
                     <HelperPane.Body>
                        <button onClick={prev}>adwd</button>
                    </HelperPane.Body>
                    <HelperPane.Footer>
                    <CopilotFooter >
                            <Codicon name="add"/> <span>Generate with BI Copilot</span>
                    </CopilotFooter>
                    </HelperPane.Footer>
                </SlidingPane>
            </SlidingWindow>
        </HelperPaneCustom>
    );
};

const SlidingWindow = styled.div`
    display: flex;
    overflow-x: hidden;
    position: relative;
    width: 100%;
    height: 100%;
`;


const SlidingPane = styled.div<{ index: number, currentPage: number }>`
  position: absolute;
  width: 300px;
  height: 100%;
  transition: transform 0.3s ease-in-out;
  transform: ${({ index, currentPage }: { index: number, currentPage:number }) => `translateX(${(currentPage-index)*100})%`};
`;

const CopilotFooter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
`;

/**
 * Function to render the helper pane for the expression editor
 * 
 * @param fieldKey Key of the field
 * @param fileName File name of the expression editor
 * @param targetLineRange Modified line range of the expression editor
 * @param exprRef Ref object of the expression editor
 * @param anchorRef Ref object of the library browser
 * @param onClose Function to close the helper pane
 * @param defaultValue Default value for the expression editor
 * @param currentValue Current value of the expression editor
 * @param onChange Function to handle changes in the expression editor
 * @param helperPaneHeight Height of the helper pane
 * @param recordTypeField Record type field
 * @param updateImports Function to update the import statements of the expression editor
 * @param isAssignIdentifier Boolean indicating whether the expression is an assignment LV_EXPRESSION
 * @returns JSX.Element Helper pane element
 */
export const getHelperPaneNew = (props: HelperPaneNewProps) => {
    const {
        fieldKey,
        fileName,
        targetLineRange,
        exprRef,
        anchorRef,
        onClose,
        defaultValue,
        currentValue,
        onChange,
        helperPaneHeight,
        recordTypeField,
        updateImports,
        isAssignIdentifier
    } = props;

    return (
        <HelperPaneNewEl
            fieldKey={fieldKey}
            fileName={fileName}
            targetLineRange={targetLineRange}
            exprRef={exprRef}
            anchorRef={anchorRef}
            onClose={onClose}
            defaultValue={defaultValue}
            currentValue={currentValue}
            onChange={onChange}
            helperPaneHeight={helperPaneHeight}
            recordTypeField={recordTypeField}
            updateImports={updateImports}
            isAssignIdentifier={isAssignIdentifier}
        />
    );
};
