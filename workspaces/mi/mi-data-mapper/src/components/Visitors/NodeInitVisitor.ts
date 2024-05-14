/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import {
    Node,
    PropertyAssignment,
    ObjectLiteralExpression,
    FunctionDeclaration,
    ReturnStatement,
    ArrayLiteralExpression,
    Identifier,
    PropertyAccessExpression,
    CallExpression
} from "ts-morph";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

import { Visitor } from "../../ts/base-visitor";
import { ObjectOutputNode, InputNode, LinkConnectorNode, ArrayOutputNode } from "../Diagram/Node";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import { InputDataImportNodeModel, OutputDataImportNodeModel } from "../Diagram/Node/DataImport/DataImportNode";
import {
    canConnectWithLinkConnector,
    getPropertyAccessNodes,
    getCallExprReturnStmt,
    getTypeName,
    isConditionalExpression,
    isMapFunction,
    getTnfFnReturnStatement
} from "../Diagram/utils/common-utils";
import { ArrayFnConnectorNode } from "../Diagram/Node/ArrayFnConnector";
import { getPosition, isPositionsEquals } from "../Diagram/utils/st-utils";
import { getDMType } from "../Diagram/utils/type-utils";
import { UnsupportedExprNodeKind, UnsupportedIONode } from "../Diagram/Node/UnsupportedIO";
import { OFFSETS } from "../Diagram/utils/constants";
import { FocusedInputNode } from "../Diagram/Node/FocusedInput";
import { PrimitiveOutputNode } from "../Diagram/Node/PrimitiveOutput";

export class NodeInitVisitor implements Visitor {
    private inputNode: DataMapperNodeModel | InputDataImportNodeModel;
    private outputNode: DataMapperNodeModel | OutputDataImportNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: Node[] = [];
    private isWithinMapFn = 0;

    constructor(private context: DataMapperContext) {}

    beginVisitFunctionDeclaration(node: FunctionDeclaration): void {
        this.inputNode = this.createInputNodeForDmFunction(node);
        this.outputNode = this.createOutputNodeForDmFunction(node);
    }

