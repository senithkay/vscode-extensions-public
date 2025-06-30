/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
    STNode,
    Visitor,
    WhereClause
} from "@wso2-enterprise/syntax-tree";

import { StatementEditorViewState } from "../utils/statement-editor-viewstate";


class ParentWhereSetupVisitor implements Visitor {
    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (parent && (parent.viewState as StatementEditorViewState).isWithinWhereClause) {
            (node.viewState as StatementEditorViewState).isWithinWhereClause = true;
        }
    }

    public beginVisitWhereClause(node: WhereClause) {
        (node.viewState as StatementEditorViewState).isWithinWhereClause = true;
    }
}

export const parentWhereSetupVisitor = new ParentWhereSetupVisitor();
