import {
    DiagramEditorLangClientInterface,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    filePath: string;
    getLangClient: () => Promise<DiagramEditorLangClientInterface>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    applyModifications: (modifications: STModification[]) => void;
    seletedST: STNode;
    setSelectedST: (st: STNode) => void;
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
        public applyModifications: (modifications: STModification[]) => void,
        public seletedST: STNode,
        public setSelectedST: (st: STNode) => void
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
