/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { SubPanel } from "@wso2-enterprise/ballerina-core";

import { FormField } from "../Form/types";
import { DropdownEditor } from "./DropdownEditor";
import { TextEditor } from "./TextEditor";
import { TypeEditor } from "./TypeEditor";
import { ContextAwareExpressionEditor } from "./ExpressionEditor";
import { isDropdownField } from "./utils";

interface FormFieldEditorProps {
    field: FormField;
    openRecordEditor?: (open: boolean) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
}

export function EditorFactory(props: FormFieldEditorProps) {
    const { field, openRecordEditor, openSubPanel } = props;

    if (isDropdownField(field)) {
        return <DropdownEditor field={field} />;
    } else if (!field.items && (field.key === "type")) {
        return (
            <TypeEditor field={field} openRecordEditor={openRecordEditor} />
        );
    } else if (!field.items && field.type === "EXPRESSION") {
        return (
            <ContextAwareExpressionEditor field={field} openSubPanel={openSubPanel} />
        );
    } else if (!field.items && (field.key !== "type")) {
        return (
            <TextEditor field={field} />
        );
    } else {
        return <TextEditor field={field} />;
    }
}
