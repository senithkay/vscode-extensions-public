/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import {
    ElementAccessExpression,
    Expression,
    FunctionDeclaration,
    Identifier,
    Node,
    PropertyAccessExpression,
    ReturnStatement
} from 'ts-morph';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

import {
    ArrayOutputNode,
    FocusedInputNode,
    InputDataImportNodeModel,
    InputNode,
    LinkConnectorNode,
    ObjectOutputNode,
    OutputDataImportNodeModel,
    PrimitiveOutputNode,
    SubMappingNode
} from '../Node';
import { DataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';
import { getTypeName } from './common-utils';
import { InputOutputPortModel } from '../Port';
import { SourceNodeType } from '../../../components/DataMapper/Views/DataMapperView';

type SubMappingOutputNode = ArrayOutputNode | ObjectOutputNode | PrimitiveOutputNode;

export function createInputNodeForDmFunction(
    fnDecl: FunctionDeclaration,
    context: DataMapperContext
): InputNode | InputDataImportNodeModel {
    /* Constraints:
        1. The function should and must have a single parameter
        2. The parameter type should be an interface or an array
        3. Tuple and union parameter types are not supported
    */
    const param = fnDecl.getParameters()[0];
    const inputType = param && context.inputTrees.find(input => getTypeName(input) === param.getType().getText());

    if (inputType && hasFields(inputType)) {
        // Create input node
        const inputNode = new InputNode(context, param);
        inputNode.setPosition(0, 0);
        return inputNode;
    } else {
        // Create input data import node
        return new InputDataImportNodeModel();
    }
}

export function createOutputNodeForDmFunction(
    fnDecl: FunctionDeclaration,
    context: DataMapperContext
): ArrayOutputNode | ObjectOutputNode | OutputDataImportNodeModel {
    /* Constraints:
        1. The function should have a return type and it should not be void
        2. The return type should be an interface or an array
        3. Tuple and union return types are not supported
    */
    const returnType = fnDecl.getReturnType();
    const outputType = returnType && !returnType.isVoid() && context.outputTree;

    if (outputType && hasFields(outputType)) {
        const body = fnDecl.getBody();

        if (Node.isBlock(body)) {
            const returnStatement = body.getStatements().find((statement) =>
                Node.isReturnStatement(statement)) as ReturnStatement;
            const returnExpr = returnStatement?.getExpression();
    
            // Create output node based on return type
            if (returnType.isInterface()) {
                return new ObjectOutputNode(context, returnExpr, outputType);
            } else if (returnType.isArray()) {
                return new ArrayOutputNode(context, returnExpr, outputType);
            }
        }
    }

    // Create output data import node
    return new OutputDataImportNodeModel();
}

export function createLinkConnectorNode(
    node: Node,
    label: string,
    parent: Node | undefined,
    inputAccessNodes: (Identifier | ElementAccessExpression | PropertyAccessExpression)[],
    fields: Node[],
    context: DataMapperContext
): LinkConnectorNode {

    return new LinkConnectorNode(context, node, label, parent, inputAccessNodes, fields);
}

export function getOutputNode(
    context: DataMapperContext,
    expression: Expression,
    outputType: DMType,
    isSubMapping: boolean = false
): SubMappingOutputNode {
    if (outputType.kind === TypeKind.Interface || outputType.kind === TypeKind.Object) {
        return new ObjectOutputNode(context, expression, outputType, isSubMapping);
    } else if (outputType.kind === TypeKind.Array) {
        return new ArrayOutputNode(context, expression, outputType, isSubMapping);
    }
    return new PrimitiveOutputNode(context, expression, outputType, isSubMapping);
}

export function getSubMappingNode(context: DataMapperContext) {
    return new SubMappingNode(context);
}

export function getSourceNodeType(sourcePort: InputOutputPortModel) {
    const sourceNode = sourcePort.getNode();

    if (sourceNode instanceof InputNode) {
        return SourceNodeType.InputNode;
    } else if (sourceNode instanceof FocusedInputNode) {
        return SourceNodeType.FocusedInputNode;
    } else if (sourceNode instanceof SubMappingNode) {
        return SourceNodeType.SubMappingNode;
    }
}

export function isObjectOrArrayLiteralExpression(node: Node): boolean {
    return Node.isObjectLiteralExpression(node)
        || Node.isArrayLiteralExpression(node);
}

function hasFields(type: DMType): boolean {
    if (type.kind === TypeKind.Interface) {
        return type.fields && type.fields.length > 0;
    } else if (type.kind === TypeKind.Array) {
        return hasFields(type.memberType);
    }
    return false;
}
