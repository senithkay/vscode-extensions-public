/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Endpoint, STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { NODE_DIMENSIONS, NodeTypes } from "../../../resources/constants";
import { BaseNodeModel } from "../BaseNodeModel";
import { Diagnostic } from "vscode-languageserver-types";

export class CallNodeModel extends BaseNodeModel {
    readonly endpoint: Endpoint;
    readonly nodeWidth = NODE_DIMENSIONS.CALL.WIDTH;
    readonly nodeHeight = NODE_DIMENSIONS.CALL.HEIGHT;

    constructor(stNode: STNode, mediatorName:string, documentUri: string, parentNode?: STNode, prevNodes: STNode[] = [], endpoint?: Endpoint) {
        super(NodeTypes.CALL_NODE, mediatorName, documentUri, stNode, parentNode, prevNodes);
        if (endpoint) {
            this.endpoint = endpoint;
        }
    }

    getEndpoint(): STNode {
        return this.endpoint;
    }

    endpointHasDiagnostics(): boolean {
        return this.endpoint?.diagnostics && this.endpoint.diagnostics.length > 0;
    }

    getEndpointDiagnostics(): Diagnostic[] {
        return this.endpoint?.diagnostics || [];
    }
}
