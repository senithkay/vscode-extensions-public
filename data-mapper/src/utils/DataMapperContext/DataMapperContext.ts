import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { FunctionDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    filePath: string;
    getLangClient: () => Promise<BalleriaLanguageClient>;
    updateFileContent: (filePath: string, fileContent: string) => Promise<boolean>;
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public filePath: string,
        private _functionST: FunctionDefinition,
        private _langClientPromise: Promise<BalleriaLanguageClient>,
        private _updateFileContet: (filePath: string, fileContent: string) => Promise<boolean>
        ) {
    }

    public get functionST(): FunctionDefinition {
        return this._functionST;
    }

    public set functionST(st: FunctionDefinition) {
        if (!st && !STKindChecker.isFunctionDefinition(st)) {
            throw new Error("Invalid value set as FunctionST.");
        }
        this._functionST = st;
    }
    
    public getLangClient(): Promise<BalleriaLanguageClient> {
        return this._langClientPromise;
    }

    public updateFileContent(filePath: string, fileContent: string): Promise<boolean> {
        return this._updateFileContet(filePath, fileContent);
    }
}