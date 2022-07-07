import {
    DiagramEditorLangClientInterface,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    filePath: string;
    getLangClient: () => Promise<DiagramEditorLangClientInterface>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    updateFileContent: (filePath: string, fileContent: string) => Promise<boolean>;
    applyModifications?: (modifications: STModification[]) => void;
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
        private _updateFileContet: (filePath: string, fileContent: string) => Promise<boolean>,
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

    // public getLangClient(): Promise<BalleriaLanguageClient> {
    //     return this._langClientPromise();
    // }
    //
    // public getLangClient() {
    //     return this._langClientPromise;
    // }

    public updateFileContent(filePath: string, fileContent: string): Promise<boolean> {
        return this._updateFileContet(filePath, fileContent);
    }
}
