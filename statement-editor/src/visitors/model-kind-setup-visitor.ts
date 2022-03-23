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
    BinaryExpression,
    TypeCastExpression,
    TypedBindingPattern,
    TypeTestExpression,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { StatementEditorViewState } from "../utils/statement-editor-viewstate";

class ModelKindSetupVisitor implements Visitor {
    public beginVisitTypedBindingPattern(node: TypedBindingPattern) {
        (node.typeDescriptor.viewState as StatementEditorViewState).isTypeDescriptor = true;
        (node.bindingPattern.viewState as StatementEditorViewState).isBindingPattern = true;
    }

    public beginVisitTypeTestExpression(node: TypeTestExpression) {
        (node.typeDescriptor.viewState as StatementEditorViewState).isTypeDescriptor = true;
    }

    public beginVisitBinaryExpression(node: BinaryExpression) {
        (node.operator.viewState as StatementEditorViewState).isOperator = true;
    }

    public beginVisitTypeCastExpression(node: TypeCastExpression) {
        (node.typeCastParam.viewState as StatementEditorViewState).isTypeDescriptor = true;
    }
}

export const visitor = new ModelKindSetupVisitor();
