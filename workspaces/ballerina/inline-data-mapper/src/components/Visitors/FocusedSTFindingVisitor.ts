/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Visitor } from "../../ts/base-visitor";

export class FocusedSTFindingVisitor implements Visitor {
    private targetFieldFqn: string;
    private resolvedNode: any;
    private index: number;
    private stack: string[];

    constructor(targetFieldFqn: string) {
        this.targetFieldFqn = targetFieldFqn;
        this.resolvedNode = null;
        this.index = -1;
        this.stack = [];
    }

    public beginVisit(node: any) {
    }

    private getFieldFqn(): string {
        return this.stack.reduce((prev, current) =>
            prev.length === 0 ? current : `${prev}.${current}`, '');
    }

    public getResolvedNode(): any {
        return this.resolvedNode;
    }
}
