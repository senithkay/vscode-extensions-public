/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ts } from "ts-morph";
import { Visitor } from "../../ts/base-visitor";

export class FunctionSTFindingVisitor implements Visitor {
    private _functionST: ts.VariableDeclaration;

    constructor(
        private functionName: string,
    ) {}


    beginVisitVariableStatement(node: ts.VariableStatement): void {
        if (!this._functionST) {
            const declarationList = node.declarationList;
            const variableDeclaration = declarationList.declarations[0];
    
            const fnName = variableDeclaration.name.getText();
    
            const initializer = variableDeclaration.initializer;
    
            if (fnName === this.functionName && initializer && ts.isArrowFunction(initializer)) {
                this._functionST = variableDeclaration;
            }   
        }     
    }

    getFunctionST() {
        return this._functionST;
    }
}
