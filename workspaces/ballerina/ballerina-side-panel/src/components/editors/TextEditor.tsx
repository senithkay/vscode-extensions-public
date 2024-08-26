/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { FormField } from "../Form/types";
import { TextField } from "@wso2-enterprise/ui-toolkit";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface TextEditorProps {
    field: FormField;
    register: UseFormRegister<FieldValues>;
}

export function TextEditor(props: TextEditorProps) {
    const { field, register } = props;

    return (
        <TextField
            id={field.key}
            {...register(field.key, { required: !field.optional, value: field.value })}
            value={field.value}
            label={field.label}
            required={!field.optional}
            description={field.documentation}
            sx={{ width: "100%" }}
        />
    );
}
