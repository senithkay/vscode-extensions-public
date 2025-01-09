/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function formatForConfigurable(value: string): string {
    return `$config:${value}`;
}
  
export function removeConfigurableFormat(formattedValue: string): string {
    const prefix = "$config:";
    if (formattedValue.startsWith(prefix)) {
        return formattedValue.slice(prefix.length);
    }
    return formattedValue;
}

export function isConfigurable(value: string): boolean {
    const pattern = /^\$config:/;
    return pattern.test(value);
}

export function isCertificateFileName(value: string): boolean {
    const certificateExtension = ".crt";
    return value.endsWith(certificateExtension);
}

/**
 * Compares two semantic version strings (v1 and v2) and returns:
 * - `1` if v1 > v2
 * - `-1` if v1 < v2
 * - `0` if v1 == v2
 *
 * @param v1 - First semantic version string.
 * @param v2 - Second semantic version string.
 * @returns A number indicating the comparison result.
 * 
 * @throws Error if either version is invalid.
 */
export function compareVersions(v1: string, v2: string): number {
    const isValidVersion = (version: string): boolean => {
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;
        return semverRegex.test(version);
    };

    if (!isValidVersion(v1) || !isValidVersion(v2)) {
        throw new Error("Invalid versions");
    }

    const [major1, minor1, patch1] = v1.split(/[-.]/).map(part => isNaN(Number(part)) ? part : Number(part));
    const [major2, minor2, patch2] = v2.split(/[-.]/).map(part => isNaN(Number(part)) ? part : Number(part));

    if (major1 !== major2) return major1 > major2 ? 1 : -1;
    if (minor1 !== minor2) return minor1 > minor2 ? 1 : -1;
    if (patch1 !== patch2) return patch1 > patch2 ? 1 : -1;

    return 0;
}
