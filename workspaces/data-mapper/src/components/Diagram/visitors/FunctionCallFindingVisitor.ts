/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { LinePosition } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionCall,
    Visitor
} from "@wso2-enterprise/syntax-tree";

export class FunctionCallFindingVisitor implements Visitor {
    private readonly fnCallPositions: LinePosition[];

    constructor() {
        this.fnCallPositions = []
    }

    public beginVisitFunctionCall(node: FunctionCall) {
        this.fnCallPositions.push({
            line: node.position.startLine,
            offset: node.position.startColumn
        });
    }

    public getFunctionCallPositions(){
        return this.fnCallPositions;
    }
}
