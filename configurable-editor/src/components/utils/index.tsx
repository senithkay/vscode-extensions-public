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
import { __String } from "typescript";

import { ConfigElementProps, setConfigElementProps } from "../ConfigElement";
import { ConfigMapProps, setConfigMapProps } from "../ConfigMap";
import { ConfigObjectProps } from "../ConfigObject";
import { ConfigType, ConfigValue, MetaData, SchemaConstants } from "../model";
import { useStyles } from "../style";

/**
 * Checks if the provided object is a leaf property or not.
 * @param data The object that needs to be evaluated.
 * @returns    A boolean value if the object is an `ConfigElement` or not.
 */
export function instanceOfConfigElement(data: any): boolean {
    return data.type !== undefined;
}

/**
 * Checks if the provided object is a map property or not.
 * @param data The object that needs to be evaluated.
 * @returns    A boolean value if the object is an `ConfigMap` or not.
 */
export function instanceOfConfigMap(data: any): boolean {
    return data.properties === undefined && data.additionalProperties !== undefined;
}

/**
 * Gets the `ConfigType` enum type from a string value.
 * @param type The config type as a string value.
 * @returns    The corresponding `ConfigType` enum.
 */
export function getType(type: string): ConfigType {
    const keys = Object.keys(ConfigType).filter((x) => ConfigType[x] === type);
    return keys.length > 0 ? ConfigType[keys[0]] : ConfigType.UNSUPPORTED;
}

/**
 * Recursively set the config properties from the config schema object.
 * @param configObj Config property object. The first element of the recursion is the
 *                  config schema object without the 2 top most root properties.
 * @param id        An identifier for the config property object.
 * @param name      Name of the config property object, the first one is set to 'root'.
 * @returns         A populated config `ConfigObjectProps` object.
 */
export function getConfigProperties(configObj: object, id: string = "1", name: string = "root",
                                    requiredItem = true): ConfigObjectProps {
    const propertiesObj: object = configObj[SchemaConstants.PROPERTIES];
    const requiredProperties: string[] = configObj[SchemaConstants.REQUIRED];
    const configProperty: ConfigObjectProps = { id: String(id), name, isRequired: requiredItem, properties: [] };

    Object.keys(propertiesObj).forEach((key, index) => {
        let isArrayProperty: boolean = false;
        const configPropertyValues = propertiesObj[key];
        let configPropertyType: string = configPropertyValues[SchemaConstants.TYPE];
        const configPropertyDesc: string = configPropertyValues[SchemaConstants.DESCRIPTION];
        const required = isRequired(key, requiredProperties);

        if (configPropertyType === ConfigType.OBJECT) {
            const propertyValue: string = configPropertyValues[SchemaConstants.PROPERTIES];
            const additionalProperties = configPropertyValues[SchemaConstants.ADDITIONAL_PROPERTIES];
            if (propertyValue) {
                // Handle record values
                const childProperty: ConfigObjectProps = getConfigProperties(configPropertyValues,
                    id + "-" + (index + 1), key, required);
                configProperty.properties.push(childProperty);
            } else if (additionalProperties) {
                // Handle map values
                const mapConfigElement: ConfigMapProps = setConfigMapProps(id + "-" + (index + 1), key,
                    required, additionalProperties);
                if (mapConfigElement) {
                    configProperty.properties.push(mapConfigElement);
                }
            }
        } else {
            // Handle array values.
            if (configPropertyType === ConfigType.ARRAY) {
                isArrayProperty = true;
                configPropertyType = configPropertyValues[SchemaConstants.ITEMS][SchemaConstants.TYPE];
            }

            const idValue = configProperty.id + "-" + (index + 1);

            const element: ConfigElementProps = setConfigElementProps(idValue, isArrayProperty,
                configPropertyType, key, required, configPropertyDesc);
            if (element) {
                configProperty.properties.push(element);
            }
        }
    });
    return configProperty;
}

/**
 * Check if a property is marked as a required property.
 * @param propertyName Name of the property.
 * @param requiredList Array of required properties.
 * @returns            Returns true if the property is required and vice versa.
 */
