import {
    DiagramEditorLangClientInterface,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    filePath: string;
    getLangClient: () => Promise<DiagramEditorLangClientInterface>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo: STSymbolInfo;
    applyModifications: (modifications: STModification[]) => void;
    diagnostics: Diagnostic[];
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public filePath: string,
        private _functionST: FunctionDefinition,
        public getLangClient: () => Promise<DiagramEditorLangClientInterface>,
        public currentFile: {
            content: string,
            path: string,
            size: number
        },
        public stSymbolInfo: STSymbolInfo,
        public applyModifications: (modifications: STModification[]) => void,
        public diagnostics: Diagnostic[]
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
}
