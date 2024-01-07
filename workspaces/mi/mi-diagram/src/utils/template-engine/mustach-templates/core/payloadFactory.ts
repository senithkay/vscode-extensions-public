/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PayloadFactory } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getPayloadFormDataFromSTNode(data: { [key: string]: any }, node: PayloadFactory) {
    if (node.mediaType) {
        data.mediaType = node.mediaType;
    }
    if (node.templateType) {
        data.templateType = node.templateType;
    }
    if (node.format) {
        data.format = node.format;
    }
    if (node.args) {
        data.args = node.args;
    }

    return data;
}
