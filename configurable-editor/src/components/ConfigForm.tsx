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

import { Box, Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";

import { ConfigElementProps, getConfigElement } from "./ConfigElement";
import { ConfigObjectProps, getConfigObject } from "./ConfigObject";
import { ConfigType, MetaData, SchemaConstants } from "./model/config-schema";
import { instanceOfConfigElement } from "./utils";

let metaData: MetaData = null;

/**
 * A high level config value which can contain nested objects.
 */
interface ConfigValue {
    name: string;
    value: number | string | boolean | number[] | string[] | boolean[] | ConfigValue;
}

/**
 * Returns the config schema values for a package, removes the 2 top most root
 * properties and sets the meta data values.
 * @param configSchema The original config schema object.
 * @returns            The config schema object without the 2 top most root properties.
 */
function getPackageConfig(configSchema: object): object {
    const orgConfig: object = configSchema[SchemaConstants.PROPERTIES];
    const orgName = Object.keys(orgConfig)[0];

    const packageConfig: object = orgConfig[orgName][SchemaConstants.PROPERTIES];
    const packageName = Object.keys(packageConfig)[0];

    setMetaData(orgName, packageName);

    return packageConfig[packageName];
}

/**
 * Set the metadata values.
 * @param orgName     The organization of the Ballerina project.
 * @param packageName The package name of the Ballerina project.
 */
function setMetaData(orgName: string, packageName: string) {
    metaData = {
        orgName,
        packageName,
    };
}

/**
 * Recursively set the config properties from the config schema object.
 * @param configObj Config property object. The first element of the recursion is the
 *                  config schema object without the 2 top most root properties.
 * @param id        An identifier for the config property object.
 * @param name      Name of the config property object, the first one is set to 'root'.
 * @returns         A populated config `ConfigObjectProps` object.
 */
function getConfigProperties(configObj: object, id: string = "1", name: string = "root"): ConfigObjectProps {
    const propertiesObj: object = configObj[SchemaConstants.PROPERTIES];
    const requiredProperties: string[] = configObj[SchemaConstants.REQUIRED];
    const configProperty: ConfigObjectProps = { id: String(id), name, properties: [] };

    Object.keys(propertiesObj).forEach((key, index) => {
        let isArrayProperty: boolean = false;
        const configPropertyValues = propertiesObj[key];
        let configPropertyType: string = configPropertyValues[SchemaConstants.TYPE];

        if (configPropertyType === ConfigType.OBJECT) {
            // Iterate through nested objects.
            const childProperty: ConfigObjectProps = getConfigProperties(configPropertyValues,
                id + "-" + (index + 1), key);
            configProperty.properties.push(childProperty);
        } else {
            // Handle array values.
            if (configPropertyType === ConfigType.ARRAY) {
                isArrayProperty = true;
                configPropertyType = configPropertyValues[SchemaConstants.ITEMS][SchemaConstants.TYPE];
            }

            const required = isRequired(key, requiredProperties);
            const idValue = configProperty.id + "-" + (index + 1);

            const element: ConfigElementProps = setConfigElementProps(idValue, isArrayProperty,
                configPropertyType, key, required);
            if (element) {
                configProperty.properties.push(element);
            }
        }
    });
    return configProperty;
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
function setConfigElementProps(id: string, isArray: boolean, type: string, name: string,
                          isRequired: boolean): ConfigElementProps {
    return {
        id,
        isArray,
        isRequired,
        name,
        type: getType(type),
    };
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
 * Gets the `ConfigType` enum type from a string value.
 * @param type The config type as a string value.
 * @returns    The corresponding `ConfigType` enum.
 */
function getType(type: string): ConfigType {
    // Handle a possible inconsistency in the language feature.
    if (type === "integer") {
        type = "number";
    }

    const keys = Object.keys(ConfigType).filter((x) => ConfigType[x] === type);
    return keys.length > 0 ? ConfigType[keys[0]] : ConfigType.UNSUPPORTED;
}

/**
 * Update the config `ConfigObjectProps` object with existing values provided through a JSON object.
 * @param properties The populated config `ConfigObjectProps` object.
 * @param configs    Existing config values provided as an object complying with the config schema.
 * @returns          The config `ConfigObjectProps` object updated with the value property.
 */
function setExistingValues(properties: ConfigObjectProps, configs: object): ConfigObjectProps {
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
 * Recursively set config values to config properties, including the nested objects.
 * @param configProperties The config properties object, could be a `ConfigProperty` or `ConfigElement`.
 * @param configValues     The config values object, could be a nested value.
 */
function setConfigValue(configProperties: object, configValues: object) {
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

export interface ConfigFormProps {
    configSchema: object;
    existingConfigs: object;
    defaultButtonText: string;
    primaryButtonText: string;
}

const getConfigForm = (configProperty: ConfigObjectProps | ConfigElementProps) => {
    if (instanceOfConfigElement(configProperty)) {
        return (
            <div key={configProperty.id}>
                {getConfigElement(configProperty as ConfigElementProps)}
            </div>
        );
    } else {
        return (
            <div key={configProperty.id}>
                {getConfigObject(configProperty as ConfigObjectProps)}
            </div>
        );
    }
};

const handleSubmit = (event: any) => {
    event.preventDefault();
    // TODO: Handle the submit for Choreo Console and Low Code based on a prop
    // console.log(JSON.stringify(event.target));
};

export const ConfigForm = ({configSchema, existingConfigs, defaultButtonText, primaryButtonText }: ConfigFormProps) => {
    // The config property object retrieved from the config schema.
    const configObjectProps: ConfigObjectProps = getConfigProperties(getPackageConfig(configSchema));

    // Set the existing config values to the config property obtained.
    setExistingValues(configObjectProps, existingConfigs);
    console.log(configObjectProps);

    return (
        <Box sx={{ mt: 5 }}>
            <Container maxWidth="sm">
                <Card variant="outlined">
                    <CardContent>
                        <Box m={2} pt={3} style={{ textAlign: "center" }}>
                            <Typography gutterBottom={true} variant="h5" component="div">
                                Configurable Editor
                            </Typography>
                        </Box>
                        <Typography variant="body2" component="div">
                            <form className="ConfigForm" onSubmit={handleSubmit}>
                                {configObjectProps.properties.map(getConfigForm)}
                                <CardActions style={{ justifyContent: "center" }}>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                        >
                                            {defaultButtonText}
                                        </Button>
                                    </Box>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                        >
                                            {primaryButtonText}
                                        </Button>
                                    </Box>
                                </CardActions>
                            </form>
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default ConfigForm;
