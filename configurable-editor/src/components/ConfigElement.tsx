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

import { Box, Typography } from "@material-ui/core";

import { AddInputButton } from "./elements/AddInputButton";
import { CheckBoxInput } from "./elements/CheckBoxInput";
import { TextFieldInput } from "./elements/TextFieldInput";
import { ConfigType } from "./model/config-schema";

/**
 * A leaf level config property model.
 */
export interface ConfigElementProps {
    id: string;
    isArray: boolean;
    isRequired: boolean;
    name: string;
    type: ConfigType;
    value?: number | string | boolean | number[] | string[] | boolean[];
}

export const getConfigElement = (configElementProps: ConfigElementProps) => {
    if (configElementProps === undefined) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6" component="div">
                {configElementProps.name}
            </Typography>
            <Typography variant="overline" component="div">
                {configElementProps.type}
            </Typography>
            <Typography variant="body2" component="div">
                {<ConfigElement {...configElementProps}/>}
            </Typography>
        </Box>
    );
};

const ConfigElement = (configElement: ConfigElementProps): any => {
    const returnElement: any[] = [];

    if (configElement.isArray) {
        if (configElement.value) {
            const values = configElement.value as Array<string | number | boolean>;
            values.forEach((value, index) => {
                const newElement = { ...configElement };
                newElement.id = newElement.id + "." + index;
                newElement.value = value;
                returnElement.push(
                    (
                        <div key={newElement.id + "-ELEMENT"}>
                            {getInnerElement(newElement)}
                        </div>
                    ),
                );
            });
            returnElement.push(
                (
                    <div key={configElement.id + "-ADD"}>
                        <AddInputButton />
                    </div>
                ),
            );
        }
    } else {
        returnElement.push(
            (
                <div key={configElement.id + "-ELEMENT"}>
                    {getInnerElement(configElement)}
                </div>
            ),
        );
    }
    return returnElement;
};

const getInnerElement = (configElementProps: ConfigElementProps) => {
    switch (configElementProps.type) {
        case ConfigType.BOOLEAN:
            return (
                <div key={configElementProps.id + "-CHECK"}>
                    <CheckBoxInput
                        label={configElementProps.name}
                        existingValue={configElementProps.value as boolean}
                    />
                </div>
            );
        case ConfigType.STRING:
        case ConfigType.NUMBER:
            return (
                <div key={configElementProps.id + "-FIELD"}>
                    <TextFieldInput
                        isRequired={configElementProps.isRequired}
                        existingValue={configElementProps.value}
                        type={configElementProps.type}
                    />
                </div>
            );
    }
    return null;
};

export default ConfigElement;
