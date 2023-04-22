/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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
