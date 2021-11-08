import { ModulePart, STNode } from "@ballerina/syntax-tree";

export interface ASTInfo {
    isLoading: boolean;
    packageST?: PackageST;
    selectedAttachedST?: STNode;
    selectedST?: STNode;
    displayST?: STNode;
    error?: Error;
}

export interface PackageST {
    ballerinaVersion: string;
    packageOrg: string;
    packageName: string;
    packageVersion: string;
    modules: {
        [moduleName: string]: {
            moduleName: string;
            documents: {
                [documentName: string]: {
                    documentName: string;
                    syntaxTree: ModulePart;
                };
            };
        };
    }
}
