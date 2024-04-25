/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Bam } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getBamMustacheTemplate() {

    return `
    <bam {{#description}}description="{{description}}"{{/description}} >
        <serverProfile name="{{serverProfileName}}">
            <streamConfig name="{{streamName}}" version="{{streamVersion}}"/>
        </serverProfile>
    </bam>
    `;
}

export function getBamFormDataFromSTNode(data: { [key: string]: any }, node: Bam) {

    data.serverProfileName = node.serverProfile?.name;
    data.streamName = node.serverProfile?.streamConfig?.name;
    data.streamVersion = node.serverProfile?.streamConfig?.version;
    return data;
}
