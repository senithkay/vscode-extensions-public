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

import React, { ReactElement } from "react";

import { Box, Typography } from "@material-ui/core";

import { AddInputButton } from "./elements/AddInputButton";
import { CheckBoxInput } from "./elements/CheckBoxInput";
import { TextFieldInput } from "./elements/TextFieldInput";
import { ConfigType, ConfigValue } from "./model";
import OutlinedLabel from "./OutlinedLabel";
import { useStyles } from "./style";
import { getType } from "./utils";

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
    setConfigElement?: (configValue: ConfigValue) => void;
}

/**
 * Returns a config `ConfigElementProps` when the list of parameters are provided.
 * @param id         An id for the config element.
 * @param isArray    The boolean property specifying whether the element is an array.
 * @param type       The type of the config element, arrays should have the component type.
 * @param name       The name of the config element.
 * @param isRequired The boolean property specifying whether the element is a required one.
 * @returns          Returns the config `ConfigElementProps` object.
 */
export function setConfigElementProps(
    id: string,
    isArray: boolean,
    type: string,
    name: string,
    isRequired: boolean,
): ConfigElementProps {
    return {
        id,
        isArray,
        isRequired,
        name,
        type: getType(type),
    };
}

/**
 * Provides the `ConfigElement` along with the property name and type.
 * @param configElementProps The props required for the `ConfigElement` component.
 * @returns                  The `ConfigElement` component.
 */
export const getConfigElement = (configElementProps: ConfigElementProps, classes: ReturnType<typeof useStyles>) => {

    if (configElementProps === undefined) {
        return null;
    }

    return (
        <Box className={classes.formGroup}>
            <Box className={classes.labelCont}>
                <Box className={classes.mainLabel}>
                    <Typography
                        component="div"
                        className={classes.mainLabelText}
                    >
                        {configElementProps.name}
                    </Typography>
                </Box>
                <Box className={classes.labelTag}>
                    <OutlinedLabel
                        type="success"
                        label={configElementProps.type}
                        shape="square"
                    />
                </Box>
            </Box>

            <Box className={classes.formInputBox}>
                {<ConfigElement {...configElementProps} />}
            </Box>
        </Box>
    );
};

const ConfigElement = (configElement: ConfigElementProps): ReactElement => {
    const returnElement: ReactElement[] = [];

    if (configElement.isArray) {
        if (configElement.value) {
            const values = configElement.value as Array<
                string | number | boolean
            >;
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
    return <>{returnElement}</>;
};

const getInnerElement = (configElementProps: ConfigElementProps) => {
    const handleSetElementValue = (key: string, value: any) => {
        const configValue: ConfigValue = { key, value };
        configElementProps.setConfigElement(configValue);
    };

    switch (configElementProps.type) {
        case ConfigType.BOOLEAN:
            return (
                <div key={configElementProps.id + "-CHECK"}>
                    <CheckBoxInput
                        id={configElementProps.id}
                        label={configElementProps.name}
                        existingValue={configElementProps.value as boolean}
                        isRequired={configElementProps.isRequired}
                        setCheckBoxValue={handleSetElementValue}
                    />
                </div>
            );
        case ConfigType.STRING:
        case ConfigType.INTEGER:
            return (
                <div key={configElementProps.id + "-FIELD"}>
                    <TextFieldInput
                        id={configElementProps.id}
                        isRequired={configElementProps.isRequired}
                        existingValue={configElementProps.value}
                        type={configElementProps.type}
                        setTextFieldValue={handleSetElementValue}
                    />
                </div>
            );
    }
    return null;
};

export default ConfigElement;
