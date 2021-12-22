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
    return toml.parse(tomlContent);
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
export function parseConfigToToml(configInputs: any): string {

    configProperties = [];
    // Iterate the root level configurable values.
    configInputs.properties.forEach((object: any) => {
        const configProperty: ConfigProperty = {
            configs: [],
            headerNames: [],
        };
        getConfigProperty(object, configProperty);
    });

    return configToTomlString(configProperties);
}

function getConfigProperty(object: any, configProperty: ConfigProperty) {
    if (object.hasOwnProperty("properties")) {
        configProperty.headerNames.push(object.name);
        object.properties.forEach((entry: any) => {
            const newProperty: ConfigProperty = {
                configs: [],
                headerNames: configProperty.headerNames,
            };
            if (entry.hasOwnProperty("properties")) {
                return getConfigProperty(entry, newProperty);
            } else {
                return getLeafConfig(entry, newProperty);
            }
        });
    } else {
        return getLeafConfig(object, configProperty);
    }
}

function getLeafConfig(object: any, configProperty: ConfigProperty) {
    const name: string = "name";
    const value: string = "value";
    const headers = [...configProperty.headerNames];

    if (object[name] === undefined || object[value] === undefined || object[value] === '' || object[value] === null) {
        return;
    }

    let intValues: any = object[value];
    if (object.type === "integer") {
        intValues = Number(object[value]);
    }

    const newConfigElement: ConfigValue = {
        configName: object[name],
        configValue: intValues,
    };

    const found = configProperties.some((element) => element.headerNames.join(".") === headers.join("."));
    if (!found) {
        configProperties.push({ headerNames: headers, configs: [newConfigElement] });
    } else {
        configProperties.find((element) => element.headerNames.join(".") === headers.join("."))!
            .configs.push(newConfigElement);
    }
}

function configToTomlString(configs: ConfigProperty[]): string {
    let configToml: string = "";
    configs.forEach((entry: ConfigProperty) => {
        if (entry.headerNames.length > 0) {
            let header: string = "";
            header = entry.headerNames.join(".");
            configToml = configToml.concat(`\n[${header}]\n`);
        }
        if (entry.configs) {
            entry.configs.forEach((element: ConfigValue) => {
                const configVal: any = element.configValue;
                configToml = configToml.concat(`${element.configName} = ${JSON.stringify(configVal)}\n`);
            });
        }
    });
    return configToml;
}

