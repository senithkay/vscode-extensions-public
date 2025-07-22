/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RefObject, useLayoutEffect, useRef, useState } from 'react';

import { ExpandableList } from './Components/ExpandableList';
import { Variables } from './Views/Variables';
import { CompletionInsertText, ExpressionProperty, FlowNode, LineRange, RecordTypeField } from '@wso2/ballerina-core';
import { Codicon, CompletionItem, FormExpressionEditorRef, HelperPaneCustom, HelperPaneHeight, Modal } from '@wso2/ui-toolkit';
import { CopilotFooter, SlidingPane, SlidingPaneHeader, SlidingPaneNavContainer, SlidingWindow } from '@wso2/ui-toolkit/lib/components/ExpressionEditor/components/Common/SlidingPane';
import { CreateValue } from './Views/CreateValue';
import DynamicModal from './Components/Modal';
import FooterButtons from './Components/FooterButtons';
import { FunctionsPage } from './Views/Functions';
import { Divider } from '@wso2/ui-toolkit';
import { GenerateBICopilot } from './Views/GenerateBICopilot';
import { FormSubmitOptions } from '../FlowDiagram';
const getRecordType = (recordTypeField: RecordTypeField) => {
    return recordTypeField;
}

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
    updateImports: (key: string, imports: { [key: string]: string }) => void;
    isAssignIdentifier?: boolean;
    completions: CompletionItem[],
    projectPath?: string,
    handleOnFormSubmit?: (updatedNode?: FlowNode, isDataMapperFormUpdate?: boolean, options?: FormSubmitOptions) => void
    helperPaneZIndex?: number;
    selectedType?: CompletionItem;
    setTargetLineRange?: (targetLineRange: LineRange) => void;
    filteredCompletions?: CompletionItem[];
    variables:CompletionItem[]
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
    isAssignIdentifier,
    completions,
    projectPath,
    handleOnFormSubmit,
    helperPaneZIndex,
    selectedType,
    setTargetLineRange,
    filteredCompletions,
    variables
}: HelperPaneNewProps) => {
    const [position, setPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
    const paneRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useLayoutEffect(() => {
        if (anchorRef.current) {
            const host = anchorRef.current.shadowRoot?.host as HTMLElement | undefined;
            const target = host || (anchorRef.current as unknown as HTMLElement);
            if (target && target.getBoundingClientRect) {
                const rect = target.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                });
            }
        }
    }, [anchorRef]);

    const getInsertText = (insertText: string | CompletionInsertText): string => {
        if (typeof insertText === 'string') {
            return insertText;
        }
        return insertText.value;
    };

    const getCursorOffset = (insertText: string | CompletionInsertText): number => {
        if (typeof insertText === 'string') {
            return 0;
        }
        return insertText.cursorOffset ?? 0;
    };

    const handleChange = (insertText: string | CompletionInsertText, isRecordConfigureChange?: boolean) => {
        const value = getInsertText(insertText);
        const cursorOffset = getCursorOffset(insertText);
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        const updatedCursorPosition = cursorPosition + value.length + cursorOffset;
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

    return (
        <HelperPaneCustom sx={{zIndex: helperPaneZIndex}}>
            <HelperPaneCustom.Body >
                <SlidingWindow>
                    <SlidingPane name="PAGE1">
                        <ExpandableList sx={{paddingTop: '10px'}}>
                            {selectedType && (
                            <SlidingPaneNavContainer to="CREATE_VALUE" data={recordTypeField}>
                                <ExpandableList.Item>
                                    <Codicon name="new-file" />
                                    <span>Create Value</span>
                                </ExpandableList.Item>
                            </SlidingPaneNavContainer>
                            )}
                            <SlidingPaneNavContainer to="VARIABLES" data={recordTypeField}>
                                <ExpandableList.Item>
                                    <Codicon name="json" />
                                    <span>Variables</span>
                                </ExpandableList.Item>
                            </SlidingPaneNavContainer>
                            <SlidingPaneNavContainer to="FUNCTIONS">
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

                        <div style={{ marginTop: "auto", gap: '10px' }}>
                            <Divider />
                            <DynamicModal width={600} height={400} anchorRef={anchorRef} title="Build Expression with BI Copilot">
                            <DynamicModal.Trigger>
                                <FooterButtons 
                                sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }} 
                                startIcon='copilot' 
                                title="Generate with BI Copilot" />
                            </DynamicModal.Trigger>
                           <GenerateBICopilot />
                        </DynamicModal>

                        </div>
                    </SlidingPane>

                    {/* Variables Page */}
                    <SlidingPane name="VARIABLES">
                        <SlidingPaneHeader>
                            Variables
                        </SlidingPaneHeader>
                        <Variables
                            anchorRef={anchorRef}
                            fileName={fileName}
                            onChange={handleChange}
                            targetLineRange={targetLineRange}
                            projectPath={projectPath}
                            handleOnFormSubmit={handleOnFormSubmit}
                            selectedType={selectedType}
                            setTargetLineRange={setTargetLineRange}
                            filteredCompletions={filteredCompletions}
                            currentValue={currentValue}
                            variables={variables}
                        />
                    </SlidingPane>

                    <SlidingPane name="CREATE_VALUE" paneHeight='400px'>
                        <SlidingPaneHeader> Create Value</SlidingPaneHeader>
                        <CreateValue fileName={fileName} onChange={handleChange} currentValue={currentValue} selectedType={selectedType} />
                    </SlidingPane>

                    <SlidingPane name="FUNCTIONS" paneHeight='400px'>
                        <SlidingPaneHeader>
                            Functions
                        </SlidingPaneHeader>
                        <FunctionsPage
                            fieldKey={fieldKey}
                            anchorRef={anchorRef}
                            projectPath={projectPath}
                            fileName={fileName}
                            targetLineRange={targetLineRange}
                            onClose={onClose}
                            onChange={handleChange}
                            updateImports={updateImports} />
                    </SlidingPane>

                    <SlidingPane name="PAGE3">
                        <SlidingPaneHeader> This is Page 3</SlidingPaneHeader>
                        Page3
                        {/* <CopilotFooter >
                                <Codicon name="add"/> <span>Generate with BI Copilot</span>
                        </CopilotFooter> */}
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
 * @param projectPath Project path of the expression editor
 * @param handleOnFormSubmit Function to handle form submission
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
        isAssignIdentifier,
        completions,
        projectPath,
        handleOnFormSubmit,
        helperPaneZIndex,
        selectedType,
        setTargetLineRange,
        filteredCompletions,
        variables
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
            completions={completions}
            projectPath={projectPath}
            handleOnFormSubmit={handleOnFormSubmit}
            helperPaneZIndex={helperPaneZIndex}
            selectedType={selectedType}
            setTargetLineRange={setTargetLineRange}
            filteredCompletions={filteredCompletions}
            variables={variables}
        />
    );
};
