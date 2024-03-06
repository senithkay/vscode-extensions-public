/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export function getEditServiceTemplate() {
    return `<api name="{{name}}" context="{{context}}" version="{{version}}" version-type="{{version_type}}">`
}

export function getAddApiResourceTemplate() {
    return `{{{indentation}}}<resource methods="{{methods}}"{{#uri_template}} uri-template="{{{uri_template}}}"{{/uri_template}}{{#url_mapping}} url-mapping="{{{url_mapping}}}"{{/url_mapping}}>
    {{{indentation}}}<inSequence>
    {{{indentation}}}</inSequence>
    {{{indentation}}}<faultSequence>
    {{{indentation}}}</faultSequence>
{{{indentation}}}</resource>`;
}
