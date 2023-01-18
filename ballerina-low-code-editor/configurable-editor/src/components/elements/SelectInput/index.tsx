/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { ReactElement, useEffect, useState } from "react";

import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

export interface SelectInputProps {
    id: string;
    isRequired: boolean;
    value: string;
    types: string[];
    setSelectValue: (key: string, value: any) => void;
}

export function SelectInput(props: SelectInputProps) {
    const { id, isRequired, types, value, setSelectValue } = props;
    const [inputValue, setInputValue] = useState(String(value ? value : ""));
    const reactElements: ReactElement[] = [];

    const handleChange = (e: any) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        setSelectValue(id, inputValue);
    }, [inputValue]);

    types.forEach((type) => {
        reactElements.push(
            (
                <MenuItem key={id + "-" + type} value={type} style={{fontSize: 14}}>{type}</MenuItem>
            ),
        );
    });

    return (
        <FormControl variant="standard" size="small" fullWidth={true}>
            <InputLabel id="demo-simple-select-standard-label">value</InputLabel>
            <Select
                id={id}
                value={inputValue}
                required={isRequired}
                onChange={handleChange}
                style={{fontSize: 14}}
            >
                {reactElements}
            </Select>
        </FormControl>
    );
}
