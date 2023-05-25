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

import React, { useEffect, useState } from "react";

import { TextField } from "@material-ui/core";

import TextInput from "../../ChoreoSystem/TextInput/TextInput";
import { useStyles } from "../../style";

export interface TextFieldInputProps {
    id?: string;
    isRequired?: boolean;
    name?: string;
    value: any;
    valueRef?: string;
    isSensitiveField?: boolean;
    disabled?: boolean;
    type: string;
    inputProps?: object;
    placeholder?: string;
    setTextFieldValue?: (id: string, value: any, valuRef: any, isSensitiveField: boolean) => void;
}

export function TextFieldInput(props: TextFieldInputProps) {
    const classes = useStyles();
    const {
        id,
        isRequired,
        value,
        valueRef,
        type,
        inputProps,
        placeholder,
        setTextFieldValue,
        name,
        disabled,
        isSensitiveField,
    } = props;
    const [inputValue, setInputValue] = useState(value ? String(value) : undefined);
    const [inputValueRef, setInputValueRef] = useState(valueRef ? String(valueRef) : undefined);
    const [inputSensitiveField, setInputSensitiveField] = useState(isSensitiveField ? isSensitiveField : false);

    useEffect(() => {
        setTextFieldValue(id, inputValue, inputValueRef, inputSensitiveField);
    }, [inputValue]);

    useEffect(() => {
        setInputValueRef(valueRef);
    }, [valueRef]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        setInputSensitiveField(isSensitiveField);
    }, [isSensitiveField]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        if (type === "string") {
            newValue = handleQuotes(newValue);
        }
        setInputValue(newValue);
    };

    const newInputProps = {
        ...inputProps,
        style: { fontSize: 14 },
    };
    return (
        <TextInput
            required={isRequired}
            placeholder={placeholder}
            fullWidth={true}
            value={inputValue}
            type={type}
            margin="none"
            onChange={handleChange}
            inputProps={newInputProps}
            data-cyid={name}
            disabled={disabled}
        />
    );
}

function handleQuotes(strValue: string): string {
    const startChar = strValue.charAt(0);
    const endChar = strValue.charAt(strValue.length - 1);

    if ((startChar === "\"" && endChar === "\"") || (startChar === "\'" && endChar === "\'")) {
        strValue = strValue.slice(1, -1);
    }
    return strValue;
}
