/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import {
    NodePosition,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { INPUT_EDITOR_PLACEHOLDERS } from "../components/InputEditor/constants";
import { isPositionsEquals } from "../utils";

class ModelFindingVisitor implements Visitor {
    private position: NodePosition;
    private model: STNode;

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (isPositionsEquals(node.position, this.position)) {
            this.model = node;
        } else if (INPUT_EDITOR_PLACEHOLDERS.has(node?.source?.trim())) {
            const isWithinRange = this.position.startLine <= node.position.startLine
                && this.position.endLine >= node.position.endLine
                && this.position.startColumn <= node.position.endColumn
                && this.position.endColumn >= node.position.startColumn;
            if (isWithinRange) {
                this.model = node;
            }
        }
    }

    getModel(): STNode {
        const newModel = this.model;
        this.model = undefined;
        return newModel;
    }

    setPosition(position: NodePosition) {
        this.position = position;
    }
}

export const visitor = new ModelFindingVisitor();
