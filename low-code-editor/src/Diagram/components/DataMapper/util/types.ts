/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { STNode } from "@ballerina/syntax-tree";

import { STModification } from "../../../../Definitions";
import { DataMapperConfig } from "../../Portals/ConfigForm/types";
import { FieldViewState } from "../viewstate";

export interface DataMapperState {
    inputSTNodes: STNode[];
    outputSTNode: STNode;
    maxFieldWidth: number;
    stSymbolInfo: any;
    showAddJsonFieldForm: boolean;
    showAddVariableForm: boolean;
    showConfigureOutputForm: boolean;
    isExistingOutputSelected: boolean;
    isJsonRecordTypeSelected: boolean;
    dataMapperConfig: DataMapperConfig;
    updateDataMapperConfig: (config: DataMapperConfig) => void;
    dataMapperStart: (config: DataMapperConfig) => void;
    dispatchMutations: (modifications: STModification[]) => void;
    constantMap: Map<string, FieldViewState>;
    constantList: FieldViewState[];
    squashConstants?: boolean;
    isInitializationInProgress: boolean;
    getDiagramEditorLangClient: any;
    langServerURL: any;
    draftArrows?: { x1: number, x2: number, y1: number, y2: number }[];
}

export enum FieldDraftType {
    STRING,
    OBJECT
}
