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

import toml from "toml";
import { ConfigProperty, ConfigValue } from "./model";

let configProperties: ConfigProperty[] = [];

/**
 * Convert the TOML content into JSON object.
 * @param tomlContent The TOML content as a string value.
 */
export function parseTomlToConfig(tomlContent: string): object {
    try {
        return toml.parse(tomlContent);
    } catch (error) {
        console.debug("Error while parsing the Config.toml file content: " + error);
    }
    return {};
}

/**
 * Use the TOML content to create a JSON accepted by the configurable editor for existing values.
 * @param tomlContent The TOML content as a JSON value.
 */
export function generateExistingValues(tomlContent: object, orgName: string, packageName: string): object {
    let returnObj: object = { orgName };
    returnObj[orgName] = { packageName };
    returnObj[orgName][packageName] = tomlContent;
    return returnObj;
}

/**
 * Extract a TOML string from the data object received from the configurable editor on submit. 
 * @param configInputs The JSON data object received from the configurable editor on primary button click.
 */
 export function parseConfigToToml(configInputs: any, packageName: string): string {
    configProperties = [];

    // Iterate the root level configurable values.
    configInputs.properties.forEach((configObject: any) => {
        const configProperty: ConfigProperty = {
            id: "1",
            configs: [],
            headerNames: [],
        };
        addConfigProperties(configObject, configProperty, packageName);
    });
    return configToTomlString(configProperties);
}

function addConfigProperties(configObject: any, configProperty: ConfigProperty, packageName: string) {
    const type: string = configObject["type"];
    const arrayType: string = configObject["arrayType"];
    switch(type) {
        case "object": {
            if (configObject.hasOwnProperty("properties")) {
                if (configObject.name && configObject.name !== "") {
                    configProperty.headerNames.push(configObject.name);
                }
                configObject.properties.forEach((entry: any) => {
                    const newProperty: ConfigProperty = {
                        id: configProperty.id + "-" + 1,
                        configs: [],
                        headerNames: configProperty.headerNames,
                        isNested: configProperty.isNested,
                    };
                    if (entry.hasOwnProperty("properties")) {
                        addConfigProperties(entry, newProperty, packageName);
                    } else {
                        getLeafConfig(entry, newProperty);
                    }
                });
                if (configObject.name && configObject.name !== "") {
                    configProperty.headerNames.pop();
                }
            } else if (arrayType === "object") {
                return getLeafConfig(configObject, configProperty);
            }
           break;
        }
        case "module": {
            configProperty.headerNames.push(packageName);
            if (configObject.hasOwnProperty("properties")) {
                configProperty.headerNames.push(configObject.name);
                configObject.properties.forEach((entry: any) => {
                    const newProperty: ConfigProperty = {
                        id: configProperty.id + "-" + 1,
                        configs: [],
                        headerNames: configProperty.headerNames,
                    };
                    if (entry.hasOwnProperty("properties")) {
                        addConfigProperties(entry, newProperty, packageName);
                    } else {
                        getLeafConfig(entry, newProperty);
                    }
                });
                configProperty.headerNames.pop();
            } else {
                getLeafConfig(configObject, configProperty);
            }
            configProperty.headerNames.pop();
            break;
        }
        case "array": {
            let counter: number = 1;
            const newProperty: ConfigProperty = {
                id: configProperty.id + "-" + counter,
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (arrayType === "object") {
                newProperty.headerNames.push(configObject["name"]);
                newProperty.isNested = true;
                const objectArrayValue = configObject["value"];
                objectArrayValue.forEach( (element) => {
                    newProperty.id = configProperty.id + "-" + counter,
                    addConfigProperties(element, newProperty, packageName);
                    counter = counter + 1;
                });
            } else {
                getLeafConfig(configObject, newProperty);
            }
            break;
        }
        case "anyOf": {
            const anyOfValue = configObject["value"];
            const newProperty: ConfigProperty = {
                id: configProperty.id + "-" + 1,
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (anyOfValue.hasOwnProperty("properties")) {
                addConfigProperties(anyOfValue, newProperty, packageName);
            } else {
                getLeafConfig(anyOfValue, newProperty);
            }
            break;
        }
        case "enum": {
            const enumValue = configObject["value"];
            const newProperty: ConfigProperty = {
                id: configProperty.id + "-" + 1,
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (enumValue.hasOwnProperty("properties")) {
                addConfigProperties(enumValue, newProperty, packageName);
            } else {
                getLeafConfig(configObject, newProperty);
            }
            break;
        }
        default: {
            getLeafConfig(configObject, configProperty);
        }
    }
}

function configToTomlString(configs: ConfigProperty[]): string {
    let configToml: string = "";
    configs.sort(function(first, second) {
        return first.headerNames.length - second.headerNames.length;
    });
    configs.forEach((entry: ConfigProperty) => {
        if (entry.headerNames.length > 0) {
            let header: string = "";
            header = entry.headerNames.join(".");
            if (entry.isNested) {
                configToml = configToml.concat(`\n[[${header}]]\n`);
            } else {
                configToml = configToml.concat(`\n[${header}]\n`);
            }

            if (entry.configs) {
                entry.configs.forEach((element: ConfigValue) => {
                    configToml = configToml.concat(`${element.configName} = ${getConfigJsonValue(element)}\n`);
                });
            }
        } else {
            if (entry.configs) {
                entry.configs.forEach((element: ConfigValue) => {
                    configToml = (`${element.configName} = ${getConfigJsonValue(element)}\n`).concat(configToml);
                });
            }
        }
    });
    return configToml;
}

function getConfigJsonValue(element: ConfigValue) {
    const configType: string = element.configType;
    const configArrayType: any = element.configArrayType;
    let returnValue: any;

    if (configType === "array") {
        const valueList: any = element.configValue;
        if (configArrayType === "float") {
            let arrayValue: string = "[";
            valueList.forEach((entry: any) => {
                arrayValue = arrayValue.concat(entry + ", ");
            });
            returnValue = arrayValue.slice(0, -2).concat("]")
        } else {
            returnValue = JSON.stringify(valueList);
        }
    } else {
        returnValue = getSimpleTypeValue(element.configValue, element.configType);
    }
    return returnValue;
}

function getLeafConfig(object: any, configProperty: ConfigProperty) {
    const name: string = "name";
    const value: string = "value";
    const type: string = "type";
    const arrayType: string = "arrayType";
    const headers = [...configProperty.headerNames];

    if (object[name] === undefined || object[value] === undefined || object[value] === '' || object[value] === null) {
        return configProperty;
    }

    const configElement: ConfigValue = {
        configName: object[name],
        configType: object[type],
        configValue: object[value],
        configArrayType: object[arrayType],
    };

    const found = configProperties.some((element) => element.id === configProperty.id);
    if (!found) {
        configProperties.push({ headerNames: headers, configs: [configElement], id: configProperty.id,
            isNested: configProperty.isNested });
    } else {
        configProperties.find((element) => element.id === configProperty.id)!.configs.push(configElement);
    }
}

function getSimpleTypeValue(value: any, type: string) {
    let returnValue: any;

    if (type === "float") {
        returnValue = value;
    } else {
        returnValue = JSON.stringify(value);
    }
    return returnValue;
}
