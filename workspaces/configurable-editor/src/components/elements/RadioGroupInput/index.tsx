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

import { FormControlLabel, Radio, RadioGroup, Typography } from "@material-ui/core";

import { useStyles } from "./style";

export interface RadioGroupInputProps {
    id: string;
    value: string;
    types: Map<string, string>;
    setRadioGroupValue: (key: string, value: any) => void;
}

export function RadioGroupInput(props: RadioGroupInputProps) {
    const { id, value, types, setRadioGroupValue } = props;
    const [inputValue, setInputValue] = useState(String(value));
    const reactElements: ReactElement[] = [];
    const classes = useStyles();

    const handleChange = (e: any) => {
        setInputValue(e.target.value);
    };

    useEffect(() => {
        setRadioGroupValue(id, inputValue);
    }, [inputValue]);

    types.forEach((label: string, key: string) => {
        reactElements.push(
            (
                <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio color="primary"/>}
                    label={<Typography variant="body2">{label}</Typography>}
                    className={classes.radioButton}
                />
            ),
        );
    });

    return (
        <RadioGroup name="booleanValue" row={true} onChange={handleChange} defaultValue={value}>
            {reactElements}
        </RadioGroup>
    );
}
