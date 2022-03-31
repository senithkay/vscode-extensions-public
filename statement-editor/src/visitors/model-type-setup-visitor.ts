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
    IntersectionTypeDesc,
    OptionalTypeDesc,
    ParenthesisedTypeDesc,
    QueryPipeline,
    RecordField,
    RecordFieldWithDefaultValue, RecordTypeDesc,
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
        node.intermediateClauses.map((intermediateClause: STNode) => {
            (intermediateClause.viewState as StatementEditorViewState).modelType = ModelType.QUERY_CLAUSE;
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

}

export const visitor = new ModelTypeSetupVisitor();
