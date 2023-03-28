/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import { ClassDefinition, FunctionDefinition, ObjectMethodDefinition, ServiceDeclaration, STKindChecker, STNode, TypeDefinition, Visitor } from "@wso2-enterprise/syntax-tree";
import { generateConstructIdStub, MODULE_DELIMETER, SUB_DELIMETER } from "./util";

export class FindConstructByNameVisitor implements Visitor {
    private extractedUid: string;
    private stack: string[];
    private moduleServiceIndex: number;
    private moduleFunctionIndex: number;
    private moduleClassIndex: number;
    private moduleTypeIndex: number;
    private classMemberIndex: number;
    private selectedNode: STNode;
    private updatedUid: string;

    constructor(uid: string) {
        this.extractedUid = this.extractUidWithName(uid);
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
        const constructIdStub = this.getCurrentUid(generateConstructIdStub(node));

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = `${constructIdStub}${SUB_DELIMETER}${this.moduleClassIndex}`;
        }

        this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.moduleClassIndex}`);
    }

    endVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.moduleServiceIndex++;
        this.classMemberIndex = 0;
        const constructIdStub = this.getCurrentUid(generateConstructIdStub(node));

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = `${constructIdStub}${SUB_DELIMETER}${this.moduleServiceIndex}`;
        }

        this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.moduleServiceIndex}`);
    }

    endVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        const constructIdStub = this.getCurrentUid(generateConstructIdStub(node));

        let uidNext: string;

        if (STKindChecker.isModulePart(parent)) {
            this.moduleFunctionIndex++;
            this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.moduleFunctionIndex}`);
            uidNext = `${constructIdStub}${SUB_DELIMETER}${this.moduleFunctionIndex}`
        } else {
            this.classMemberIndex++;
            this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.classMemberIndex}`);
            uidNext = `${constructIdStub}${SUB_DELIMETER}${this.classMemberIndex}`
        }

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = uidNext;
        }
    }

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitResourceAccessorDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.classMemberIndex++;
        const constructIdStub = this.getCurrentUid(generateConstructIdStub(node));

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = `${constructIdStub}${SUB_DELIMETER}${this.classMemberIndex}`;
        }

        this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.classMemberIndex}`);
    }

    endVisitResourceAccessorDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode): void {
        this.classMemberIndex++;
        const constructIdStub = this.getCurrentUid(generateConstructIdStub(node));

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = `${constructIdStub}${SUB_DELIMETER}${this.classMemberIndex}`;
        }

        this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.classMemberIndex}`);
    }

    endVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitTypeDefinition(node: TypeDefinition, parent?: STNode): void {
        this.moduleTypeIndex++;
        const constructIdStub = this.getCurrentUid(generateConstructIdStub(node));

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = `${constructIdStub}${SUB_DELIMETER}${this.moduleTypeIndex}`;
        }

        this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.moduleTypeIndex}`);
    }

    endVisitTypeDefinition(node: TypeDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    private extractUidWithName(uid: string): string {
        const uidStubs = uid.split(SUB_DELIMETER);
        uidStubs.splice(uidStubs.length - 1, 1);
        return uidStubs.join(SUB_DELIMETER);
    }

    private getCurrentUid(idStub: string): string {
        const parentStub = this.stack.reduce((acc, curr) => `${acc}${MODULE_DELIMETER}${curr}`, '');
        return `${parentStub}${parentStub.length > 0 ? MODULE_DELIMETER : ''}${idStub}`;
    }

    public getNode(): STNode {
        return this.selectedNode;
    }

    public getUid(): string {
        return this.updatedUid;
    }
}

