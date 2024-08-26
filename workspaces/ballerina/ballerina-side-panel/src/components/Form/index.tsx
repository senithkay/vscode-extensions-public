/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { useForm } from "react-hook-form";
import { Button, SidePanelBody } from "@wso2-enterprise/ui-toolkit";
import { FormField, FormValues } from "./types";
import styled from "@emotion/styled";
import { FormFieldEditor } from "../editors/FormFieldEditor";

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

    export const AddTypeContainer = styled.div<{}>`
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        justify-content: flex-end;
    `;

    export const DrawerContainer = styled.div<{}>`
        width: 400px;
    `;
}

interface FormProps {
    formFields: FormField[];
    onSubmit: (data: FormValues) => void;
    openRecordEditor?: (isOpen: boolean) => void;
}

export function Form(props: FormProps) {
    const { formFields, onSubmit, openRecordEditor } = props;
    const { getValues, register } = useForm<FormValues>();

    console.log(">>> form fields", { formFields, values: getValues() });

    const handleOnSave = () => {
        onSubmit(getValues());
    };

    // TODO: support multiple type fields
    return (
        <S.Container>
            {formFields.map((field) => (
                <S.Row key={field.key}>
                    <FormFieldEditor
                        field={field}
                        register={register}
                        openRecordEditor={openRecordEditor}
                    />
                </S.Row>
            ))}

            <S.Footer>
                <Button appearance="primary" onClick={handleOnSave}>
                    Save
                </Button>
            </S.Footer>
        </S.Container>
    );
}

export default Form;