    beginVisitPropertyAssignment(node: PropertyAssignment, parent?: Node): void {
        this.mapIdentifiers.push(node);

        const { focusedST, views } = this.context;
        const { sourceFieldFQN, targetFieldFQN, mapFnIndex } = views[views.length - 1];
        const isFocusedST = isPositionsEquals(getPosition(node), getPosition(focusedST));

        if (isFocusedST) {
            const callExpr = node.getInitializer() as CallExpression;

            // Create output node
            const exprType = getDMType(targetFieldFQN, this.context.outputTree, mapFnIndex);
            const returnStatement = getCallExprReturnStmt(callExpr);

            const innerExpr = returnStatement.getExpression();

            const hasConditionalOutput = Node.isConditionalExpression(innerExpr);
            if (hasConditionalOutput) {
                this.outputNode = new UnsupportedIONode(
                    this.context,
                    UnsupportedExprNodeKind.Output,
                    undefined,
                    innerExpr,
                );
            } else if (exprType?.kind === TypeKind.Array) {
                const { memberType } = exprType;
                if (memberType.kind === TypeKind.Interface) {
                    this.outputNode = new ObjectOutputNode(this.context, returnStatement, memberType);
                } else if (memberType.kind === TypeKind.Array) {
                    this.outputNode = new ArrayOutputNode(this.context, returnStatement, memberType);
                } else {
                    this.outputNode = new PrimitiveOutputNode(this.context, returnStatement, memberType);
                }
            } else {
                if (exprType?.kind === TypeKind.Interface) {
                    this.outputNode = new ObjectOutputNode(this.context, returnStatement, exprType);
                } else {
                    // Constraint: The return type of the transformation function should be an interface or an array
                }
                if (isConditionalExpression(innerExpr)) {
                    const inputNodes = getPropertyAccessNodes(returnStatement);
                    const linkConnectorNode = this.createLinkConnectorNode(
                        node, "", parent, inputNodes, this.mapIdentifiers.slice(0)
                    );
                    this.intermediateNodes.push(linkConnectorNode);
                }
            }

            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, 0);

            // Create input node
            const inputType = getDMType(sourceFieldFQN, this.context.inputTrees[0], mapFnIndex);

            const focusedInputNode = new FocusedInputNode(this.context, callExpr, inputType);

            focusedInputNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
            this.inputNode = focusedInputNode;
        } else {
            const initializer = node.getInitializer();
            if (initializer && !this.isObjectOrArrayLiteralExpression(initializer) && this.isWithinMapFn === 0) {
                const propAccessNodes = getPropertyAccessNodes(initializer);
                if (canConnectWithLinkConnector(propAccessNodes, initializer)) {
                    const linkConnectorNode = this.createLinkConnectorNode(
                        node, node.getName(), parent, propAccessNodes, this.mapIdentifiers.slice(0)
                    );
                    this.intermediateNodes.push(linkConnectorNode);
                }
            }
        }
    }

    beginVisitReturnStatement(node: ReturnStatement, parent: Node): void {
        const returnExpr = node.getExpression();
        const { views, focusedST, outputTree } = this.context;
        const focusedView = views[views.length - 1];
        const { targetFieldFQN, mapFnIndex } = focusedView;
        const isRootReturn = views.length === 2;
        const isFocusedST = views.length > 1 && isPositionsEquals(getPosition(node), getPosition(focusedST));

        // Create IO nodes whan the return statement contains the focused map function
        if (isFocusedST) {
            const callExpr = returnExpr as CallExpression;
            const mapFnReturnStmt = getCallExprReturnStmt(callExpr);
            const outputType = isRootReturn ? outputTree : getDMType(targetFieldFQN, this.context.outputTree, mapFnIndex);

            if (outputType.kind === TypeKind.Array) {
                const { memberType } = outputType;
                if (memberType.kind === TypeKind.Interface) {
                    this.outputNode = new ObjectOutputNode(this.context, mapFnReturnStmt, memberType);
                } else if (memberType.kind === TypeKind.Array) {
                    this.outputNode = new ArrayOutputNode(this.context, mapFnReturnStmt, memberType);
                } else {
                    this.outputNode = new PrimitiveOutputNode(this.context, mapFnReturnStmt, memberType);
                }
            } else if (outputTree?.kind === TypeKind.Interface) {
                this.outputNode = new ObjectOutputNode(this.context, mapFnReturnStmt, outputTree);
            } else {
                // Constraint: The return type of the transformation function should be an interface or an array
            }
            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, 0);

            // Create input node
            const { sourceFieldFQN } = views[views.length - 1];
            const inputRoot = this.context.inputTrees[0];
            const inputType = sourceFieldFQN !== '' ? getDMType(sourceFieldFQN, inputRoot, mapFnIndex) : inputRoot;

            const focusedInputNode = new FocusedInputNode(this.context, callExpr, inputType);

            focusedInputNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
            this.inputNode = focusedInputNode;
        }

        // Create link connector node for expressions within return statements
        if (this.isWithinMapFn === 0
            && !Node.isObjectLiteralExpression(returnExpr)
            && !Node.isArrayLiteralExpression(returnExpr)
        ) {
            const propAccessNodes = getPropertyAccessNodes(returnExpr);
            if (propAccessNodes.length > 1) {
                const linkConnectorNode = this.createLinkConnectorNode(
                    returnExpr, "", parent, propAccessNodes, [...this.mapIdentifiers, returnExpr]
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitObjectLiteralExpression(node: ObjectLiteralExpression): void {
        this.mapIdentifiers.push(node);
    }

    beginVisitArrayLiteralExpression(node: ArrayLiteralExpression, parent?: Node): void {
        this.mapIdentifiers.push(node);
        const elements = node.getElements();

        if (elements) {
            elements.forEach(element => {
                if (!this.isObjectOrArrayLiteralExpression(element)) {
                    const propAccessNodes = getPropertyAccessNodes(element);
                    if (canConnectWithLinkConnector(propAccessNodes, element)) {
                        const linkConnectorNode = this.createLinkConnectorNode(
                            element, "", parent, propAccessNodes, [...this.mapIdentifiers, element]
                        );
                        this.intermediateNodes.push(linkConnectorNode);
                    }
                }
            })
        }
    }

    beginVisitCallExpression(node: CallExpression, parent: Node): void {
        const { focusedST, views } = this.context;
        const isMapFn = isMapFunction(node);
        const isFocusedSTWithinPropAssignment = parent
            && Node.isPropertyAssignment(parent)
            && isPositionsEquals(getPosition(parent), getPosition(focusedST));
        const isFocusedSTWithinReturnStmt = parent
            && Node.isReturnStatement(parent)
            && isPositionsEquals(getPosition(parent), getPosition(focusedST))
            && views.length > 1;
        const isParentFocusedST = isFocusedSTWithinPropAssignment || isFocusedSTWithinReturnStmt;
        
        if (!isParentFocusedST && isMapFn) {
            this.isWithinMapFn += 1;
            const arrayFnConnectorNode = new ArrayFnConnectorNode(this.context, node, parent);
            this.intermediateNodes.push(arrayFnConnectorNode);
        }
    }

    endVisitPropertyAssignment(node: PropertyAssignment): void {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }    
    }

    endVisitObjectLiteralExpression(node: ObjectLiteralExpression): void {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitArrayLiteralExpression(node: ArrayLiteralExpression): void {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitCallExpression(node: CallExpression, parent: Node): void {
        const { focusedST } = this.context;
        const isMapFn = isMapFunction(node);
        const isParentFocusedST = parent
            && Node.isPropertyAssignment(parent)
            && isPositionsEquals(getPosition(parent), getPosition(focusedST));
        
        if (!isParentFocusedST && isMapFn) {
            this.isWithinMapFn -= 1;
        }
    }

    getNodes() {
        const nodes = [this.inputNode ? this.inputNode : this.outputNode, this.outputNode];
        nodes.push(...this.intermediateNodes);
        return nodes;
    }

    private createInputNodeForDmFunction(
        node: FunctionDeclaration
    ): InputNode | InputDataImportNodeModel {
        /* Constraints:
            1. The function should and must have a single parameter
            2. The parameter type should be an interface or an array
            3. Tuple and union parameter types are not supported
        */
        const param = node.getParameters()[0];
        const inputType = param && this.context.inputTrees.find(inputTree =>
            getTypeName(inputTree) === param.getType().getText());
    
        if (inputType && this.hasFields(inputType)) {
            // Create input node
            const inputNode = new InputNode(this.context, param);
            inputNode.setPosition(0, 0);
            return inputNode;
        } else {
            // Create input data import node
            return new InputDataImportNodeModel();
        }
    }
    
    private createOutputNodeForDmFunction(
        node: FunctionDeclaration
    ): ArrayOutputNode | ObjectOutputNode | OutputDataImportNodeModel {
        /* Constraints:
            1. The function should have a return type and it should not be void
            2. The return type should be an interface or an array
            3. Tuple and union return types are not supported
        */
        const returnType = node.getReturnType();
        const outputType = returnType && !returnType.isVoid() && this.context.outputTree;
    
        if (outputType && this.hasFields(outputType)) {
            const body = node.getBody();
    
            if (Node.isBlock(body)) {
                const returnStatement = body.getStatements().find((statement) =>
                    Node.isReturnStatement(statement)) as ReturnStatement;
        
                // Create output node based on return type
                if (returnType.isInterface()) {
                    return new ObjectOutputNode(this.context, returnStatement, outputType);
                } else if (returnType.isArray()) {
                    return new ArrayOutputNode(this.context, returnStatement, outputType);
                }
            }
        }
    
        // Create output data import node
        return new OutputDataImportNodeModel();
    }

    private createLinkConnectorNode(
        node: Node,
        label: string,
        parent: Node | undefined,
        propertyAccessNodes: (Identifier | PropertyAccessExpression)[],
        fields: Node[]
    ): LinkConnectorNode {

        return new LinkConnectorNode(
            this.context,
            node,
            label,
            parent,
            propertyAccessNodes,
            fields
        );
    }

    private hasFields(type: DMType): boolean {
        if (type.kind === TypeKind.Interface) {
            return type.fields && type.fields.length > 0;
        } else if (type.kind === TypeKind.Array) {
            return this.hasFields(type.memberType);
        }
        return false;
    }

    private isObjectOrArrayLiteralExpression(node: Node): boolean {
        return Node.isObjectLiteralExpression(node)
            || Node.isArrayLiteralExpression(node);
    }
}
