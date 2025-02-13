/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useMemo, useEffect, useImperativeHandle, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
    Button,
    Codicon,
    FormExpressionEditorRef,
    LinkButton,
    SidePanelBody,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

import { ExpressionFormField, FormExpressionEditorProps, FormField, FormValues } from "./types";
import { EditorFactory } from "../editors/EditorFactory";
import { Colors } from "../../resources/constants";
import { getValueForDropdown, isDropdownField } from "../editors/utils";
import { Diagnostic, LineRange, NodeKind, NodePosition, SubPanel, SubPanelView, FormDiagnostics, FlowNode, LinePosition } from "@wso2-enterprise/ballerina-core";
import { FormContext, Provider } from "../../context";
import { formatJSONLikeString } from "./utils";

namespace S {
    export const Container = styled(SidePanelBody)`
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    export const Row = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const CategoryRow = styled.div<{ showBorder?: boolean }>`
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
        margin-top: 8px;
        padding-bottom: 14px;
        border-bottom: ${({ showBorder }) => (showBorder ? `1px solid ${Colors.OUTLINE_VARIANT}` : "none")};
    `;

    export const CheckboxRow = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        width: 100%;
    `;

    export const Footer = styled.div<{}>`
        display: flex;
        gap: 8px;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin-top: 8px;
        width: 100%;
    `;

    export const TitleContainer = styled.div<{}>`
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        margin-bottom: 8px;
    `;

    export const Title = styled.div<{}>`
        font-size: 14px;
        font-family: GilmerBold;
        text-wrap: nowrap;
        &:first {
            margin-top: 0;
        }
    `;

    export const PrimaryButton = styled(Button)`
        appearance: "primary";
    `;

    export const BodyText = styled.div<{}>`
        font-size: 11px;
        opacity: 0.5;
    `;

    export const DrawerContainer = styled.div<{}>`
        width: 400px;
    `;

    export const ButtonContainer = styled.div<{}>`
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        justify-content: flex-end;
    `;

    export const DataMapperRow = styled.div`
        display: flex;
        justify-content: center;
        width: 100%;
        margin: 10px 0;
    `;

