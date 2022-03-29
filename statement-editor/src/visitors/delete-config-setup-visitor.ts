/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
    AssignmentStatement,
    BinaryExpression,
    ListConstructor, MappingConstructor,
    STNode, TupleTypeDesc, TypedBindingPattern,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { StatementEditorViewState } from "../utils/statement-editor-viewstate";

class DeleteConfigSetupVisitor implements Visitor {

    public beginVisitBinaryExpression(node: BinaryExpression) {
        (node.lhsExpr.viewState as StatementEditorViewState).templateExprDeletable = true;
        (node.rhsExpr.viewState as StatementEditorViewState).templateExprDeletable = true;
    }

    public beginVisitListConstructor(node: ListConstructor) {
        node.expressions.map((expr: STNode) => {
            (expr.viewState as StatementEditorViewState).templateExprDeletable = true;
        });
    }

    public beginVisitMappingConstructor(node: MappingConstructor) {
        node.fields.map((field: STNode) => {
            (field.viewState as StatementEditorViewState).templateExprDeletable = true;
        });
    }

    public beginVisitTypedBindingPattern(node: TypedBindingPattern) {
        (node.bindingPattern.viewState as StatementEditorViewState).exprNotDeletable = true;
        (node.typeDescriptor.viewState as StatementEditorViewState).templateExprDeletable = true;
    }


    public beginVisitAssignmentStatement(node: AssignmentStatement) {
        (node.varRef.viewState as StatementEditorViewState).exprNotDeletable = true;
    }

    public beginVisitTupleTypeDesc(node: TupleTypeDesc) {
        if (node.memberTypeDesc.length === 1) {
            (node.memberTypeDesc[0].viewState as StatementEditorViewState).exprNotDeletable = true;
            (node.memberTypeDesc[0].viewState as StatementEditorViewState).templateExprDeletable = false;
        } else {
            node.memberTypeDesc.map((memberTypeDesc: STNode) => {
                (memberTypeDesc.viewState as StatementEditorViewState).templateExprDeletable = true;
            });
        }
    }
}

export const visitor = new DeleteConfigSetupVisitor();
