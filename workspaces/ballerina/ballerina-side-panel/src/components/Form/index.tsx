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
import { Button, Codicon, LinkButton, SidePanelBody } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

import { FormField, FormValues } from "./types";
import { EditorFactory } from "../editors/EditorFactory";
import { Colors } from "../../resources/constants";
import { getValueForDropdown, isDropdownField } from "../editors/utils";
import { NodeKind, NodePosition } from "@wso2-enterprise/ballerina-core";

namespace S {
    export const Container = styled(SidePanelBody)`
        display: flex;
        flex-direction: column;
        gap: 18px;
    `;

    export const Row = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
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

    export const Title = styled.div<{}>`
        font-size: 14px;
        margin-top: 12px;
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

    export const UseDataMapperButton = styled(Button)`
        & > vscode-button {
            width: 250px;
            height: 30px;
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-welcomePage-tileBorder);
        };
        align-self: center;
    `;
}

interface FormProps {
    formFields: FormField[];
    projectPath?: string;
    selectedNode?: NodeKind;
    onSubmit?: (data: FormValues) => void;
    openRecordEditor?: (isOpen: boolean, fields: FormValues) => void;
    openView?: (filePath: string, position: NodePosition) => void;
}

export function Form(props: FormProps) {
    const { formFields, projectPath, selectedNode, onSubmit, openRecordEditor, openView } = props;
    const { getValues, register, setValue, handleSubmit, reset } = useForm<FormValues>();

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

    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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
            openView && openView(projectPath + "/" + fileName, {
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
    const isExistingDataMapper = isDataMapper
        && !!(formFields.find((field) => field.key === "view")?.value as any)?.fileName;

    // TODO: support multiple type fields
    return (
        <S.Container>
            {formFields.filter(field => field.type !== "VIEW").map((field) => {
                if (!field.optional) {
                    return (
                        <S.Row key={field.key}>
                            <EditorFactory
                                field={field}
                                register={register}
                                openRecordEditor={handleOpenRecordEditor}
                            />
                        </S.Row>
                    );
                }
            })}

            {isExistingDataMapper && (
                <S.DataMapperRow>
                    <S.UseDataMapperButton
                        appearance="secondary"
                        onClick={handleOnUseDataMapper}
                    >
                        Use Data Mapper
                    </S.UseDataMapperButton>
                </S.DataMapperRow>
            )}

            {hasOptionalFields && (
                <S.Row>
                    Advanced Properties
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
                                    register={register}
                                    openRecordEditor={handleOpenRecordEditor}
                                />
                            </S.Row>
                        );
                    }
                })}

            {onSubmit && (
                <S.Footer>
                    <Button appearance="primary" onClick={handleSubmit(handleOnSave)}>
                        Save
                    </Button>
                </S.Footer>
            )}
        </S.Container>
    );
}

export default Form;
