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
    SyntaxKind,
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
    getReturnStatement,
    getTypeName,
    isConditionalExpression,
    isMapFunction
} from "../Diagram/utils/common-utils";
import { ArrayFnConnectorNode } from "../Diagram/Node/ArrayFnConnector";
import { getPosition, isPositionsEquals } from "../Diagram/utils/st-utils";
import { getDMType } from "../Diagram/utils/type-utils";
import { UnsupportedExprNodeKind, UnsupportedIONode } from "../Diagram/Node/UnsupportedIO";
import { OFFSETS } from "../Diagram/utils/constants";
import { FocusedInputNode } from "../Diagram/Node/FocusedInput";

export class NodeInitVisitor implements Visitor {
    private inputNode: DataMapperNodeModel | InputDataImportNodeModel;
    private outputNode: DataMapperNodeModel | OutputDataImportNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: Node[] = [];

    constructor(
        private context: DataMapperContext,
    ) {}

    beginVisitFunctionDeclaration(node: FunctionDeclaration): void {
        this.inputNode = this.createInputNode(node);
        this.outputNode = this.createOutputNode(node);
    }

    beginVisitPropertyAssignment(node: PropertyAssignment, parent?: Node): void {
        this.mapIdentifiers.push(node);

        const { focusedST, views } = this.context;
        const fieldFQN = views[views.length - 1].fieldFQN;
        const isFocusedST = isPositionsEquals(getPosition(node), getPosition(focusedST));

        if (isFocusedST) {
            const callExpr = node.getInitializer() as CallExpression;

            // create output node
            const exprType = getDMType(fieldFQN, this.context.outputTree);
            const returnStatement = getReturnStatement(callExpr);

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
                }
            } else {
                if (exprType?.kind === TypeKind.Interface) {
                    this.outputNode = new ObjectOutputNode(this.context, returnStatement, exprType);
                }
                if (isConditionalExpression(innerExpr)) {
                    const inputNodes = getPropertyAccessNodes(returnStatement);
                    const linkConnectorNode = new LinkConnectorNode(
                        this.context,
                        node,
                        "",
                        parent,
                        inputNodes,
                        this.mapIdentifiers.slice(0)
                    );
                    this.intermediateNodes.push(linkConnectorNode);
                }
            }

            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, 0);

           // Create input node
           const propAccessExpr = (callExpr.getExpression() as PropertyAccessExpression).getExpression();
           const inputType = getDMType(propAccessExpr.getText(), this.context.inputTrees[0], true);

           const focusedInputNode = new FocusedInputNode(this.context, callExpr, inputType);

           focusedInputNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
           this.inputNode = focusedInputNode;
        } else {
            const initializer = node.getInitializer();
            if (initializer && !this.isObjectOrArrayLiteralExpression(initializer)) {
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
        const { focusedST } = this.context;
        const isParentFocusedST = parent
            && Node.isPropertyAssignment(parent)
            && isPositionsEquals(getPosition(parent), getPosition(focusedST));
        
        if (!isParentFocusedST && isMapFunction(node)) {
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

    getNodes() {
        const nodes = [this.inputNode ? this.inputNode : this.outputNode, this.outputNode];
        nodes.push(...this.intermediateNodes);
        return nodes;
    }

    private createInputNode(node: FunctionDeclaration): InputNode | InputDataImportNodeModel {
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
    
    private createOutputNode(node: FunctionDeclaration): ArrayOutputNode | ObjectOutputNode | OutputDataImportNodeModel {
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
