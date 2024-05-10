/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { FunctionDeclaration, PropertyAssignment, ReturnStatement } from "ts-morph";

import { View } from "../../components/DataMapper/DataMapper";

export interface IDataMapperContext {
    functionST: FunctionDeclaration;
    focusedST: FunctionDeclaration | PropertyAssignment | ReturnStatement;
    inputTrees: DMType[];
    outputTree: DMType;
    views: View[];
    addView: (view: View) => void;
    goToSource: (range: Range) => void;
    applyModifications: () => void;
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public functionST: FunctionDeclaration,
        public focusedST: FunctionDeclaration | PropertyAssignment | ReturnStatement,
        public inputTrees: DMType[],
        public outputTree: DMType,
        public views: View[] = [],
        public addView: (view: View) => void,
        public goToSource: (range: Range) => void,
        public applyModifications: () => void
    ){}
}
