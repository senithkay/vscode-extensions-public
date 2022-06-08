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
    FieldAccess,
    ImplicitAnonymousFunctionExpression,
    IntersectionTypeDesc,
    MethodCall,
    OptionalTypeDesc, OrderByClause,
    OrderKey,
    ParenthesisedTypeDesc,
    QueryExpression,
    QueryPipeline,
    RecordField,
    RecordFieldWithDefaultValue,
    STNode,
    TableTypeDesc,
    TupleTypeDesc,
    TypeCastExpression,
    TypedBindingPattern,
    TypeParameter,
    TypeTestExpression,
    UnionTypeDesc,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { ModelType, StatementEditorViewState } from "../utils/statement-editor-viewstate";

class ModelTypeSetupVisitor implements Visitor {
    public beginVisitSTNode(node: STNode, parent?: STNode) {
        // Propagate model type info to leaf nodes
        if (parent && (parent.viewState as StatementEditorViewState).modelType === ModelType.TYPE_DESCRIPTOR) {
            (node.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        } else if (parent && (parent.viewState as StatementEditorViewState).modelType === ModelType.BINDING_PATTERN) {
            (node.viewState as StatementEditorViewState).modelType = ModelType.BINDING_PATTERN;
        } else if (parent && (parent.viewState as StatementEditorViewState).modelType === ModelType.METHOD_CALL) {
            (node.viewState as StatementEditorViewState).modelType = ModelType.METHOD_CALL;
        } else if (parent && (parent.viewState as StatementEditorViewState).modelType === ModelType.FIELD_ACCESS) {
            (node.viewState as StatementEditorViewState).modelType = ModelType.FIELD_ACCESS;
        } else if (parent && (parent.viewState as StatementEditorViewState).modelType === ModelType.ORDER_KEY) {
            (node.viewState as StatementEditorViewState).modelType = ModelType.ORDER_KEY;
        }
    }

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

    public beginVisitQueryPipeline(node: QueryPipeline) {
        (node.fromClause.viewState as StatementEditorViewState).modelType = ModelType.QUERY_CLAUSE;
        node.intermediateClauses.map((intermediateClause: STNode) => {
            (intermediateClause.viewState as StatementEditorViewState).modelType = ModelType.QUERY_CLAUSE;
        });
    }

    public beginVisitOrderByClause(node: OrderByClause, parent?: STNode) {
        node.orderKey.map((orderKey: STNode) => {
            (orderKey.viewState as StatementEditorViewState).modelType = ModelType.ORDER_KEY;
        });
    }

    public beginVisitUnionTypeDesc(node: UnionTypeDesc) {
        (node.leftTypeDesc.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        (node.rightTypeDesc.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitIntersectionTypeDesc(node: IntersectionTypeDesc) {
        (node.leftTypeDesc.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        (node.rightTypeDesc.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitOptionalTypeDesc(node: OptionalTypeDesc) {
        (node.typeDescriptor.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitTupleTypeDesc(node: TupleTypeDesc) {
        node.memberTypeDesc.map((memberTypeDesc: STNode) => {
            (memberTypeDesc.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        });
    }

    public beginVisitParenthesisedTypeDesc(node: ParenthesisedTypeDesc) {
        (node.typedesc.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitTableTypeDesc(node: TableTypeDesc) {
        (node.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        (node.rowTypeParameterNode.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitTypeParameter(node: TypeParameter) {
        (node.typeNode.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
    }

    public beginVisitRecordField(node: RecordField) {
        (node.typeName.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        (node.fieldName.viewState as StatementEditorViewState).modelType = ModelType.BINDING_PATTERN;
    }

    public beginVisitRecordFieldWithDefaultValue(node: RecordFieldWithDefaultValue) {
        (node.typeName.viewState as StatementEditorViewState).modelType = ModelType.TYPE_DESCRIPTOR;
        (node.fieldName.viewState as StatementEditorViewState).modelType = ModelType.BINDING_PATTERN;
    }

    public beginVisitMethodCall(node: MethodCall) {
        (node.expression.viewState as StatementEditorViewState).modelType = ModelType.METHOD_CALL;
        (node.methodName.viewState as StatementEditorViewState).modelType = ModelType.METHOD_CALL;
    }

    public beginVisitFieldAccess(node: FieldAccess) {
        (node.expression.viewState as StatementEditorViewState).modelType = ModelType.FIELD_ACCESS;
        (node.fieldName.viewState as StatementEditorViewState).modelType = ModelType.FIELD_ACCESS;
    }

    public beginVisitQueryExpression(node: QueryExpression) {
        (node.queryPipeline.viewState as StatementEditorViewState).modelType = ModelType.QUERY_EXPRESSION;
        (node.selectClause.viewState as StatementEditorViewState).modelType = ModelType.QUERY_EXPRESSION;
        if (node?.queryConstructType) {
            (node.queryConstructType.viewState as StatementEditorViewState).modelType = ModelType.QUERY_EXPRESSION;
        }
    }

    public beginVisitImplicitAnonymousFunctionExpression(node: ImplicitAnonymousFunctionExpression) {
        (node.viewState as StatementEditorViewState).modelType = ModelType.FUNCTION;
    }

}

export const visitor = new ModelTypeSetupVisitor();
