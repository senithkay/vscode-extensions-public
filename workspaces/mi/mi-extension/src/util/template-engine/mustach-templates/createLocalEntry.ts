/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as fs from "fs";

export function generateXmlData(
    name: string,
    type: string,
    value: string,
    URL: string
): string {
    const localEntryType = type.toLowerCase();
    let localEntryAttributes = "";
    let otherAttributes = "";
    let closingAttributes = `</${localEntryType}>`;
    if (localEntryType === "in-line text entry") {
        localEntryAttributes = `<![CDATA[${value}]]>`;
    } else if (localEntryType === "in-line xml entry") {
        const match = value.match(/<xml[^>]*>([\s\S]*?)<\/xml>/i);
        const filteredCode = match ? match[1] : "";
        localEntryAttributes = `<xml>${filteredCode}</xml>`;
    } else if (localEntryType=== "source url entry") {
        otherAttributes = `src="${URL}"`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
    <localEntry key="${name}" ${otherAttributes} xmlns="http://ws.apache.org/ns/synapse">
        ${localEntryAttributes}
    </localEntry>`;
}

export function writeXmlDataToFile(filePath: string, xmlData: string): void {
    fs.writeFileSync(filePath, xmlData);
}
