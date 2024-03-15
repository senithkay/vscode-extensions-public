/**
* Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
* You may not alter or remove any copyright or other notice from copies of this content.
*/

import { API, NamedSequence, Proxy, Endpoint } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export enum SYNTAX_TREE_KIND {
    API = "api",
    SEQUENCE = "sequence",
    PROXY = "proxy",
    ENDPOINT = "endpoint"
}

export type SyntaxTreeMi = {
    [SYNTAX_TREE_KIND.API]: API;
    [SYNTAX_TREE_KIND.SEQUENCE]: NamedSequence;
    [SYNTAX_TREE_KIND.PROXY]: Proxy;
    [SYNTAX_TREE_KIND.ENDPOINT]: Endpoint;
}
