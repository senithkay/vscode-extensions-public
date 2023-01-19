/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { FunctionDefinition, ResourceAccessorDeclaration, ResourceAccessorDefinition, ServiceDeclaration, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";

import { ELEMENT_KEYWORDS, MODULE_DELIMETER, SUB_DELIMETER } from "./uid-generation-visitor";
import { generateResourcePathString } from "./util";

export class FindNodeByUidVisitor implements Visitor {
    private uid: string;
    private stack: string[];
    private moduleServiceIndex: number;
    private moduleFunctionIndex: number;
    private selectedNode: STNode;

    constructor(uid: string) {
        this.uid = uid;
        this.moduleFunctionIndex = 0;
        this.moduleServiceIndex = 0;
        this.stack = [];
    }

    beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.moduleServiceIndex++;
        this.stack.push(`${ELEMENT_KEYWORDS.SERVICE}${SUB_DELIMETER}${this.moduleServiceIndex}`);
        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.stack.pop();
    }


    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        if (parent && STKindChecker.isModulePart(parent)) {
            this.moduleFunctionIndex++;
            this.stack.push(`${ELEMENT_KEYWORDS.FUNCTION}${SUB_DELIMETER}${this.moduleFunctionIndex}`);
        } else {
            this.stack.push(`${ELEMENT_KEYWORDS.FUNCTION}${SUB_DELIMETER}${node.functionName.value}`);
        }

        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.stack.pop();
    }


    beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        const id: string = `${ELEMENT_KEYWORDS.RESOURCE}${SUB_DELIMETER}${node.functionName.value}`;

        if (node.relativeResourcePath.length > 0) {
            id.concat(`${SUB_DELIMETER}${generateResourcePathString(node.relativeResourcePath)}`);
        }

        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    private getCurrentUid(): string {
        return this.stack.reduce((prev, current) =>
            prev.length === 0 ? current : `${prev}${MODULE_DELIMETER}${current}`, '');
    }

    public getNode(): STNode {
        return this.selectedNode;
    }
}
