/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";

export interface APIResourceArgs {
    methods: string[];
    uriTemplate: string;
}

function getAPIResourceMustacheTemplate() {
    return `<resource methods="{{methods}}"{{#uriTemplate}} uri-template="{{uriTemplate}}"{{/uriTemplate}}>
    <inSequence>
    </inSequence>
    <faultSequence>
    </faultSequence>
</resource>`;
};

export function getAPIResourceXml(data: any) {
    data.methods = data.methods.join(" ");
    return render(getAPIResourceMustacheTemplate(), data);
}

