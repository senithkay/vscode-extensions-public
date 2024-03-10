/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";

export function getSequenceMustacheTemplate() {
    return `<sequence {{#staticReferenceKey}}key="{{staticReferenceKey}}"{{/staticReferenceKey}} {{#dynamicReferenceKey}}key="{{dynamicReferenceKey}}"{{/dynamicReferenceKey}} {{#description}}description="{{description}}"{{/description}}/>`;
}

export function getSequenceXml(data: { [key: string]: any }) {
    if (data.referringSequenceType === "Static") {
        delete data.dynamicReferenceKey;
    } else if (data.referringSequenceType === "Dynamic") {
        delete data.staticReferenceKey;
    }
    return Mustache.render(getSequenceMustacheTemplate(), data);
}

export function getSequenceDataFromSTNode(data: { [key: string]: any }) {
    if (data.staticReferenceKey) {
        data.referringSequenceType = "Static";
    } else if (data.dynamicReferenceKey) {
        data.referringSequenceType = "Dynamic";
    }
    return data;
}
