/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ElementType, ReactElement, useEffect, useState } from "react";

import { Box, FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";

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
            <Select
                id={id}
                value={inputValue}
                required={isRequired}
                onChange={handleChange}
                style={{fontSize: 14}}
                variant="outlined"
            >
                {reactElements}
            </Select>
        </FormControl>
    );
}
