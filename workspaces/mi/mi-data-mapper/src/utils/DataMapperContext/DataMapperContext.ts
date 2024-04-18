/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { VariableDeclaration } from "ts-morph";

export interface IDataMapperContext {
    functionST: VariableDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
    goToSource: (range: Range) => void;
    applyModifications: () => void;
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public functionST: VariableDeclaration,
        public inputTrees: DMType[],
        public outputTree: DMType,
        public goToSource: (range: Range) => void,
        public applyModifications: () => void
    ){}
}