    export type EditorContainerStyleProp = {
        color: string;
    };
    export const EditorContainer = styled.div<EditorContainerStyleProp>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 8px;
        border-radius: 4px;
        /* border: 1px solid ${(props: EditorContainerStyleProp) => props.color}; */
        position: relative;
        z-index: 1;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${(props: EditorContainerStyleProp) => props.color};
            opacity: 0.1;
            z-index: -1;
            border-radius: inherit;
        }
    `;

    export const UseDataMapperButton = styled(Button)`
        & > vscode-button {
            width: 250px;
            height: 30px;
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-welcomePage-tileBorder);
        }
        align-self: center;
    `;
}
export interface FormProps {
    formFields: FormField[];
    submitText?: string;
    targetLineRange?: LineRange; // TODO: make them required after connector wizard is fixed
    fileName?: string; // TODO: make them required after connector wizard is fixed
    projectPath?: string;
    selectedNode?: NodeKind;
    onSubmit?: (data: FormValues) => void;
    openRecordEditor?: (isOpen: boolean, fields: FormValues) => void;
    openView?: (filePath: string, position: NodePosition) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    subPanelView?: SubPanelView;
    onCancelForm?: () => void;
    oneTimeForm?: boolean;
    expressionEditor?: FormExpressionEditorProps;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    mergeFormDataWithFlowNode?: (data: FormValues, targetLineRange: LineRange) => FlowNode;
    handleVisualizableFields?: (filePath: string, flowNode: FlowNode, position: LinePosition) => void;
    visualizableFields?: string[];
}

export const Form = forwardRef((props: FormProps, ref) => {
    const {
        formFields,
        projectPath,
        selectedNode,
        submitText,
        onSubmit,
        onCancelForm,
        oneTimeForm,
        openRecordEditor,
        openView,
        openSubPanel,
        subPanelView,
        expressionEditor,
        targetLineRange,
        fileName,
        updatedExpressionField,
        resetUpdatedExpressionField,
        mergeFormDataWithFlowNode,
        handleVisualizableFields,
        visualizableFields
    } = props;

    const {
        control,
        getValues,
        register,
        unregister,
        handleSubmit,
        reset,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { isValidating, errors, isDirty }
    } = useForm<FormValues>();

    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [activeFormField, setActiveFormField] = useState<string | undefined>(undefined);
    const [diagnosticsInfo, setDiagnosticsInfo] = useState<FormDiagnostics[] | undefined>(undefined);

    const exprRef = useRef<FormExpressionEditorRef>(null);

    useEffect(() => {
        // Check if the form is a onetime usage or not. This is checked due to reset issue with nested forms in param manager
        if (!oneTimeForm) {
            // Reset form with new values when formFields change
            const defaultValues: FormValues = {};
            const diagnosticsMap: FormDiagnostics[] = [];
            formFields.forEach((field) => {
                if (isDropdownField(field)) {
                    defaultValues[field.key] = getValueForDropdown(field) ?? "";
                } else if (typeof field.value === 'string') {
                    defaultValues[field.key] = formatJSONLikeString(field.value) ?? "";
                } else {
                    defaultValues[field.key] = field.value ?? "";
                }

                diagnosticsMap.push({ key: field.key, diagnostics: [] });
            });
            setDiagnosticsInfo(diagnosticsMap);
            reset(defaultValues);
        }
    }, [formFields, reset]);

    useEffect(() => {
        if (updatedExpressionField) {
            if (subPanelView === SubPanelView.INLINE_DATA_MAPPER) {
                const { key, value } = updatedExpressionField;
                // Update the form field value
                setValue(key, value);
                resetUpdatedExpressionField && resetUpdatedExpressionField();
                // Update the inline data mapper view
                handleOpenSubPanel({
                    view: SubPanelView.INLINE_DATA_MAPPER,
                    props: {
                        inlineDataMapper: {
                            filePath: fileName,
                            flowNode: undefined,
                            position: {
                                line: updatedExpressionField.cursorPosition.line,
                                offset: updatedExpressionField.cursorPosition.offset,
                            },
                            propertyKey: updatedExpressionField.key,
                            editorKey: updatedExpressionField.key
                        }
                    }
                });
            }
        }
    }, [updatedExpressionField]);

    console.log(">>> form fields", { formFields, values: getValues() });

    const handleOnSave = (data: FormValues) => {
        console.log(">>> saved form fields", { data });
        onSubmit && onSubmit(data);
    };

    // Expose a method to trigger the save
    useImperativeHandle(ref, () => ({
        triggerSave: () => handleSubmit(handleOnSave)(), // Call handleSubmit with the save function
    }));

    const handleOpenRecordEditor = (open: boolean) => {
        openRecordEditor?.(open, getValues());
    };

    const handleOnShowAdvancedOptions = () => {
        setShowAdvancedOptions(true);
    };

    const handleOnHideAdvancedOptions = () => {
        setShowAdvancedOptions(false);
    };

    const handleOnFieldFocus = (key: string) => {
        const isActiveSubPanel = subPanelView !== SubPanelView.UNDEFINED;

        if (isActiveSubPanel && activeFormField !== key) {
            openSubPanel && openSubPanel({ view: SubPanelView.UNDEFINED });
        }
        setActiveFormField(key);
    }

    const handleOnUseDataMapper = () => {
        const viewField = formFields.find((field) => field.key === "view");
        if (viewField) {
            const { fileName, startLine, endLine } = viewField.value as any;
            openView &&
                openView(projectPath + "/" + fileName, {
                    startLine: startLine.line,
                    startColumn: startLine.offset,
                    endLine: endLine.line,
                    endColumn: endLine.offset,
                });
        }
    };

    const handleSetDiagnosticsInfo = (diagnostics: FormDiagnostics) => {
        const otherDiagnostics = diagnosticsInfo?.filter((item) => item.key !== diagnostics.key) || [];
        setDiagnosticsInfo([...otherDiagnostics, diagnostics]);
    }

    const handleOpenSubPanel = (subPanel: SubPanel) => {
        let updatedSubPanel = subPanel;
        if (subPanel.view === SubPanelView.INLINE_DATA_MAPPER) {
            const flowNode = mergeFormDataWithFlowNode(getValues(), targetLineRange);
            const inlineDMProps = {
                ...subPanel.props.inlineDataMapper,
                flowNode: flowNode,
            };
            updatedSubPanel = {
                ...subPanel,
                props: {
                    ...subPanel.props,
                    inlineDataMapper: inlineDMProps,
                },
            };
        }
        openSubPanel(updatedSubPanel);
    };

    const handleOnTypeChange = () => {
        if (mergeFormDataWithFlowNode) {
            getVisualiableFields();
        }
    };

    const getVisualiableFields = () => {
        const flowNode = mergeFormDataWithFlowNode(getValues(), targetLineRange);
        handleVisualizableFields && handleVisualizableFields(fileName, flowNode, targetLineRange.startLine);
    };

    const handleGetExpressionDiagnostics = async (
        showDiagnostics: boolean,
        expression: string,
        key: string,
    ) => {
        // HACK: For variable nodes, update the type value in the node
        const isVariableNode = selectedNode === "VARIABLE";
        if(expressionEditor?.getExpressionFormDiagnostics) {
            await expressionEditor?.getExpressionFormDiagnostics(
                showDiagnostics,
                expression,
                key,
                handleSetDiagnosticsInfo,
                isVariableNode,
                watch("type")
            );
        }
    }

    // has advance fields
    const hasAdvanceFields = formFields.some((field) => field.advanced);
    const variableField = formFields.find((field) => field.key === "variable");
    const typeField = formFields.find((field) => field.key === "type");
    const dataMapperField = formFields.find((field) => field.label.includes("Data mapper"));
    const prioritizeVariableField = (variableField || typeField) && !dataMapperField;

    const contextValue: FormContext = {
        form: {
            control,
            setValue,
            watch,
            register,
            unregister,
            setError,
            clearErrors,
            formState: { isValidating, errors }
        },
        expressionEditor: {
            ...expressionEditor,
            getExpressionEditorDiagnostics: handleGetExpressionDiagnostics
        },
        targetLineRange,
        fileName
    };

    // Find the first editable field
    const firstEditableFieldIndex = formFields.findIndex(field => field.editable !== false);

    const isValid = useMemo(() => {
        if (!diagnosticsInfo) {
            return true;
        }

        let hasDiagnostics: boolean = true;
        for (const diagnosticsInfoItem of diagnosticsInfo) {
            const key = diagnosticsInfoItem.key;
            if (!key) {
                continue;
            }

            const diagnostics: Diagnostic[] = diagnosticsInfoItem.diagnostics || [];
            if (diagnostics.length === 0) {
                clearErrors(key);
                continue;
            } else {
                const diagnosticsMessage = diagnostics.map(d => d.message).join('\n');
                setError(key, { type: "validate", message: diagnosticsMessage });

                // If the severity is not ERROR, don't invalidate
                const hasErrorDiagnostics = diagnostics.some(d => d.severity === 1);
                if (hasErrorDiagnostics) {
                    hasDiagnostics = false;
                } else {
                    continue;
                }
            }
        }

        return hasDiagnostics;
    }, [diagnosticsInfo])

    const disableSaveButton = !isValid || isValidating;

    // TODO: support multiple type fields
    return (
        <Provider {...contextValue}>
            <S.Container>
                {prioritizeVariableField && variableField && (
                    <S.CategoryRow showBorder={true}>
                        {variableField &&
                            <EditorFactory
                                field={variableField}
                                handleOnFieldFocus={handleOnFieldFocus}
                                autoFocus={firstEditableFieldIndex === formFields.indexOf(variableField)}
                                visualizableFields={visualizableFields}
                            />
                        }
                        {typeField && (
                            <EditorFactory
                                field={typeField}
                                openRecordEditor={openRecordEditor && handleOpenRecordEditor}
                                openSubPanel={handleOpenSubPanel}
                                handleOnFieldFocus={handleOnFieldFocus}
                                handleOnTypeChange={handleOnTypeChange}
                                visualizableFields={visualizableFields}
                            />
                        )}
                    </S.CategoryRow>
                )}
                <S.CategoryRow showBorder={false}>
                    {formFields.sort((a, b) => b.groupNo - a.groupNo)
                        .filter((field) => field.type !== "VIEW")
                        .map((field) => {
                            if (
                                ((field.key === "variable" || field.key === "type") && (prioritizeVariableField && variableField)) ||
                                field.advanced
                            ) {
                                return;
                            }
                            return (
                                <S.Row key={field.key}>
                                    <EditorFactory
                                        ref={exprRef}
                                        field={field}
                                        selectedNode={selectedNode}
                                        openRecordEditor={openRecordEditor && handleOpenRecordEditor}
                                        openSubPanel={handleOpenSubPanel}
                                        subPanelView={subPanelView}
                                        handleOnFieldFocus={handleOnFieldFocus}
                                        autoFocus={firstEditableFieldIndex === formFields.indexOf(field)}
                                        visualizableFields={visualizableFields}
                                    />
                                </S.Row>
                            );
                        })
                    }
                    {hasAdvanceFields && (
                        <S.Row>
                            Advance Parameters
                            <S.ButtonContainer>
                                {!showAdvancedOptions && (
                                    <LinkButton
                                        onClick={handleOnShowAdvancedOptions}
                                        sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}
                                    >
                                        <Codicon name={"chevron-down"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                                        Expand
                                    </LinkButton>
                                )}
                                {showAdvancedOptions && (
                                    <LinkButton
                                        onClick={handleOnHideAdvancedOptions}
                                        sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}
                                    >
                                        <Codicon name={"chevron-up"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                                        Collapsed
                                    </LinkButton>
                                )}
                            </S.ButtonContainer>
                        </S.Row>
                    )}
                    {hasAdvanceFields &&
                        showAdvancedOptions &&
                        formFields.map((field) => {
                            if (field.advanced) {
                                return (
                                    <S.Row key={field.key}>
                                        <EditorFactory
                                            ref={exprRef}
                                            field={field}
                                            openRecordEditor={openRecordEditor && handleOpenRecordEditor}
                                            openSubPanel={handleOpenSubPanel}
                                            subPanelView={subPanelView}
                                            handleOnFieldFocus={handleOnFieldFocus}
                                            visualizableFields={visualizableFields}
                                        />
                                    </S.Row>
                                );
                            }
                        })}
                </S.CategoryRow>
                {onSubmit && (
                    <S.Footer>
                        {onCancelForm && <Button appearance="secondary" onClick={onCancelForm}>  Cancel </Button>}
                        <S.PrimaryButton onClick={handleSubmit(handleOnSave)} disabled={disableSaveButton}>
                            {submitText || "Save"}
                        </S.PrimaryButton>
                    </S.Footer>
                )}
            </S.Container>
        </Provider>
    );
});

export default Form;
