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
export function isDMSupported(version: string): boolean {
    if (!version) {
        return false;
    }
    const versionRegex = new RegExp("^[0-9]{4}.[0-9]+.[0-9]+");
    const versionStr = version.match(versionRegex);
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
