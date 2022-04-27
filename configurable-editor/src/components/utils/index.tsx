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
import { __String } from "typescript";

import { ConfigElementProps } from "../ConfigElement";
import { ConfigSchema, ConfigType, MetaData, SchemaConstants } from "../model";

/**
 * Gets the `ConfigType` enum type from a string value.
 * @param type The config type as a string value.
 * @returns    The corresponding `ConfigType` enum.
 */
export function getType(type: string): ConfigType {
    if (type === ConfigType.NUMBER) {
        type = ConfigType.FLOAT;
    }
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
                                    requiredItem = true): ConfigElementProps {
    const propertiesObj: object = configObj[SchemaConstants.PROPERTIES];
    const addPropertiesObj: object = configObj[SchemaConstants.ADDITIONAL_PROPERTIES];
    const requiredProperties: string[] = configObj[SchemaConstants.REQUIRED];
    const propertyType: string = configObj[SchemaConstants.TYPE];
    const propertyDesc: string = configObj[SchemaConstants.DESCRIPTION];

    const configProperty: ConfigElementProps = {
        description: propertyDesc,
        id: String(id),
        isRequired: requiredItem,
        name,
        properties: [],
        type: getType(propertyType),
    };

    if (propertiesObj === undefined) {
        return {
            ...configProperty,
            schema: addPropertiesObj,
        };
    }

    Object.keys(propertiesObj).forEach((key, index) => {
        const configPropertyValues = propertiesObj[key];
        const unionType: string = configPropertyValues[SchemaConstants.ANY_OF];
        const configPropertyType: string = configPropertyValues[SchemaConstants.TYPE];
        const configPropertyDesc: string = configPropertyValues[SchemaConstants.DESCRIPTION];
        const properties: object = configPropertyValues[SchemaConstants.PROPERTIES];
        const required = isRequired(key, requiredProperties);

        const element: ConfigElementProps = {
            description: configPropertyDesc,
            id: configProperty.id + "-" + (index + 1),
            isRequired: required,
            name: key,
            schema: configPropertyValues,
            type: unionType !== undefined ? ConfigType.ANY_OF : getType(configPropertyType),
        };

        if (configPropertyType === ConfigType.OBJECT && properties !== undefined) {
            const childProperty: ConfigElementProps = getConfigProperties(configPropertyValues,
                id + "-" + (index + 1), key, required);
            childProperty.type = ConfigType.OBJECT;
            childProperty.description = configPropertyDesc;
            childProperty.schema = configPropertyValues;
            configProperty.properties.push(childProperty);
        } else {
            configProperty.properties.push(element);
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
export function isRequired(propertyName: string, requiredList: string[]): boolean {
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
export function setExistingValues(properties: ConfigElementProps,
                                  configs: object, metaData: MetaData): ConfigElementProps {
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
 * Returns a `MetaData` object containing the values of orgName and packageName.
 * @param configSchema The original config schema object.
 * @returns            The `MetaData` object.
 */
export function getMetaData(configSchema: ConfigSchema): MetaData {
    const orgConfig: object = configSchema.properties;
    const orgName = Object.keys(orgConfig)[0];

    const packageConfig: object = orgConfig[orgName][SchemaConstants.PROPERTIES];
    const packageName = Object.keys(packageConfig)[0];

    return {
        orgName,
        packageName,
    };
}

/**
 * Returns the config schema values for a package, removes the 2 top most root
 * properties and sets the meta data values.
 * @param configSchema The original config schema object.
 * @returns            The config schema object without the 2 top most root properties.
 */
export function getPackageConfig(configSchema: ConfigSchema): object {
    const orgConfig: object = configSchema.properties;
    const orgName = Object.keys(orgConfig)[0];

    const packageConfig: object = orgConfig[orgName][SchemaConstants.PROPERTIES];
    const packageName = Object.keys(packageConfig)[0];

    return packageConfig[packageName];
}

/**
 * Recursively set config values to config properties, including the nested objects.
 * @param configProperties The config properties object, could be a `ConfigProperty` or `ConfigElement`.
 * @param configValues     The config values object, could be a nested value.
 */
export function setConfigValue(configProperties: ConfigElementProps[], configValues: object): ConfigElementProps[] {
    if (configProperties === undefined) {
        return;
    }
    Object.keys(configProperties).forEach((key) => {
        const value = getValue(configProperties[key].name, configValues);
        if (value !== undefined) {
            configProperties[key].value = value;
        }
    });
    return configProperties;
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
