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

import React from "react";

import { FormControlLabel, Radio, RadioGroup, Typography } from "@material-ui/core";

export interface RadioGroupInputProps {
    id: string;
    existingValue: boolean;
    isRequired: boolean;
    setRadioGroupValue: (key: string, value: any) => void;
}

export function RadioGroupInput(props: RadioGroupInputProps) {
    const { id, existingValue, isRequired, setRadioGroupValue } = props;

    const handleChange = (e: any) => {
        setRadioGroupValue(id, getBooleanValue(e.target.value));
    };

    const getBooleanValue = (value: string): boolean => {
        switch (value) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                return undefined;
            }
    };

    const getRadioButton = (value: string, label: string) => {
        return (
            <FormControlLabel
                value={value}
                control={<Radio color="primary"/>}
                label={<Typography variant="body2">{label}</Typography>}
            />
        );
    };

    const getUndefinedRadioButton = () => {
        if (!isRequired) {
            return (
                <div>
                    {getRadioButton("undefined", "Use default value")}
                </div>
            );
        }
    };

    let defaultValue = "true";
    if (!isRequired) {
        defaultValue = String(existingValue);
    } else if (existingValue !== undefined) {
        defaultValue = String(existingValue);
    }

    return (
        <RadioGroup name="booleanValue" row={true} onChange={handleChange} defaultValue={defaultValue}>
            {getRadioButton("true", "True")}
            {getRadioButton("false", "False")}
            {getUndefinedRadioButton()}
        </RadioGroup>
    );
}
