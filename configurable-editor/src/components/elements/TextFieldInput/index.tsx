/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from "react";

import { TextField } from "@material-ui/core";

import { useStyles } from "../../style";

export interface TextFieldInputProps {
    id: string;
    isRequired: boolean;
    existingValue: any;
    type: string;
    setTextFieldValue: (key: string, value: any) => void;
}

export function TextFieldInput(props: TextFieldInputProps) {
    const classes = useStyles();
    const { id, isRequired, existingValue, type, setTextFieldValue } =
        props;

    let placeholder: string = "";
    if (isRequired) {
        placeholder = "Required";
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextFieldValue(id, e.target.value);
    };

    let fieldType: string = type;
    if (type === "integer") {
        fieldType = "number";
    }

    return (
        <TextField
            required={isRequired}
            variant="outlined"
            placeholder={placeholder}
            fullWidth={true}
            defaultValue={existingValue || null}
            type={fieldType}
            margin="none"
            onChange={handleChange}
            size="small"
            classes={{ root: classes.textInputRoot }}
            InputLabelProps={{ shrink: false }}
        />
    );
}
