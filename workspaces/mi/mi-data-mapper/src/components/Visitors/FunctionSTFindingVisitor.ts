/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Node, VariableDeclaration, VariableStatement } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";

export class FunctionSTFindingVisitor implements Visitor {
    private _functionST: VariableDeclaration;

    constructor(
        private functionName: string,
    ) {}


    beginVisitVariableStatement(node: VariableStatement): void {
        if (!this._functionST) {
            const variableDeclaration = node
                .getDeclarationList()
                .getDeclarations()[0];

            const fnName = variableDeclaration.getName();
            const initializer = variableDeclaration.getInitializer();
    
            if (fnName === this.functionName && initializer && Node.isArrowFunction(initializer)) {
                this._functionST = variableDeclaration;
            }   
        }     
    }

    getFunctionST() {
        return this._functionST;
    }
}
