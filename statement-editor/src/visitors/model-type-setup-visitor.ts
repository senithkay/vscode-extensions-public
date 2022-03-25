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

import { ModelType, StatementEditorViewState } from "../utils/statement-editor-viewstate";

class ModelTypeSetupVisitor implements Visitor {
    public beginVisitTypedBindingPattern(node: TypedBindingPattern) {
        (node.typeDescriptor.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        (node.bindingPattern.viewState as StatementEditorViewState).modelType = ModelType.BINDING_PATTERN;
    }

    public beginVisitTypeTestExpression(node: TypeTestExpression) {
        (node.typeDescriptor.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitBinaryExpression(node: BinaryExpression) {
        (node.operator.viewState as StatementEditorViewState).modelType = ModelType.OPERATOR;
    }

    public beginVisitTypeCastExpression(node: TypeCastExpression) {
        (node.typeCastParam.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }
}

export const visitor = new ModelTypeSetupVisitor();
