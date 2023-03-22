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

import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import {visitor as STNodeFindingVisitor } from "../visitors/STNodeFindingVisitor";

export function getSTNodeFromRange(position: NodePosition, model: STNode): STNode {
    STNodeFindingVisitor.setPosition(position);
    traversNode(model, STNodeFindingVisitor);
    return STNodeFindingVisitor.getSTNode();
}
