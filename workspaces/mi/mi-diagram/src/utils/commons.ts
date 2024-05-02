/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ParamConfig, ParamValueConfig } from "../components/Form/ParamManager/ParamManager";

export const FirstCharToUpperCase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Checks if the given dirty keys exist in the attributes
export function checkAttributesExist(dirtyKeys: string[], attributes: string[]) {
    return dirtyKeys.some(key => attributes.includes(key));
}

export function generateSpaceSeperatedStringFromParamValues(paramConfig: ParamConfig) {
    let result = "";
    paramConfig.paramValues?.forEach(param => {
        // if param.value is an object
        if (typeof param.value === "string") {
            result += param.value + " ";
        } else {
            const pc = param?.value as ParamConfig;
            pc?.paramValues?.forEach(p => {
                result += p.key + " ";
            });
        }
    });
    return result.trim();
};