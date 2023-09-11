/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debug } from "../utils/logger";
import toml from "toml";
import { ConfigProperty, ConfigValue, Constants } from "./model";

let configProperties: ConfigProperty[] = [];

/**
 * Convert the TOML content into JSON object.
 * @param tomlContent The TOML content as a string value.
 */
export function parseTomlToConfig(tomlContent: string): object {
    try {
        return toml.parse(tomlContent);
    } catch (error) {
        debug("Error while parsing the Config.toml file content: " + error);
    }
    return {};
}

/**
 * Use the TOML content to create a JSON accepted by the configurable editor for existing values.
 * @param tomlContent The TOML content as a JSON value.
 */
export function generateExistingValues(tomlContent: object, orgName: string, packageName: string): object {
    return {
        [orgName]: {
            [packageName]: tomlContent
        }
    };
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
            id: configObject.id,
            configs: [],
            headerNames: [],
        };
        addConfigProperties(configObject, configProperty, packageName);
    });
    return configToTomlString(configProperties);
}

function addConfigProperties(configObject: any, configProperty: ConfigProperty, packageName: string) {
    const type: string = configObject[Constants.TYPE];
    const arrayType: string = configObject[Constants.ARRAY_TYPE];
    switch(type) {
        case Constants.OBJECT: {
            if (configObject.hasOwnProperty(Constants.PROPERTIES)) {
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
                    if (entry.hasOwnProperty(Constants.PROPERTIES)) {
                        addConfigProperties(entry, newProperty, packageName);
                    } else {
                        getLeafConfig(entry, newProperty);
                    }
                });
                if (configObject.name && configObject.name !== "") {
                    configProperty.headerNames.pop();
                }
            } else if (arrayType === Constants.OBJECT) {
                return getLeafConfig(configObject, configProperty);
            }
           break;
        }
        case Constants.MODULE: {
            configProperty.headerNames.push(packageName);
            if (configObject.hasOwnProperty(Constants.PROPERTIES)) {
                configProperty.headerNames.push(configObject.name);
                configObject.properties.forEach((entry: any) => {
                    const newProperty: ConfigProperty = {
                        id: configProperty.id + "-" + 1,
                        configs: [],
                        headerNames: configProperty.headerNames,
                    };
                    if (entry.hasOwnProperty(Constants.PROPERTIES)) {
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
        case Constants.ARRAY: {
            let counter: number = 1;
            const newProperty: ConfigProperty = {
                id: configProperty.id + "-" + counter,
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (arrayType === Constants.OBJECT) {
                newProperty.headerNames.push(configObject[Constants.NAME]);
                newProperty.isNested = true;
                const objectArrayValue = configObject[Constants.VALUE];
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
        case Constants.ANY_OF: {
            const anyOfValue = configObject[Constants.VALUE];
            const newProperty: ConfigProperty = {
                id: configProperty.id + "-" + 1,
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (anyOfValue.hasOwnProperty(Constants.PROPERTIES)) {
                addConfigProperties(anyOfValue, newProperty, packageName);
            } else {
                getLeafConfig(anyOfValue, newProperty);
            }
            break;
        }
        case Constants.ENUM: {
            const enumValue = configObject[Constants.VALUE];
            const newProperty: ConfigProperty = {
                id: configProperty.id + "-" + 1,
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (enumValue.hasOwnProperty(Constants.PROPERTIES)) {
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

    if (configType === Constants.ARRAY) {
        const valueList: any = element.configValue;
        if (configArrayType === Constants.FLOAT) {
            let arrayValue: string = "[";
            valueList.forEach((entry: any) => {
                arrayValue = arrayValue.concat(entry + ", ");
            });
            returnValue = arrayValue.slice(0, -2).concat("]");
        } else {
            returnValue = JSON.stringify(valueList);
        }
    } else {
        returnValue = getSimpleTypeValue(element.configValue, element.configType);
    }
    return returnValue;
}

function getLeafConfig(object: any, configProperty: ConfigProperty) {
    const headers = [...configProperty.headerNames];

    if (object[Constants.NAME] === undefined || object[Constants.VALUE] === undefined
        || object[Constants.VALUE] === '' || object[Constants.VALUE] === null) {
        return configProperty;
    }

    const configElement: ConfigValue = {
        configName: object[Constants.NAME],
        configType: object[Constants.TYPE],
        configValue: object[Constants.VALUE],
        configArrayType: object[Constants.ARRAY_TYPE],
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
    return type === Constants.FLOAT || type === Constants.INTEGER ? value : JSON.stringify(value);
}
