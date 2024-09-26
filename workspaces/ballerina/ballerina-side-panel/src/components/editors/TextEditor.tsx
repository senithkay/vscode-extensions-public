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
import styled from "@emotion/styled";
import { Colors } from "../../resources/constants";
import { TIcon } from "../../resources";

const AddTypeContainer = styled.div<{}>`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: flex-start;
    margin-left: 8px;
`;

export const Pill = styled.div`
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
    register: UseFormRegister<FieldValues>;
}

export function TextEditor(props: TextEditorProps) {
    const { field, register } = props;

    const typeLabel = (type: string) => (
        <AddTypeContainer>
            <Pill>
                <TIcon />
                {type}
            </Pill>
        </AddTypeContainer>
    );

    return (
        <TextField
            id={field.key}
            {...register(field.key, { required: !field.optional, value: field.value })}
            value={field.value}
            label={field.label}
            required={!field.optional}
            description={field.documentation}
            labelAdornment={typeLabel(field.type)}
            sx={{ width: "100%" }}
        />
    );
}
