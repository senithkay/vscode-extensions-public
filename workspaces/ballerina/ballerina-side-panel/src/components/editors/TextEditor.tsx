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
import { useFormContext } from "../../context";
import styled from "@emotion/styled";
import { Colors } from "../../resources/constants";
import { capitalize } from "./utils";

const AddTypeContainer = styled.div<{}>`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: flex-start;
    margin-left: 8px;
`;

const Pill = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: ${Colors.GREEN};
    padding: 2px 4px;
    border-radius: 20px;
    border: 1px solid ${Colors.GREEN};
    font-size: 10px;
    font-family: monospace;
    svg {
        fill: ${Colors.GREEN};
        stroke: ${Colors.GREEN};
        height: 12px;
        width: 12px;
    }
`;

interface TextEditorProps {
    field: FormField;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
}

export function TextEditor(props: TextEditorProps) {
    const { field, handleOnFieldFocus, autoFocus } = props;
    const { form } = useFormContext();
    const { register } = form;

    const errorMsg = field.diagnostics?.map((diagnostic) => diagnostic.message).join("\n");

    return (
        <TextField
            id={field.key}
            name={field.key}
            {...register(field.key, { required: !field.optional && !field.placeholder })}
            label={capitalize(field.label)}
            required={!field.optional}
            description={field.documentation}
            placeholder={field.placeholder}
            readOnly={!field.editable}
            sx={{ width: "100%" }}
            errorMsg={errorMsg}
            onFocus={() => handleOnFieldFocus?.(field.key)}
            autoFocus={autoFocus}
        />
    );
}
