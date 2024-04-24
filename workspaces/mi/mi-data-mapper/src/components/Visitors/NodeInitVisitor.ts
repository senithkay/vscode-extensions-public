/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Node, PropertyAssignment, ObjectLiteralExpression, FunctionDeclaration, ReturnStatement } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";
import { ObjectOutputNode, InputNode, LinkConnectorNode } from "../Diagram/Node";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import { InputDataImportNodeModel, OutputDataImportNodeModel } from "../Diagram/Node/DataImport/DataImportNode";
import { getPropertyAccessNodes, isConditionalExpression } from "../Diagram/utils/common-utils";

export class NodeInitVisitor implements Visitor {
    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: Node[] = [];
    private inputDataimportNode: InputDataImportNodeModel;
    private outputDataImportNode: OutputDataImportNodeModel;

    constructor(
        private context: DataMapperContext,
    ) {}

    beginVisitFunctionDeclaration(node: FunctionDeclaration): void {
        // Create input nodes
        const params = node.getParameters();
        params.forEach((param) => {
            const paramNode = new InputNode(this.context, param);
            paramNode.setPosition(0, 0);
            this.inputNodes.push(paramNode);
        });

        const body = node.getBody();

        if (Node.isBlock(body)) {
            const returnStatement = body.getStatements()
                .find((statement) => Node.isReturnStatement(statement)) as ReturnStatement;

            this.outputNode = new ObjectOutputNode(
                this.context,
                returnStatement
            );
        }

        // Create data import node
        this.inputDataimportNode = new InputDataImportNodeModel();
        this.inputDataimportNode.setPosition(0, 0);

        // Create output data import node
        this.outputDataImportNode = new OutputDataImportNodeModel();
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

    getNodes() {
        const nodes:DataMapperNodeModel[] = [];
        if (this.inputNodes) {
            const inputNode: InputNode = this.inputNodes[0] as InputNode;
            if (inputNode.dmType && inputNode.dmType.fields && inputNode.dmType.fields.length > 0) {
                nodes.push(...this.inputNodes);
            } else {
                nodes.push(this.inputDataimportNode);
            }
        }
        if (this.outputNode) {
            const outNode: ObjectOutputNode = this.outputNode as ObjectOutputNode;
            if (outNode.dmType && outNode.dmType.fields && outNode.dmType.fields.length > 0) {
                nodes.push(this.outputNode);
            } else {
                nodes.push(this.outputDataImportNode);
            }
        }
        nodes.push(...this.intermediateNodes);
        return nodes;
    }
}