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
import React, { useState } from "react";

import { Box, Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";

import ConfigElements from "./ConfigElements";

import existingConfigs from "../stories/data/existing-configs.json";

let metaData: MetaData = null;

const ITEMS: string = "items";
const TYPE: string = "type";
const DESCRIPTION: string = "description";
const PROPERTIES: string = "properties";
const REQUIRED: string = "required";

enum ConfigType {
    ARRAY = "array",
    BOOLEAN = "boolean",
    NUMBER = "number",
    OBJECT = "object",
    STRING = "string",
    UNSUPPORTED = "unsupported",
}

enum ArrayType {
    BOOLEAN = "boolean",
    NUMBER = "number",
    STRING = "string",
}

interface MetaData {
    orgName: string;
    packageName: string;
}

interface Element {
    id: string;
    isArray: boolean;
    name: string;
    required: boolean;
    type: ConfigType;
    value?: number | string | boolean | number[] | string[] | boolean[];
}

interface Property {
    id: string;
    name: string;
    properties?: Array<Element | Property>;
}

function getPackageConfig(configSchema: object): object {
    const orgConfig: object = configSchema[PROPERTIES];
    const orgName = Object.keys(orgConfig)[0];

    const packageConfig: object = orgConfig[orgName][PROPERTIES];
    const packageName = Object.keys(packageConfig)[0];

    // Set the metadata values
    setMetaData(orgName, packageName);

    return packageConfig[packageName];
}

function setMetaData(orgName: string, packageName: string) {
    metaData = {
        orgName,
        packageName,
    };
}

function setProperties(configObj: object, id: string = "1", name: string = "root") {
    const propertiesObj: object = configObj[PROPERTIES];
    const requiredProperties: string[] = configObj[REQUIRED];
    const property: Property = { id: String(id), name, properties: [] };

    Object.keys(propertiesObj).forEach((key, index) => {
        let isArrayProperty: boolean = false;
        const configPropertyValues = propertiesObj[key];
        let configPropertyType: string = configPropertyValues[TYPE];

        if (configPropertyType === ConfigType.OBJECT) {
            // Iterate through nested objects.
            const childProperty: Property = setProperties(configPropertyValues, id + "-" + (index + 1), key);
            property.properties.push(childProperty);
        } else {
            // Handle array values.
            if (configPropertyType === ConfigType.ARRAY) {
                isArrayProperty = true;
                configPropertyType = configPropertyValues[ITEMS][TYPE];
            }

            const required = isRequired(key, requiredProperties);
            const idValue = property.id + "-" + (index + 1);

            const element: Element = setElement(idValue, isArrayProperty, configPropertyType, key, required);
            if (element) {
                property.properties.push(element);
            }
        }
    });
    return property;
}

function setExistingValues(properties: Property, configs: object) {
    const orgName = Object.keys(configs)[0];
    const packageConfig: object = configs[orgName];
    const packageName = Object.keys(packageConfig)[0];

    // Validate the existing values with the config schema
    if (orgName !== metaData.orgName || packageName !== metaData.packageName) {
        // tslint:disable-next-line: no-console
        console.debug("Mismatching metadata found in the config schema and existing data");
        return;
    }

    // Existing config values without metadata
    const configValues = packageConfig[packageName];
    // Existing property values without metadata
    const configProperties = properties[PROPERTIES];

    setConfigValue(configProperties, configValues);

    properties[PROPERTIES] = configProperties;
    return properties;
}

function setConfigValue(configProperties: object, configValues: object) {
    Object.keys(configProperties).forEach((key) => {
        if (instanceOfElement(configProperties[key])) {
            const value = getValue(configProperties[key].name, configValues);
            configProperties[key].value = value;
        } else {
            const value = getValue(configProperties[key].name, configValues);
            setConfigValue(configProperties[key][PROPERTIES], value);
        }
    });
}

function instanceOfElement(data: any): boolean {
    return data.type !== undefined;
}

function getValue(key: string, obj: object): any {
    const keys = Object.keys(obj).filter((x) => x === key);
    if (keys.length > 0) {
        return obj[keys[0]];
    }
}

function setElement(id: string, isArray: boolean, type: string, name: string, required: boolean): Element {
    return {
        id,
        isArray,
        name,
        required,
        type: getType(type),
    };
}

// Check if a property is required.
function isRequired(propertyName: string, requiredList: string[]): boolean {
    let required: boolean = false;
    if (requiredList && requiredList.length > 0) {
        required = requiredList.indexOf(propertyName) > -1;
    }
    return required;
}

// Get the enum from a string value.
function getType(type: string): ConfigType {
    // Handle a possible inconsistency in the language feature.
    if (type === "integer") {
        type = "number";
    }

    const keys = Object.keys(ConfigType).filter((x) => ConfigType[x] === type);
    return keys.length > 0 ? ConfigType[keys[0]] : ConfigType.UNSUPPORTED;
}

// -----------------------------------

export interface ConfigProperty {
    id: string;
    name: string;
    type: ConfigType;
    description: string;
    required: boolean;
    value?: string;
}

export interface ConfigProperties {
    moduleName: string;
    properties: ConfigProperty[];
}

export interface ConfigFormProps {
    configSchema: object;
    defaultButtonText: string;
    primaryButtonText: string;
    onClickDefaultButton: () => void;
    onClickPrimaryButton: (configProperties: ConfigProperties[]) => void;
}

function isUserDefinedModule(propertyObj: any): boolean {
    let isModule = false;
    Object.keys(propertyObj).forEach((key) => {
        if (key === "properties") {
            isModule = true;
        }
    });
    return isModule;
}

export const ConfigForm = ({
    configSchema,
    defaultButtonText,
    primaryButtonText,
    onClickDefaultButton,
    onClickPrimaryButton,
  }: ConfigFormProps) => {
    const [configs, setConfigs] = useState(new Array<ConfigProperties>());
    const [submitType, setSubmitType] = useState("");

    // ---------
    const packageConfig: object = getPackageConfig(configSchema);
    let properties = setProperties(packageConfig);
    setExistingValues(properties, existingConfigs);
    console.log(properties);

    const configJsonSchema = configSchema;

    let schemaProperties: any;
    let projectProperties: any;
    let packageProperties: any;
    let requiredProperties: any;
    let moduleProperties: any;
    let allProperties: any;
    const configProperties: ConfigProperties[] = [];

    Object.keys(configJsonSchema).forEach((key) => {
        if (key === "properties") {
            schemaProperties = configJsonSchema[key];
        }
    });

    Object.keys(schemaProperties).forEach((key) => {
        if (key !== "" || key !== undefined) {
            projectProperties = schemaProperties[key].properties;
        }
    });

    Object.keys(projectProperties).forEach((key) => {
        if (key !== "" || key !== undefined) {
            packageProperties = projectProperties[key];
        }
    });

    Object.keys(packageProperties).forEach((key) => {
        if (key === "required") {
            requiredProperties = packageProperties[key];
        }
        if (key === "properties") {
            allProperties = packageProperties[key];
        }
    });

    Object.keys(allProperties).forEach((key) => {
        if (isUserDefinedModule(allProperties[key])) {
            moduleProperties = allProperties[key].properties;
            Object.keys(moduleProperties).forEach((moduleKey) => {
                addConfig(moduleProperties[moduleKey], key, moduleKey);
            });
        } else {
            addConfig(allProperties[key], "default", key);
        }
    });

    function addConfig(propertyObj: any, moduleName: string, configName: string) {
        let isRequired = false;
        if (requiredProperties) {
            requiredProperties.forEach((element: any) => {
                if (configName === element) {
                    isRequired = true;
                }
            });
        }

        const moduleEntry = configProperties.findIndex((e) => e.moduleName === moduleName);
        const config: ConfigProperty = {
            description: propertyObj[DESCRIPTION],
            id: moduleName + "-" + configName,
            name: configName,
            required: isRequired,
            type: propertyObj[TYPE],
        };

        if (configProperties[moduleEntry] !== undefined) {
            configProperties[moduleEntry].properties.push(config);
        } else {
            configProperties.push({ moduleName, properties: [config] });
        }
    }

    // TODO: Updating the form with existing config values

    const handleSubmit = (event: any) => {
        event.preventDefault();
        // TODO: Handle the submit for Choreo Console and Low Code based on a prop
        // console.log(JSON.stringify(configs));
        if (submitType === defaultButtonText) {
            onClickDefaultButton();
        } else if (submitType === primaryButtonText) {
            onClickPrimaryButton(configs);
        }
    };

    const handleSetConfigs = (e: ConfigProperties) => {
        const existingConfig = configs.findIndex((property) => property.moduleName === e.moduleName);
        if (existingConfig > -1) {
            configs[existingConfig].properties = e.properties;
        } else {
            configs.push(e);
        }
        setConfigs(configs);
    };

    const getConfigForm = (configProperty: ConfigProperties, index: number) => {
        return (
            <div key={index}>
                <Box m={2} pt={3}>
                    <h3>
                        Module:{" "}
                        <span style={{ fontFamily: "Verdana", color: "#3f51b5" }}>
                            {configProperty.moduleName}
                        </span>
                    </h3>
                    <ConfigElements
                        key={index}
                        elements={configProperty.properties}
                        moduleName={configProperty.moduleName}
                        setConfigs={handleSetConfigs}
                    />
                </Box>
            </div>
        );
    };

    const handleSetSubmitType = (value: string) => {
        setSubmitType(value);
    };

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
                                {configProperties.map(getConfigForm)}
                                <CardActions style={{ justifyContent: "center" }}>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            onClick={handleSetSubmitType.bind(this, defaultButtonText)}
                                        >
                                            {defaultButtonText}
                                        </Button>
                                    </Box>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            onClick={handleSetSubmitType.bind(this, primaryButtonText)}
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
