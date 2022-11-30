/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export const DM_UNSUPPORTED_TYPES = [
    PrimitiveBalType.Enum,
    PrimitiveBalType.Error,
    PrimitiveBalType.Json,
    PrimitiveBalType.Union,
    PrimitiveBalType.Xml
];

// Input types that the dm were supporting even before expanding the type support
export const DM_SUPPORTED_INPUT_TYPES = [
    PrimitiveBalType.Boolean,
    PrimitiveBalType.Decimal,
    PrimitiveBalType.Float,
    PrimitiveBalType.Int,
    PrimitiveBalType.Record,
    PrimitiveBalType.String
];

const balVersionRegex = new RegExp("^[0-9]{4}.[0-9]+.[0-9]+");

export function isDMSupported(version: string): boolean {
    if (!version) {
        return false;
    }
    const versionStr = version.match(balVersionRegex);
    const splittedVersions = versionStr[0]?.split(".");
    if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) === 1)) {
        // 2201.1.x
        return (parseInt(splittedVersions[2], 10) >= 2);
    } else  if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) === 2)) {
        // 2201.2.x
        return (parseInt(splittedVersions[2], 10) >= 1);
    } else  if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) > 2)) {
        // > 2201.2
        return true;
    } else  if (parseInt(splittedVersions[0], 10) > 2201) {
        // > 2201 (eg: 2301, 2202)
        return true;
    } else {
        return false;
    }
}

export function isArraysSupported(version: string): boolean {
    if (!version) {
        return false;
    }
    const versionStr = version.match(balVersionRegex);
    const splittedVersions = versionStr[0]?.split(".");
    if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) === 1)) {
        // >= 2201.1.3
        return (parseInt(splittedVersions[2], 10) >= 3);
    } else  if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) === 2)) {
        // >= 2201.2.4
        return (parseInt(splittedVersions[2], 10) >= 4);
    } else  if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) === 3)) {
        // >= 2201.3.1
        return (parseInt(splittedVersions[2], 10) >= 1);
    } else  if ((parseInt(splittedVersions[0], 10) === 2201) && (parseInt(splittedVersions[1], 10) > 3)) {
        // > 2201.3
        return true;
    } else  if (parseInt(splittedVersions[0], 10) > 2201) {
        // > 2201 (eg: 2301, 2202)
        return true;
    } else {
        return false;
    }
}
