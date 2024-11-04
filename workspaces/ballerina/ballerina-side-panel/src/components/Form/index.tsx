/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Button,
    Codicon,
    CompletionItem,
    ExpressionBarRef,
    LinkButton,
    SidePanelBody,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

import { ExpressionFormField, FormField, FormValues } from "./types";
import { EditorFactory } from "../editors/EditorFactory";
import { Colors } from "../../resources/constants";
import { getValueForDropdown, isDropdownField } from "../editors/utils";
import { LineRange, NodeKind, NodePosition, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";
import { Provider } from "../../context";
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
    targetLineRange?: LineRange; // TODO: make them required after connector wizard is fixed
    fileName?: string; // TODO: make them required after connector wizard is fixed
    projectPath?: string;
    selectedNode?: NodeKind;
    onSubmit?: (data: FormValues) => void;
    openRecordEditor?: (isOpen: boolean, fields: FormValues) => void;
    openView?: (filePath: string, position: NodePosition) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    isActiveSubPanel?: boolean;
    onCancelForm?: () => void;
    oneTimeForm?: boolean;
    expressionEditor?: {
        completions: CompletionItem[];
        triggerCharacters?: readonly string[];
        retrieveCompletions?: (
            value: string,
            offset: number,
            triggerCharacter?: string,
            onlyVariables?: boolean
        ) => Promise<void>;
        retrieveVisibleTypes?: (value: string, cursorPosition: number) => Promise<void>;
        extractArgsFromFunction?: (value: string, cursorPosition: number) => Promise<{
            label: string;
            args: string[];
            currentArgIndex: number;
        }>;
        onCompletionSelect?: (value: string) => Promise<void>;
        onFocus?: () => void | Promise<void>;
        onBlur?: () => void | Promise<void>;
        onCancel: () => void;
    };
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
}

export function Form(props: FormProps) {
    const {
        formFields,
        projectPath,
        selectedNode,
        onSubmit,
        onCancelForm,
        oneTimeForm,
        openRecordEditor,
        openView,
        openSubPanel,
        isActiveSubPanel,
        expressionEditor,
        targetLineRange,
        fileName,
        updatedExpressionField,
        resetUpdatedExpressionField
    } = props;
    const { control, getValues, register, unregister, handleSubmit, reset, watch, setValue } = useForm<FormValues>();

    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [activeFormField, setActiveFormField] = useState<string | undefined>(undefined);

    const exprRef = useRef<ExpressionBarRef>(null);

    useEffect(() => {
        // Check if the form is a onetime usage or not. This is checked due to reset issue with nested forms in param manager
        if (!oneTimeForm) {
            // Reset form with new values when formFields change
            const defaultValues: FormValues = {};
            formFields.forEach((field) => {
                if (isDropdownField(field)) {
                    defaultValues[field.key] = getValueForDropdown(field) ?? "";
                } else if (typeof field.value === 'string') {
                    defaultValues[field.key] = formatJSONLikeString(field.value) ?? "";
                } else {
                    defaultValues[field.key] = field.value ?? "";
                }
            });
            reset(defaultValues);
        }
    }, [formFields, reset]);

    useEffect(() => {
        if (updatedExpressionField) {
            const currentValue = getValues(updatedExpressionField.key);

            if (currentValue !== undefined) {
                let newValue;
                if (updatedExpressionField?.isConfigured) {
                    newValue = updatedExpressionField.value;
                } else {
                    const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart ?? currentValue.length;
                    newValue = currentValue.slice(0, cursorPosition) +
                        updatedExpressionField.value +
                        currentValue.slice(cursorPosition);
                }

                setValue(updatedExpressionField.key, newValue);
                resetUpdatedExpressionField && resetUpdatedExpressionField();
            }
        }
    }, [updatedExpressionField]);

    console.log(">>> form fields", { formFields, values: getValues() });

    const handleOnSave = (data: FormValues) => {
        console.log(">>> form values", data);
        onSubmit && onSubmit(data);
    };

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

    // has advance fields
    const hasAdvanceFields = formFields.some((field) => field.advanced);

    const isDataMapper = selectedNode && selectedNode === "DATA_MAPPER";
    const isExistingDataMapper =
        isDataMapper && !!(formFields.find((field) => field.key === "view")?.value as any)?.fileName;
    const isNewDataMapper = isDataMapper && !isExistingDataMapper;

    const variableField = formFields.find((field) => field.key === "variable");
    const typeField = formFields.find((field) => field.key === "type");
    const dataMapperField = formFields.find((field) => field.label.includes("Data mapper"));
    const prioritizeVariableField = (variableField || typeField) && !dataMapperField;

    const contextValue = {
        form: {
            control,
            setValue,
            watch,
            register,
            unregister
        },
        expressionEditor,
        targetLineRange,
        fileName
    };

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
                            />
                        }
                        {typeField && (
                            <EditorFactory
                                field={typeField}
                                openRecordEditor={handleOpenRecordEditor}
                                openSubPanel={openSubPanel}
                                handleOnFieldFocus={handleOnFieldFocus}
                            />
                        )}
                    </S.CategoryRow>
                )}
                <S.CategoryRow showBorder={false}>
                    {formFields
                        .filter((field) => field.type !== "VIEW")
                        .map((field) => {
                            if (
                                ((field.key === "variable" || field.key === "type") && prioritizeVariableField) ||
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
                                        openRecordEditor={handleOpenRecordEditor}
                                        openSubPanel={openSubPanel}
                                        isActiveSubPanel={isActiveSubPanel}
                                        handleOnFieldFocus={handleOnFieldFocus}
                                    />
                                </S.Row>
                            );
                        })}
                    {isExistingDataMapper && (
                        <S.DataMapperRow>
                            <S.UseDataMapperButton
                                appearance="secondary"
                                onClick={handleSubmit((data) => handleOnSave({...data, isDataMapperFormUpdate: true}))}
                            >
                                Use Data Mapper
                            </S.UseDataMapperButton>
                        </S.DataMapperRow>
                    )}
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
                                            openRecordEditor={handleOpenRecordEditor}
                                            openSubPanel={openSubPanel}
                                            isActiveSubPanel={isActiveSubPanel}
                                            handleOnFieldFocus={handleOnFieldFocus}
                                        />
                                    </S.Row>
                                );
                            }
                        })}
                </S.CategoryRow>
                {onSubmit && (
                    <S.Footer>
                        {onCancelForm && <Button appearance="secondary" onClick={onCancelForm}>  Cancel </Button>}
                        {isNewDataMapper ? (
                            <S.PrimaryButton
                                onClick={handleSubmit((data) => handleOnSave({...data, isDataMapperFormUpdate: true}))}
                            >
                                Create Mapping
                            </S.PrimaryButton>
                        ) : (
                            <S.PrimaryButton onClick={handleSubmit(handleOnSave)}>
                                Save
                            </S.PrimaryButton>
                        )}
                    </S.Footer>
                )}
            </S.Container>
        </Provider>
    );
}

export default Form;
