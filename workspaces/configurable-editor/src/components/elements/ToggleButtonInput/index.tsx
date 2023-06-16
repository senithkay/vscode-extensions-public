/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useState } from "react";

import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

import { useStyles } from "./style";

export interface ToggleButtonInputProps {
    id: string;
    existingValue: boolean;
    isRequired: boolean;
    setToggleButtonValue: (id: string, value: boolean, valueRef: any) => void;
}

export function ToggleButtonInput(props: ToggleButtonInputProps) {
    const classes = useStyles();
    const { id, existingValue, isRequired, setToggleButtonValue } = props;
    const [inputValue, setInputValue] = useState(String(existingValue));

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

    const handleChange = (e: any, newAlignment: string) => {
        if (isRequired) {
            if (newAlignment !== null) {
                setInputValue(newAlignment);
            }
        } else {
            setInputValue(newAlignment);
        }
    };

    useEffect(() => {
        setToggleButtonValue(id, getBooleanValue(inputValue), inputValue);
    }, [inputValue]);

    return (
        <ToggleButtonGroup
            color="primary"
            value={inputValue}
            exclusive={true}
            onChange={handleChange}
            classes={{root: classes.toggleButton}}
        >
            <ToggleButton value="true" classes={{root: classes.toggleButtonLabel}}>True</ToggleButton>
            <ToggleButton value="false" classes={{root: classes.toggleButtonLabel}}>False</ToggleButton>
        </ToggleButtonGroup>
    );
}
