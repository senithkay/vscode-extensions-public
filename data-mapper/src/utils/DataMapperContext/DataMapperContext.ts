import {
    DiagramEditorLangClientInterface,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { SelectionState } from "../../components/DataMapper/DataMapper";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    selection: SelectionState;
    filePath: string;
    getLangClient: () => Promise<DiagramEditorLangClientInterface>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo: STSymbolInfo;
    changeSelection: (selection: SelectionState) => void;
    applyModifications: (modifications: STModification[]) => void;
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public filePath: string,
        private _functionST: FunctionDefinition,
        private _selection: SelectionState,
        public getLangClient: () => Promise<DiagramEditorLangClientInterface>,
        public currentFile: {
            content: string,
            path: string,
            size: number
        },
        public stSymbolInfo: STSymbolInfo,
        public changeSelection: (selection: SelectionState) => void,
        public applyModifications: (modifications: STModification[]) => void
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
