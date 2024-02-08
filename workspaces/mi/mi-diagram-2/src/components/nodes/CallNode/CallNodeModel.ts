/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Endpoint, STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodeTypes } from "../../../resources/constants";
import { BaseNodeModel } from "../BaseNodeModel";

export class CallNodeModel extends BaseNodeModel {
    readonly endpoint: Endpoint;

    constructor(stNode: STNode, parentNode?: STNode, prevNodes: STNode[] = [], endpoint?: Endpoint) {
        super(NodeTypes.CALL_NODE, stNode, parentNode, prevNodes);
        if (endpoint) {
            this.endpoint = endpoint;
        }
    }

    getEndpoint(): STNode {
        return this.endpoint;
    }
}
