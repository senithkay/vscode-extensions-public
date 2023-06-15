/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
