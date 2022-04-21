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

import React, { useEffect } from "react";

import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

export interface ToggleButtonInputProps {
    id: string;
    existingValue: boolean;
    isRequired: boolean;
    setToggleButtonValue: (id: string, value: boolean) => void;
}

export function ToggleButtonInput(props: ToggleButtonInputProps) {
    const { id, existingValue, isRequired, setToggleButtonValue } = props;
    const [inputValue, setInputValue] = React.useState(String(existingValue));

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
        setToggleButtonValue(id, getBooleanValue(inputValue));
    }, [inputValue]);

    return (
        <ToggleButtonGroup
            color="primary"
            value={inputValue}
            exclusive={true}
            onChange={handleChange}
            size={"small"}
        >
            <ToggleButton value="true">True</ToggleButton>
            <ToggleButton value="false">False</ToggleButton>
        </ToggleButtonGroup>
    );
}
