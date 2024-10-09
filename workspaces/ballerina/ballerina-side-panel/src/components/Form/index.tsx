/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Button,
    Codicon,
    CompletionItem,
    LinkButton,
    SidePanelBody,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

import { FormField, FormValues } from "./types";
import { EditorFactory } from "../editors/EditorFactory";
import { Colors } from "../../resources/constants";
import { getValueForDropdown, isDropdownField } from "../editors/utils";
import { NodeKind, NodePosition, SubPanel } from "@wso2-enterprise/ballerina-core";
import { Provider } from "../../context";

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
    projectPath?: string;
    selectedNode?: NodeKind;
    onSubmit?: (data: FormValues) => void;
    openRecordEditor?: (isOpen: boolean, fields: FormValues) => void;
    openView?: (filePath: string, position: NodePosition) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    expressionEditor?: {
        completions: CompletionItem[];
        triggerCharacters: readonly string[];
        retrieveCompletions: (
            value: string,
            offset: number,
            triggerCharacter?: string,
            onlyVariables?: boolean
        ) => Promise<void>;
        extractArgsFromFunction: (cursorPosition: number) => {
            label: string;
            args: string[];
            currentArgIndex: number;
        };
        onCompletionSelect?: (value: string) => Promise<void>;
        onFocus?: () => void | Promise<void>;
        onBlur?: () => void | Promise<void>;
        onCancel: () => void;
    };
}

export function Form(props: FormProps) {
    const {
        formFields,
        projectPath,
        selectedNode,
        onSubmit,
        openRecordEditor,
        openView,
        openSubPanel,
        expressionEditor,
    } = props;
    const { control, getValues, register, handleSubmit, reset, watch } = useForm<FormValues>();

    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [createNewVariable, setCreateNewVariable] = useState(true);

    useEffect(() => {
        // Reset form with new values when formFields change
        const defaultValues: FormValues = {};
        formFields.forEach((field) => {
            if (isDropdownField(field)) {
                defaultValues[field.key] = getValueForDropdown(field);
            } else {
                defaultValues[field.key] = field.value;
            }
        });
        reset(defaultValues);
    }, [formFields, reset]);

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

    // HACK: hide some fields if the form. need to fix from LS
    formFields.forEach((field) => {
        // hide http scope
        if (field.key === "scope") {
            field.optional = true;
        }
    });

    // has optional fields
    const hasOptionalFields = formFields.some((field) => field.optional);

    const isDataMapper = selectedNode && selectedNode === "DATA_MAPPER";
    const isExistingDataMapper =
        isDataMapper && !!(formFields.find((field) => field.key === "view")?.value as any)?.fileName;

    const variableField = formFields.find((field) => field.key === "variable");
    const typeField = formFields.find((field) => field.key === "type");
    const dataMapperField = formFields.find((field) => field.label.includes("Data mapper"));
    const prioritizeVariableField = (variableField || typeField) && !dataMapperField;

    //TODO: get assign variable field from model. need to fix from LS
    const updateVariableField = {
        key: "update-variable",
        label: "Variable",
        type: "IDENTIFIER",
        optional: false,
        editable: true,
        documentation: "Select a variable to assign",
        value: "name",
    };

    const contextValue = {
        form: {
            control,
            watch,
            register,
        },
        expressionEditor,
    };

    // TODO: support multiple type fields
    return (
        <Provider {...contextValue}>
            <S.Container>
                {prioritizeVariableField && variableField && (
                    <S.CategoryRow showBorder={true}>
                        {variableField && createNewVariable && <EditorFactory field={variableField} />}
                        {typeField && createNewVariable && (
                            <EditorFactory
                                field={typeField}
                                openRecordEditor={handleOpenRecordEditor}
                                openSubPanel={openSubPanel}
                            />
                        )}
                        {updateVariableField && !createNewVariable && <EditorFactory field={updateVariableField} openSubPanel={openSubPanel}/>}
                    </S.CategoryRow>
                )}
                <S.CategoryRow showBorder={false}>
                    {formFields
                        .filter((field) => field.type !== "VIEW")
                        .map((field) => {
                            if (
                                ((field.key === "variable" || field.key === "type") && prioritizeVariableField) ||
                                field.optional
                            ) {
                                return;
                            }
                            return (
                                <S.Row key={field.key}>
                                    <EditorFactory
                                        field={field}
                                        openRecordEditor={handleOpenRecordEditor}
                                        openSubPanel={openSubPanel}
                                    />
                                </S.Row>
                            );
                        })}
                    {isExistingDataMapper && (
                        <S.DataMapperRow>
                            <S.UseDataMapperButton appearance="secondary" onClick={handleOnUseDataMapper}>
                                Use Data Mapper
                            </S.UseDataMapperButton>
                        </S.DataMapperRow>
                    )}
                    {hasOptionalFields && (
                        <S.Row>
                            Optional Parameters
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
                    {hasOptionalFields &&
                        showAdvancedOptions &&
                        formFields.map((field) => {
                            if (field.optional) {
                                return (
                                    <S.Row key={field.key}>
                                        <EditorFactory
                                            field={field}
                                            openRecordEditor={handleOpenRecordEditor}
                                            openSubPanel={openSubPanel}
                                        />
                                    </S.Row>
                                );
                            }
                        })}
                </S.CategoryRow>
                {onSubmit && (
                    <S.Footer>
                        <Button appearance="primary" onClick={handleSubmit(handleOnSave)}>
                            Save
                        </Button>
                    </S.Footer>
                )}
            </S.Container>
        </Provider>
    );
}

export default Form;
