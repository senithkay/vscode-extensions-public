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
import { FormFieldEditor } from "../editors/FormFieldEditor";
import { Colors } from "../../resources/constants";
import { isDropdownField } from "../editors/utils";

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
}

interface FormProps {
    formFields: FormField[];
    onSubmit: (data: FormValues) => void;
    openRecordEditor?: (isOpen: boolean, fields: FormValues) => void;
}

export function Form(props: FormProps) {
    const { formFields, onSubmit, openRecordEditor } = props;
    const { getValues,register, setValue, handleSubmit, reset } = useForm<FormValues>();

    useEffect(() => {
        // Reset form with new values when formFields change
        const defaultValues: FormValues = {};
        formFields.forEach((field) => {
            if (isDropdownField(field)) {
                defaultValues[field.key] = field.value !== "" ? field.value : field.items[0];
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
        onSubmit(data);
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

    // HACK: hide some fields if the form. need to fix from LS
    formFields.forEach((field) => {
        // hide http scope
        if (field.key === "scope") {
            field.optional = true;
        }
    });

    // has optional fields
    const hasOptionalFields = formFields.some((field) => field.optional);

    // TODO: support multiple type fields
    return (
        <S.Container>
            {formFields.map((field) => {
                if (!field.optional) {
                    return (
                        <S.Row key={field.key}>
                            <FormFieldEditor
                                field={field}
                                register={register}
                                openRecordEditor={handleOpenRecordEditor}
                            />
                        </S.Row>
                    );
                }
            })}

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
                                <FormFieldEditor
                                    field={field}
                                    register={register}
                                    openRecordEditor={handleOpenRecordEditor}
                                />
                            </S.Row>
                        );
                    }
                })}

            <S.Footer>
                <Button appearance="primary" onClick={handleSubmit(handleOnSave)}>
                    Save
                </Button>
            </S.Footer>
        </S.Container>
    );
}

export default Form;
