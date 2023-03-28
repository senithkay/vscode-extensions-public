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

import { ClassDefinition, FunctionDefinition, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { generateConstructIdStub, MODULE_DELIMETER, SUB_DELIMETER } from "./util";

export class FindConstructByIndexVisitor implements Visitor {
    private extractedUid: string;
    private stack: string[];
    private moduleServiceIndex: number;
    private moduleFunctionIndex: number;
    private moduleClassIndex: number;
    private moduleTypeIndex: number;
    private classMemberIndex: number;
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
    }

    beginVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
        this.moduleClassIndex++;
        this.classMemberIndex = 0;
        const constructIdStub = this.getCurrentUid(this.extractUidWithIndex(generateConstructIdStub(node, this.moduleClassIndex)));

        if (this.extractedUid === constructIdStub) {
            this.selectedNode = node;
            this.updatedUid = `${constructIdStub}${SUB_DELIMETER}${this.moduleClassIndex}`;
        }

        this.stack.push(`${constructIdStub}${SUB_DELIMETER}${this.moduleClassIndex}`);
    }

    endVisitClassDefinition(node: ClassDefinition, parent?: STNode): void {
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
        const parentStub = this.stack.reduce((acc, curr) => `${acc}${MODULE_DELIMETER}${curr}`, '');
        return `${parentStub}${parentStub.length > 0 ? MODULE_DELIMETER : ''}${idStub}`;
    }
}

