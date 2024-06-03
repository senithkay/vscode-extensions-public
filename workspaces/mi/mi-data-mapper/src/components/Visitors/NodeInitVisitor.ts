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
    CallExpression,
    VariableStatement
} from "ts-morph";
import { TypeKind } from "@wso2-enterprise/mi-core";

import { Visitor } from "../../ts/base-visitor";
import { ObjectOutputNode } from "../Diagram/Node";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import { InputDataImportNodeModel, OutputDataImportNodeModel } from "../Diagram/Node/DataImport/DataImportNode";
import {
    canConnectWithLinkConnector,
    getInputAccessNodes,
    getCallExprReturnStmt,
    isConditionalExpression,
    isMapFunction
} from "../Diagram/utils/common-utils";
import { ArrayFnConnectorNode } from "../Diagram/Node/ArrayFnConnector";
import { getPosition, isPositionsEquals } from "../Diagram/utils/st-utils";
import { getDMType, getDMTypeForRootChaninedMapFunction, getDMTypeOfSubMappingItem } from "../Diagram/utils/type-utils";
import { UnsupportedExprNodeKind, UnsupportedIONode } from "../Diagram/Node/UnsupportedIO";
import { OFFSETS } from "../Diagram/utils/constants";
import { FocusedInputNode } from "../Diagram/Node/FocusedInput";
import { SubMappingNode } from "../Diagram/Node/SubMapping";
import {
    createInputNodeForDmFunction,
    createLinkConnectorNode,
    createOutputNodeForDmFunction,
    getOutputNode,
    isObjectOrArrayLiteralExpression
} from "../Diagram/utils/node-utils";
import { SourceNodeType } from "../DataMapper/Views/DataMapperView";

export class NodeInitVisitor implements Visitor {
    private inputNode: DataMapperNodeModel | InputDataImportNodeModel;
    private outputNode: DataMapperNodeModel | OutputDataImportNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private mapIdentifiers: Node[] = [];
    private isWithinMapFn = 0;
    private isWithinVariableStmt = 0;

    constructor(private context: DataMapperContext) {}

    beginVisitFunctionDeclaration(node: FunctionDeclaration): void {
        this.inputNode = createInputNodeForDmFunction(node, this.context);
        this.outputNode = createOutputNodeForDmFunction(node, this.context);
    }

    beginVisitPropertyAssignment(node: PropertyAssignment, parent?: Node): void {
        this.mapIdentifiers.push(node);

        const { focusedST, functionST, views, subMappingTypes } = this.context;
        const { sourceFieldFQN, targetFieldFQN, sourceNodeType, mapFnIndex } = views[views.length - 1];
        const isFocusedST = isPositionsEquals(getPosition(node), getPosition(focusedST));

        if (isFocusedST) {
            const callExpr = node.getInitializer() as CallExpression;

            // Create output node
            const exprType = getDMType(targetFieldFQN, this.context.outputTree, mapFnIndex);
            const returnStatement = getCallExprReturnStmt(callExpr);

            const innerExpr = returnStatement?.getExpression();

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
                this.outputNode = getOutputNode(this.context, innerExpr, memberType);
            } else {
                if (exprType?.kind === TypeKind.Interface) {
                    this.outputNode = new ObjectOutputNode(this.context, innerExpr, exprType);
                } else {
                    // Constraint: The return type of the transformation function should be an interface or an array
                }
                if (isConditionalExpression(innerExpr)) {
                    const inputNodes = getInputAccessNodes(returnStatement);
                    const linkConnectorNode = createLinkConnectorNode(
                        node, "", parent, inputNodes, this.mapIdentifiers.slice(0), this.context
                    );
                    this.intermediateNodes.push(linkConnectorNode);
                }
            }

            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, 0);

            // Create input node
            const inputType = sourceNodeType === SourceNodeType.SubMappingNode
                ? getDMTypeOfSubMappingItem(functionST, sourceFieldFQN, subMappingTypes)
                : getDMType(sourceFieldFQN, this.context.inputTrees[0], mapFnIndex);

            const focusedInputNode = new FocusedInputNode(this.context, callExpr, inputType);

            focusedInputNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
            this.inputNode = focusedInputNode;
        } else {
            const initializer = node.getInitializer();
            if (initializer
                && !isObjectOrArrayLiteralExpression(initializer)
                && this.isWithinMapFn === 0
                && this.isWithinVariableStmt === 0
            ) {
                const inputAccessNodes = getInputAccessNodes(initializer);
                if (canConnectWithLinkConnector(inputAccessNodes, initializer)) {
                    const linkConnectorNode = createLinkConnectorNode(
                        node, node.getName(), parent, inputAccessNodes, this.mapIdentifiers.slice(0), this.context
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
        const mapFnAtRootReturnOrDecsendent = !targetFieldFQN && mapFnIndex !== undefined;
        const isFocusedST = views.length > 1 && isPositionsEquals(getPosition(node), getPosition(focusedST));

        // Create IO nodes whan the return statement contains the focused map function
        if (isFocusedST) {
            const callExpr = returnExpr as CallExpression;
            const mapFnReturnStmt = getCallExprReturnStmt(callExpr);
            const mapFnReturnExpr = mapFnReturnStmt?.getExpression();
            const outputType = mapFnAtRootReturnOrDecsendent
                ? getDMTypeForRootChaninedMapFunction(outputTree, mapFnIndex)
                : getDMType(targetFieldFQN, this.context.outputTree, mapFnIndex);

            if (outputType.kind === TypeKind.Array) {
                const { memberType } = outputType;
                this.outputNode = getOutputNode(this.context, mapFnReturnExpr, memberType);
            } else if (outputTree?.kind === TypeKind.Interface) {
                this.outputNode = new ObjectOutputNode(this.context, mapFnReturnExpr, outputTree);
            } else {
                // Constraint: The return type of the transformation function should be an interface or an array
            }
            this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, 0);

            // Create input node
            const { sourceFieldFQN } = views[views.length - 1];
            const inputRoot = this.context.inputTrees[0];
            const inputType = mapFnAtRootReturnOrDecsendent
                ? getDMTypeForRootChaninedMapFunction(inputRoot, mapFnIndex)
                : getDMType(sourceFieldFQN, inputRoot, mapFnIndex);

            const focusedInputNode = new FocusedInputNode(this.context, callExpr, inputType);

            focusedInputNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
            this.inputNode = focusedInputNode;
        }

        // Create link connector node for expressions within return statements
        if (this.isWithinMapFn === 0
            && this.isWithinVariableStmt === 0
            && !Node.isObjectLiteralExpression(returnExpr)
            && !Node.isArrayLiteralExpression(returnExpr)
        ) {
            const inputAccessNodes = getInputAccessNodes(returnExpr);
            if (inputAccessNodes.length > 1) {
                const linkConnectorNode = createLinkConnectorNode(
                    returnExpr, "", parent, inputAccessNodes, [...this.mapIdentifiers, returnExpr], this.context
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

        if (elements && this.isWithinVariableStmt === 0) {
            elements.forEach(element => {
                if (!isObjectOrArrayLiteralExpression(element)) {
                    const inputAccessNodes = getInputAccessNodes(element);
                    if (canConnectWithLinkConnector(inputAccessNodes, element)) {
                        const linkConnectorNode = createLinkConnectorNode(
                            element, "", parent, inputAccessNodes, [...this.mapIdentifiers, element], this.context
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
        
        if (!isParentFocusedST && isMapFn && this.isWithinVariableStmt === 0) {
            this.isWithinMapFn += 1;
            const arrayFnConnectorNode = new ArrayFnConnectorNode(this.context, node, parent);
            this.intermediateNodes.push(arrayFnConnectorNode);
        }
    }

    beginVisitVariableStatement(node: VariableStatement, parent: Node): void {
        const { focusedST, views } = this.context;
        const lastView = views[views.length - 1];
        const { label, sourceFieldFQN } = lastView;
        // Constraint: Only one variable declaration is allowed in a local variable statement. 
        const varDecl = node.getDeclarations()[0];
    
        const isFocusedST = isPositionsEquals(getPosition(node), getPosition(focusedST));
        
        if (isFocusedST) {
            const initializer = varDecl.getInitializer();
            if (initializer) {
                if (Node.isCallExpression(initializer)) {
                    const { mapFnIndex } = lastView.subMappingInfo;
                    const inputType = getDMType(sourceFieldFQN, this.context.inputTrees[0], mapFnIndex);
                    this.inputNode = new FocusedInputNode(this.context, initializer, inputType);
                } else if (!isObjectOrArrayLiteralExpression(initializer) && this.isWithinMapFn === 0) {
                    const inputAccessNodes = getInputAccessNodes(initializer);
                    if (canConnectWithLinkConnector(inputAccessNodes, initializer)) {
                        const linkConnectorNode = createLinkConnectorNode(
                            node, label, parent, inputAccessNodes, this.mapIdentifiers.slice(0), this.context
                        );
                        this.intermediateNodes.push(linkConnectorNode);
                    }
                }
            }
        } else {
            this.isWithinVariableStmt += 1;
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

    endVisitVariableStatement(node: VariableStatement, parent: Node): void {
        const { focusedST } = this.context;
        const isFocusedST = isPositionsEquals(getPosition(node), getPosition(focusedST));
        
        if (!isFocusedST) {
            this.isWithinVariableStmt -= 1;
        }
    }

    getNodes() {
        // create node for deal with sub mappings
        const subMappingNode = new SubMappingNode(this.context);

        const nodes = [this.inputNode, subMappingNode, this.outputNode];
        nodes.push(...this.intermediateNodes);

        return nodes;
    }

    getRootInputNode() {
        return createInputNodeForDmFunction(this.context.functionST, this.context);
    }

    getInputNode() {
        return this.inputNode;
    }

    getIntermediateNodes() {
        return this.intermediateNodes;
    }
}
