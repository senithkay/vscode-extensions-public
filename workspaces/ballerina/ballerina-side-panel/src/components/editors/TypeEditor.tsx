/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Codicon, LinkButton, TextField } from "@wso2-enterprise/ui-toolkit";
import { FieldValues, UseFormRegister } from "react-hook-form";
import styled from "@emotion/styled";

import { FormField } from "../Form/types";
import { Colors } from "../../resources/constants";
import { useFormContext } from "../../context";

const AddTypeContainer = styled.div<{}>`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: flex-end;
`;

interface TypeEditorProps {
    field: FormField;
    openRecordEditor: (open: boolean) => void;
}

const addType = (name: string, onClick?: () => void) => (
    <AddTypeContainer>
        <LinkButton onClick={onClick} sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
            <Codicon name={name} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
            Add Type
        </LinkButton>
    </AddTypeContainer>
);

export function TypeEditor(props: TypeEditorProps) {
    const { field, openRecordEditor } = props;
    const { form } = useFormContext();
    const { register } = form;

    const handleOpenRecordEditor = () => {
        openRecordEditor(true);
    };

    return (
        <TextField
            id={field.key}
            {...register(field.key, { required: !field.optional, value: field.value })}
            value={field.value}
            label={field.label}
            required={!field.optional}
            description={field.documentation}
            labelAdornment={openRecordEditor && addType("add", handleOpenRecordEditor)}
            sx={{ width: "100%" }}
        />
    );
}
