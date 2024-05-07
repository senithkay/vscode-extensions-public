/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { PropertyAssignment } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";

export class FocusedSTFindingVisitor implements Visitor {
    private targetFieldFqn: string;
    private resolvedNode: PropertyAssignment;
    private index: number;
    private stack: string[];

    constructor(targetFieldFqn: string) {
        this.targetFieldFqn = targetFieldFqn;
        this.resolvedNode = null;
        this.index = -1;
        this.stack = [];
    }

    public beginVisitPropertyAssignment(node: PropertyAssignment) {
        const propertyName = node.getName();
        this.stack.push(propertyName);
        const filedFqn = this.getFieldFqn();

        if (filedFqn === this.targetFieldFqn) {
            this.resolvedNode = node;
        }
    }

    public endVisitPropertyAssignment(_node: PropertyAssignment): void {
        this.stack.pop();
    }

    private getFieldFqn(): string {
        return this.stack.reduce((prev, current) =>
            prev.length === 0 ? current : `${prev}.${current}`, '');
    }

    public getResolvedNode(): PropertyAssignment {
        return this.resolvedNode;
    }
}
