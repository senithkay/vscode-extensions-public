import {
    DiagramEditorLangClientInterface, ExpressionEditorLangClientInterface
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import {BalleriaLanguageClient} from "@wso2-enterprise/ballerina-languageclient";

export interface IDataMapperContext {
    functionST: FunctionDefinition;
    filePath: string;
    getLangClient: () => Promise<DiagramEditorLangClientInterface>;
    updateFileContent: (filePath: string, fileContent: string) => Promise<boolean>;
}

export class DataMapperContext implements IDataMapperContext {

    constructor(
        public filePath: string,
        private _functionST: FunctionDefinition,
        public getLangClient: () => Promise<DiagramEditorLangClientInterface>,
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
