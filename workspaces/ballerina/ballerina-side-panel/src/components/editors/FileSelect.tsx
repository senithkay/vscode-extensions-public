/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";

import { Dropdown, LocationSelector } from "@wso2-enterprise/ui-toolkit";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";

import { FormField } from "../Form/types";
import { capitalize, getValueForDropdown } from "./utils";
import { useFormContext } from "../../context";

interface DropdownEditorProps {
    field: FormField;
}

export function FileSelect(props: DropdownEditorProps) {
    const { field } = props;
    const { form } = useFormContext();
    const { setValue } = form;

    const { rpcClient } = useRpcContext();
    const [filePath, setFilePath] = useState("");

    const handleFileSelect = async () => {
        const projectDirectory = await rpcClient.getCommonRpcClient().selectFileOrDirPath({ isFile: true });
        setFilePath(projectDirectory.path);
        setValue(field.key, projectDirectory.path)
    };

    return (
        <LocationSelector
            label={`Select ${field.label} File`}
            btnText="Select File"
            selectedFile={filePath}
            onSelect={handleFileSelect}
        />
    );
}