function isRequired(propertyName: string, requiredList: string[]): boolean {
    let required: boolean = false;
    if (requiredList && requiredList.length > 0) {
        required = requiredList.indexOf(propertyName) > -1;
    }
    return required;
}

/**
 * Update the config `ConfigObjectProps` object with existing values provided through a JSON object.
 * @param properties The populated config `ConfigObjectProps` object.
 * @param configs    Existing config values provided as an object complying with the config schema.
 * @returns          The config `ConfigObjectProps` object updated with the value property.
 */
export function setExistingValues(properties: ConfigObjectProps,
                                  configs: object, metaData: MetaData): ConfigObjectProps {
    const orgName = Object.keys(configs)[0];
    if (orgName === undefined) {
        return;
    }

    const packageConfig: object = configs[orgName];
    const packageName = Object.keys(packageConfig)[0];
    if (packageName === undefined) {
        return;
    }

    // Validate the existing values with the config schema.
    if (orgName !== metaData.orgName || packageName !== metaData.packageName) {
        // tslint:disable-next-line: no-console
        console.debug("Mismatching metadata found in the config schema and existing data");
    }

    // Existing config values without metadata.
    const configValues = packageConfig[packageName];
    // Existing property values without metadata
    const configProperties = properties[SchemaConstants.PROPERTIES];

    setConfigValue(configProperties, configValues);

    properties[SchemaConstants.PROPERTIES] = configProperties;
    return properties;
}

/**
 * Updates the existing config values of a `ConfigObjectProps` with the values
 * provided in the `ConfigValue[]` array.
 * @param configObjects The `ConfigObjectProps` that needs to be updated.
 * @param configValues  The `ConfigValue[]` array containing the new key value pairs.
 * @returns             The updated `ConfigObjectProps` object.
 */
export function updateConfigObjectProps(configObjects: ConfigObjectProps,
                                        configValues: ConfigValue[]): ConfigObjectProps {
    if (configObjects && configValues && configObjects.properties) {
        Object.keys(configObjects.properties).forEach((key) => {
            if (instanceOfConfigElement(configObjects.properties[key])) {
                const property: ConfigElementProps = configObjects.properties[key];
                const existingConfig = configValues.findIndex((item) => item.key === property.id);
                delete configObjects.properties[key].setConfigElement;
                if (existingConfig > -1) {
                    configObjects.properties[key].value = configValues[existingConfig].value;
                }
            } else {
                delete configObjects.properties[key].setConfigElement;
                updateConfigObjectProps(configObjects.properties[key], configValues);
            }
        });
    }

    return configObjects;
}

/**
 * Recursively set config values to config properties, including the nested objects.
 * @param configProperties The config properties object, could be a `ConfigProperty` or `ConfigElement`.
 * @param configValues     The config values object, could be a nested value.
 */
function setConfigValue(configProperties: object, configValues: object) {
    if (configProperties === undefined) {
        return;
    }
    Object.keys(configProperties).forEach((key) => {
        if (instanceOfConfigElement(configProperties[key])) {
            const value = getValue(configProperties[key].name, configValues);
            configProperties[key].value = value;
        } else {
            const value = getValue(configProperties[key].name, configValues);
            setConfigValue(configProperties[key][SchemaConstants.PROPERTIES], value);
        }
    });
}

/**
 * Gets the config value from the config value object when provided with a key.
 * @param key The key of which the value is required.
 * @param obj The config value object containing the entries that needs to be iterated.
 * @returns   The config value, it could be a nested object value as well.
 */
function getValue(key: string, obj: object): any {
    if (key && obj) {
        const keys = Object.keys(obj).filter((x) => x === key);
        if (keys.length > 0) {
            return obj[keys[0]];
        }
    }
}

export const getDescription = (description: string, classes: ReturnType<typeof useStyles>) => {
    if (description) {
        return (
            <Box className={classes.descriptionLabel}>
                <Typography
                    component="div"
                    className={classes.descriptionLabelText}
                >
                    {description}
                </Typography>
            </Box>
        );
    }
};
