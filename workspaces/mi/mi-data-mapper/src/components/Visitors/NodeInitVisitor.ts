/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Node, PropertyAssignment, ObjectLiteralExpression, FunctionDeclaration, ReturnStatement, ArrayLiteralExpression } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";
import { ObjectOutputNode, InputNode, LinkConnectorNode, ArrayOutputNode } from "../Diagram/Node";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import { InputDataImportNodeModel, OutputDataImportNodeModel } from "../Diagram/Node/DataImport/DataImportNode";
import { getPropertyAccessNodes, isConditionalExpression } from "../Diagram/utils/common-utils";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

export class NodeInitVisitor implements Visitor {
    private inputNode: DataMapperNodeModel | InputDataImportNodeModel;
    private outputNode: DataMapperNodeModel | OutputDataImportNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: Node[] = [];

    constructor(
        private context: DataMapperContext,
    ) {}

    beginVisitFunctionDeclaration(node: FunctionDeclaration): void {
        const param = node.getParameters()[0];
        const inputType = param
            && this.context.inputTrees.find(inputTree => inputTree.typeName === param.getType().getText());
    
        if (inputType && this.hasFields(inputType)) {
            // Create input node
            const paramNode = new InputNode(this.context, param);
            paramNode.setPosition(0, 0);
            this.inputNode = paramNode;
        } else {
            // Create input data import node
            this.inputNode = new InputDataImportNodeModel();
        }

        const returnType = node.getReturnType();
        const outputType = returnType && !returnType.isVoid() && this.context.outputTree;

        if (outputType && this.hasFields(outputType)) {
            const body = node.getBody();

            if (Node.isBlock(body)) {
                const returnStatement = body.getStatements()
                    .find((statement) => Node.isReturnStatement(statement)) as ReturnStatement;
    
                // Create output node
                if (returnType.isInterface()) {
                    this.outputNode = new ObjectOutputNode(this.context, returnStatement);
                } else if (returnType.isArray()) {
                    this.outputNode = new ArrayOutputNode(this.context, returnStatement);
                }
            }
        } else {
            // Create output data import node
            this.outputNode = new OutputDataImportNodeModel();
        }
    }

    beginVisitPropertyAssignment(node: PropertyAssignment, parent?: Node): void {
        const initializer = node.getInitializer();
        this.mapIdentifiers.push(node)

        if (initializer
            && !Node.isObjectLiteralExpression(initializer)
            && !Node.isArrayLiteralExpression(initializer)
        ) {
            const propertyAccessNodes = getPropertyAccessNodes(initializer);
            if (propertyAccessNodes.length > 1
                || (propertyAccessNodes.length === 1
                    && isConditionalExpression(initializer)
                )
            ){
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node,
                    node.getName(),
                    parent,
                    propertyAccessNodes,
                    this.mapIdentifiers.slice(0)
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
                let innerExpr = element;
                if (!Node.isObjectLiteralExpression(innerExpr) && !Node.isArrayLiteralExpression(innerExpr)) {
                    const propertyAccessNodes = getPropertyAccessNodes(innerExpr);
                    if (propertyAccessNodes.length > 1
                        || (propertyAccessNodes.length === 1 && isConditionalExpression(innerExpr))) {
                        const linkConnectorNode = new LinkConnectorNode(
                            this.context,
                            innerExpr,
                            "",
                            parent,
                            propertyAccessNodes,
                            [...this.mapIdentifiers, innerExpr]
                        );
                        this.intermediateNodes.push(linkConnectorNode);
                    }
                }
            })
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
        const nodes = [this.inputNode, this.outputNode];
        nodes.push(...this.intermediateNodes);
        return nodes;
    }

    hasFields(type: DMType): boolean {
        if (type.kind === TypeKind.Interface) {
            return type.fields && type.fields.length > 0;
        } else if (type.kind === TypeKind.Array) {
            return this.hasFields(type.memberType);
        }
        return false;
    }
}