/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Dropdown, LocationSelector } from "@wso2-enterprise/ui-toolkit";

import { FormField } from "../Form/types";
import { capitalize, getValueForDropdown } from "./utils";
import { useFormContext } from "../../context";

interface DropdownEditorProps {
    field: FormField;
}

export function FileSelect(props: DropdownEditorProps) {
    const { field } = props;
    const { form } = useFormContext();
    const { register } = form;

    return (
        <LocationSelector
            label={`Select ${field.label} File`}
            btnText="Select File"
            selectedFile={""}
            onSelect={undefined}
        />
    );
}
