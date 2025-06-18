/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback, useState } from "react";
import { FormField } from "../Form/types";
import { TextField } from "@wso2-enterprise/ui-toolkit";
import { useFormContext } from "../../context";
import { parseBasePath, parseResourceActionPath } from "../../utils/path-validations";
import { capitalize } from "./utils";
import { debounce } from "lodash";

interface PathEditorProps {
    field: FormField;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
}

export function PathEditor(props: PathEditorProps) {
    const { field, handleOnFieldFocus, autoFocus } = props;
    const { form } = useFormContext();
    const { register, setError, clearErrors } = form;

    const [pathErrorMsg, setPathErrorMsg] = useState<string>(field.diagnostics?.map((diagnostic) => diagnostic.message).join("\n"));

    const validatePath = useCallback(debounce(async (value: string) => {
        const response = field.type === "SERVICE_PATH" ? parseBasePath(value) : parseResourceActionPath(value);
        if (response.errors.length > 0) {
            setPathErrorMsg(response.errors[0].message);
            setError(field.key, {
                type: "validate",
                message: response.errors[0].message
            });
        } else {
            setPathErrorMsg("");
            clearErrors(field.key);
        }
    }, 250), [field]);

    return (
        <TextField
            id={field.key}
            name={field.key}
            {...register(field.key, { required: !field.optional && !field.placeholder, value: field.value })}
            label={capitalize(field.label)}
            required={!field.optional}
            description={field.documentation}
            placeholder={field.placeholder}
            readOnly={!field.editable}
            sx={{ width: "100%" }}
            errorMsg={pathErrorMsg}
            onKeyUp={(e) => validatePath(e.currentTarget.value)}
            onFocus={() => handleOnFieldFocus?.(field.key)}
            autoFocus={autoFocus}
        />
    );
}
