/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ClassDefinition, ConstDeclaration, FunctionDefinition, ModuleVarDecl, ObjectMethodDefinition, ResourceAccessorDefinition, ServiceDeclaration, STKindChecker, STNode, TypeDefinition, Visitor } from "@wso2-enterprise/syntax-tree";

import { generateConstructIdStub, MODULE_DELIMETER, SUB_DELIMETER } from "./util";

export class FindConstructByIndexVisitor implements Visitor {
    private extractedUid: string;
    private stack: string[];
    private moduleServiceIndex: number;
    private moduleFunctionIndex: number;
    private moduleClassIndex: number;
    private moduleTypeIndex: number;
    private classMemberIndex: number;
    private constantIndex: number;
    private moduleVarIndex: number;
    private bodyString: string;
    private selectedNode: STNode;
    private updatedUid: string;

    constructor(uid: string, bodyString: string) {
        this.extractedUid = this.extractUidWithIndex(uid);
        this.bodyString = bodyString;
        this.stack = [];
        this.moduleFunctionIndex = 0;
        this.moduleServiceIndex = 0;
        this.moduleClassIndex = 0;
        this.moduleTypeIndex = 0;
        this.classMemberIndex = 0;
        this.constantIndex = 0;
        this.moduleVarIndex = 0;
    }

    beginVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
        this.moduleClassIndex++;
        this.classMemberIndex = 0;
        const currentConstructIdStub = generateConstructIdStub(node, this.moduleClassIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.moduleServiceIndex++;
        this.classMemberIndex = 0;
        const currentConstructIdStub = generateConstructIdStub(node, this.moduleServiceIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode): void {
        this.classMemberIndex++;
        const currentConstructIdStub = generateConstructIdStub(node, this.classMemberIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitObjectMethodDefinition(node: ObjectMethodDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitTypeDefinition(node: TypeDefinition, parent?: STNode): void {
        this.moduleTypeIndex++;
        const currentConstructIdStub = generateConstructIdStub(node, this.moduleTypeIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitTypeDefinition(node: TypeDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        let index: number;

        if (STKindChecker.isModulePart(parent)) {
            this.moduleFunctionIndex++;
            index = this.moduleFunctionIndex;
        } else {
            this.classMemberIndex++;
            index = this.classMemberIndex;
        }

        const currentConstructIdStub = generateConstructIdStub(node, index);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.classMemberIndex++;
        const currentConstructIdStub = generateConstructIdStub(node, this.classMemberIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitModuleVarDecl(node: ModuleVarDecl, parent?: STNode): void {
        this.moduleVarIndex++;
        const currentConstructIdStub = generateConstructIdStub(node, this.moduleVarIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitModuleVarDecl(node: ModuleVarDecl, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitConstDeclaration(node: ConstDeclaration, parent?: STNode): void {
        this.constantIndex++;
        const currentConstructIdStub = generateConstructIdStub(node, this.constantIndex);
        const constructIdStub = this.extractUidWithIndex(currentConstructIdStub);
        const nextUid = this.getCurrentUid(currentConstructIdStub);

        if (this.extractedUid === this.getCurrentUid(constructIdStub)) {
            this.selectedNode = node;
            this.updatedUid = nextUid;
        }

        this.stack.push(nextUid);
    }

    endVisitConstDeclaration(node: ConstDeclaration, parent?: STNode): void {
        this.stack.pop();
    }

    public getNode(): STNode {
        return this.selectedNode;
    }

    public getUid(): string {
        return this.updatedUid;
    }

    private extractUidWithIndex(uid: string): string {
        const uidSegmentArray = uid.split(SUB_DELIMETER);
        if (uidSegmentArray.length > 2) {
            uidSegmentArray.splice(uidSegmentArray.length - 2, 1);
        }
        return uidSegmentArray.join(SUB_DELIMETER);
    }


    private getCurrentUid(idStub: string) {
        const parentStub = this.stack.reduce((acc, curr) => `${acc}${acc.length > 0 ? MODULE_DELIMETER : ''}${curr}`, '');
        return `${parentStub}${parentStub.length > 0 ? MODULE_DELIMETER : ''}${idStub}`;
    }
}

