/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Dropdown } from "@wso2-enterprise/ui-toolkit";

import { FormField } from "../Form/types";
import { getValueForDropdown } from "./utils";
import { useFormContext } from "../../context";

interface DropdownEditorProps {
    field: FormField;
}

export function DropdownEditor(props: DropdownEditorProps) {
    const { field } = props;
    const { form } = useFormContext();
    const { register } = form;

    // HACK: create values for Scope field
    if (field.key === "scope") {
        field.items = ["Global", "Local"];
    }

    return (
        <Dropdown
            id={field.key}
            {...register(field.key, { required: !field.optional, value: getValueForDropdown(field) })}
            label={field.label}
            items={field.items?.map((item) => ({ id: item, content: item, value: item }))}
            required={!field.optional}
            disabled={!field.editable}
            sx={{ width: "100%" }}
            containerSx={{ width: "100%" }}
        />
    );
}
