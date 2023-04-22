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

import {
    ClassDefinition,
    FunctionDefinition,
    ObjectMethodDefinition,
    ResourceAccessorDefinition,
    ServiceDeclaration,
    STKindChecker,
    STNode,
    TypeDefinition,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { generateConstructIdStub, MODULE_DELIMETER } from "./util";

export class FindNodeByUidVisitor implements Visitor {
    private uid: string;
    private stack: string[];
    private moduleServiceIndex: number;
    private moduleFunctionIndex: number;
    private moduleClassIndex: number;
    private moduleTypeIndex: number;
    private classMemberIndex: number;
    private selectedNode: STNode;

    constructor(uid: string) {
        this.uid = uid;
        this.stack = [];
        this.moduleFunctionIndex = 0;
        this.moduleServiceIndex = 0;
        this.moduleClassIndex = 0;
        this.moduleTypeIndex = 0;
        this.classMemberIndex = 0;
    }

    beginVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
        this.moduleClassIndex++;
        this.classMemberIndex = 0;
        this.stack.push(generateConstructIdStub(node, this.moduleClassIndex));
        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.classMemberIndex = 0;
        this.moduleServiceIndex++;
        this.stack.push(generateConstructIdStub(node, this.moduleServiceIndex));
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
            this.stack.push(generateConstructIdStub(node, this.moduleFunctionIndex));
        } else {
            this.classMemberIndex++;
            this.stack.push(generateConstructIdStub(node, this.classMemberIndex));
        }

        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.classMemberIndex++;
        this.stack.push(generateConstructIdStub(node, this.classMemberIndex));

        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode) {
        this.classMemberIndex++;
        this.stack.push(generateConstructIdStub(node, this.classMemberIndex));

        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode) {
        this.stack.pop();
    }

    beginVisitTypeDefinition(node: TypeDefinition, parent?: STNode): void {
        this.moduleTypeIndex++;
        this.stack.push(generateConstructIdStub(node, this.moduleTypeIndex));

        if (this.getCurrentUid() === this.uid) {
            this.selectedNode = node;
        }
    }

    endVisitTypeDefinition(node: TypeDefinition, parent?: STNode): void {
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
