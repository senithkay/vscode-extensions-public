/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debug } from "../utils/logger";
import toml from "toml";

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
