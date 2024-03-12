/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import Mustache from "mustache";

export const getEditApiResourceTemplate = () => {
    return `<resource methods="{{methods}}"{{#uri_template}} uri-template="{{{uri_template}}}"{{/uri_template}}{{#url_mapping}} url-mapping="{{{url_mapping}}}"{{/url_mapping}}>`
}

export const getEditSequenceTemplate = () => {
    return `<sequence name="{{name}}"{{#trace}} trace="{{{trace}}}"{{/trace}}{{#statistics}} statistics="{{{statistics}}}"{{/statistics}}{{#onError}} onError="{{{onError}}}"{{/onError}}>`
}

export const getEditApiResourceXml = (data: { [key: string]: any }) => {
    return Mustache.render(getEditApiResourceTemplate(), data);
}

export const getEditSequenceXml = (data: { [key: string]: any }) => {
    return Mustache.render(getEditSequenceTemplate(), data);
}

