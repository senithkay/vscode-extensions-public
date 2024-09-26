/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Control, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";

import { FormField } from "../Form/types";
import { DropdownEditor } from "./DropdownEditor";
import { TextEditor } from "./TextEditor";
import { TypeEditor } from "./TypeEditor";
import { ExpressionEditor } from "./ExpressionEditor";
import { isDropdownField } from "./utils";

interface FormFieldEditorProps {
    field: FormField;
    openRecordEditor?: (open: boolean) => void;
}

export function EditorFactory(props: FormFieldEditorProps) {
    const { field, openRecordEditor } = props;

    if (isDropdownField(field)) {
        return <DropdownEditor field={field} />;
    } else if (!field.items && (field.key === "type")) {
        return (
            <TypeEditor field={field} openRecordEditor={openRecordEditor} />
        );
    } else if (!field.items && field.key === "expression") {
        return (
            <ExpressionEditor field={field} />
        );
    } else if (!field.items && (field.key !== "type")) {
        return (
            <TextEditor field={field} />
        );
    } else {
        return <TextEditor field={field} />;
    }
}
