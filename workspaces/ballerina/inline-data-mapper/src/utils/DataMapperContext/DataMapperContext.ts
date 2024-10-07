/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IDMType, Range } from "@wso2-enterprise/ballerina-core";
import { FunctionDeclaration, PropertyAssignment, ReturnStatement, VariableStatement } from "ts-morph";

import { View } from "../../components/DataMapper/Views/DataMapperView";

type FocusedST = FunctionDeclaration | PropertyAssignment | ReturnStatement | VariableStatement;

export interface IDataMapperContext {
    functionST: FunctionDeclaration;
    focusedST: FocusedST;
    inputTrees: IDMType[];
    outputTree: IDMType;
    views: View[];
    subMappingTypes: Record<string, IDMType>;
    addView: (view: View) => void;
    goToSource: (range: Range) => void;
    applyModifications: (fileContent: string) => Promise<void>;
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public functionST: FunctionDeclaration,
        public focusedST: FocusedST,
        public inputTrees: IDMType[],
        public outputTree: IDMType,
        public views: View[] = [],
        public subMappingTypes: Record<string, IDMType>,
        public addView: (view: View) => void,
        public goToSource: (range: Range) => void,
        public applyModifications: (fileContent: string) => Promise<void>
    ){}
}
