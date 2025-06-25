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
import { LineRange } from '@wso2-enterprise/ballerina-core';
import { RecordTypeField } from '@wso2-enterprise/ballerina-core';
import { ExpandableList } from './Components/ExpandableList';
import { CopilotFooter, PevButton, SlidingPane, SlidingPaneBackButton, SlidingPaneHeader, SlidingPaneNavContainer, SlidingWindow } from '@wso2-enterprise/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane';
import { Variables } from './Views/Variables';

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
        <HelperPaneCustom >
            <HelperPaneCustom.Body >
                <SlidingWindow>
                    <SlidingPane paneHeight='200px' name="PAGE1">
                        <ExpandableList>
                            <SlidingPaneNavContainer to="PAGE3">
                                <ExpandableList.Item>
                                    <Codicon name="bracket-dot" />
                                    <span>Construct Record</span>
                                </ExpandableList.Item>
                            </SlidingPaneNavContainer>
                            <SlidingPaneNavContainer to="PAGE2">
                                <ExpandableList.Item>
                                    <Codicon name="lightbulb" />
                                    <span>Suggestions</span>
                                </ExpandableList.Item>
                            </SlidingPaneNavContainer>
                            <SlidingPaneNavContainer to="PAGE_FUNCTIONS">
                                <ExpandableList.Item>
                                    <Codicon name="variable-group" />
                                    <span>Functions</span>
                                </ExpandableList.Item>
                            </SlidingPaneNavContainer>
                            <SlidingPaneNavContainer to="PAGE_CONFIGURABLES">
                                <ExpandableList.Item>
                                    <Codicon name="settings" />
                                    <span>Configurables</span>
                                </ExpandableList.Item>
                            </SlidingPaneNavContainer>
                        </ExpandableList>
                        <SlidingPaneNavContainer to="PAGE2">
                            <CopilotFooter>
                                <Codicon name="add" /> <span>Generate with BI Copilot</span>
                            </CopilotFooter>
                        </SlidingPaneNavContainer>   
                    </SlidingPane>

                    {/* Variables Page */}
                    <SlidingPane name="PAGE2">
                        <SlidingPaneHeader> Variables</SlidingPaneHeader>
                        <Variables/>
                        <CopilotFooter >
                                <Codicon name="add"/> <span>Generate with BI Copilot</span>
                        </CopilotFooter>
                    </SlidingPane>
                        <SlidingPane name="PAGE3">
                                <SlidingPaneHeader> This is Page 3</SlidingPaneHeader>
                            Page3
                            <PevButton/>

                        <CopilotFooter >
                                <Codicon name="add"/> <span>Generate with BI Copilot</span>
                        </CopilotFooter>
                    </SlidingPane>
                </SlidingWindow>
            </HelperPaneCustom.Body>
        </HelperPaneCustom>
    );
};

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
