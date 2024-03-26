/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { TypeKind } from "../../types";
import {
    FunctionDefinition,
    STKindChecker,
    Visitor
} from "@wso2-enterprise/syntax-tree";
import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { SelectionState } from "../../DataMapper/DataMapper";
import {
    MappingConstructorNode,
    RequiredParamNode
} from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";

export class NodeInitVisitor implements Visitor {

    private inputParamNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private otherInputNodes: DataMapperNodeModel[] = [];
    private queryNode: DataMapperNodeModel;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) { }

    beginVisitFunctionDefinition(node: FunctionDefinition) {
        const typeDesc = node.functionSignature?.returnTypeDesc && node.functionSignature.returnTypeDesc.type;
        const exprFuncBody = STKindChecker.isExpressionFunctionBody(node.functionBody) && node.functionBody;
        let isFnBodyQueryExpr = false;
        if (typeDesc && exprFuncBody) {
            let returnType = undefined; // TODO: get return type

            if (returnType) {

                // if (returnType.typeName === TypeKind.Record) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        exprFuncBody,
                        typeDesc,
                        returnType
                    );
                // }
                this.outputNode.setPosition(0, 0);
            }
        }
        // create input nodes
        if (!isFnBodyQueryExpr) {
            const params = node.functionSignature.parameters;
            if (params.length) {
                for (const param of params) {
                    if (STKindChecker.isRequiredParam(param)) {
                        const paramNode = new RequiredParamNode(
                            this.context,
                            param,
                            param.typeName
                        );
                        paramNode.setPosition(0, 0);
                        this.inputParamNodes.push(paramNode);
                    } else {
                        // TODO for other param types
                    }
                }
            }
        }
    }

    getNodes() {
        const nodes = [...this.inputParamNodes, ...this.otherInputNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        this.intermediateNodes.forEach((node) => {
            node.setPosition(0, 0);
        });
        nodes.push(...this.intermediateNodes);
        if (this.queryNode){
            nodes.unshift(this.queryNode);
        }
        return nodes;
    }
}
