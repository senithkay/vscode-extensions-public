/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    ComponentViewInfo,
    ConfigOverlayFormStatus,
    FileListEntry,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { ExpressionInfo, SelectionState, ViewOption } from "../../components/DataMapper/DataMapper";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    selection: SelectionState;
    filePath: string;
    langClientPromise: Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo: STSymbolInfo;
    moduleVariables: any;
    changeSelection: (mode: ViewOption, selection?: SelectionState) => void;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    goToSource: (position: { startLine: number, startColumn: number }, filePath?: string) => void;
    diagnostics: Diagnostic[];
    enableStatementEditor: (expressionInfo: ExpressionInfo) => void;
    collapsedFields: string[];
    handleCollapse: (fieldName: string, expand?: boolean) => void;
    isStmtEditorCanceled: boolean;
    handleOverlay: (showOverlay: boolean) => void;
    ballerinaVersion: string;
    handleLocalVarConfigPanel: (showPanel: boolean) => void;
    updateActiveFile?: (currentFile: FileListEntry) => void;
    updateSelectedComponent?: (info: ComponentViewInfo) => void;
    referenceManager?: {
        currentReferences: string[],
        handleCurrentReferences: (referencedFields: string[]) => void
    }
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public filePath: string,
        private _functionST: FunctionDefinition,
        private _selection: SelectionState,
        public langClientPromise: Promise<IBallerinaLangClient>,
        public currentFile: {
            content: string,
            path: string,
            size: number
        },
        public stSymbolInfo: STSymbolInfo,
        public moduleVariables: any,
        public changeSelection: (mode: ViewOption, selection?: SelectionState) => void,
        public applyModifications: (modifications: STModification[]) => Promise<void>,
        public goToSource: (position: { startLine: number, startColumn: number }, filePath?: string) => void,
        public diagnostics: Diagnostic[],
        public enableStatementEditor: (expressionInfo: ExpressionInfo) => void,
        public collapsedFields: string[],
        public handleCollapse: (fieldName: string, expand?: boolean) => void,
        public isStmtEditorCanceled: boolean,
        public handleOverlay: (showOverlay: boolean) => void,
        public ballerinaVersion: string,
        public handleLocalVarConfigPanel: (showPanel: boolean) => void,
        public updateActiveFile?: (currentFile: FileListEntry) => void,
        public updateSelectedComponent?: (info: ComponentViewInfo) => void,
        public referenceManager?: {
            currentReferences: string[],
            handleCurrentReferences: (referencedFields: string[]) => void;
        }
    ){}

    public get functionST(): FunctionDefinition {
        return this._functionST;
    }

    public set functionST(st: FunctionDefinition) {
        if (!st && !STKindChecker.isFunctionDefinition(st)) {
            throw new Error("Invalid value set as FunctionST.");
        }
        this._functionST = st;
    }

    public get selection(): SelectionState {
        return this._selection;
    }

    public set selection(selection: SelectionState) {
        this._selection = selection;
    }
}
