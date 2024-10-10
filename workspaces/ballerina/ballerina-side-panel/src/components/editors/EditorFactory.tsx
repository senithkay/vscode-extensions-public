/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { FieldValues, UseFormRegister } from "react-hook-form";
import { SubPanel } from "@wso2-enterprise/ballerina-core";

import { FormField } from "../Form/types";
import { DropdownEditor } from "./DropdownEditor";
import { TextEditor } from "./TextEditor";
import { TypeEditor } from "./TypeEditor";
import { isDropdownField } from "./utils";

interface FormFieldEditorProps {
    field: FormField;
    register: UseFormRegister<FieldValues>;
    openRecordEditor?: (open: boolean) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
}

export function EditorFactory(props: FormFieldEditorProps) {
    const { field, openRecordEditor } = props;

    if (isDropdownField(field)) {
        return <DropdownEditor {...props} />;
    } else if (!field.items && (field.key !== "type")) {
        return (
            <TextEditor {...props} />
        )
    } else if (!field.items && (field.key === "type")) {
        return (
            <TypeEditor {...props} openRecordEditor={openRecordEditor} />
        );
    } else  {
        return <TextEditor {...props} />;
    }
}
