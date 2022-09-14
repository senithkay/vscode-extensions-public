import {NodePosition, SpecificField, STKindChecker, STNode} from "@wso2-enterprise/syntax-tree";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LibraryDataResponse, LibraryDocResponse, LibrarySearchResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React from "react";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";


export interface StatementEditorComponentProps {
    model: STNode,
    label: string,
    langClientPromise?:Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    applyModifications: (modifications: STModification[]) => void;
    library?: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    onCancel: () => void;
}
function StatementEditorC(props: StatementEditorComponentProps) {
    const {model, label, langClientPromise, currentFile, applyModifications, library, onCancel} = props;


const stmtEditorComponent = StatementEditorWrapper(
        {
            formArgs: { formArgs: {
                targetPosition: model.position
                } },
            config: {
                type: "Custom",
                model
            },
            onWizardClose: onCancel,
            syntaxTree: null,
            stSymbolInfo: null,
            getLangClient: () => langClientPromise,
            library,
            label,
            initialSource:  model.source,
            applyModifications,
            currentFile,
            onCancel: onCancel,
            isExpressionMode: true
        }
    );

    return  (stmtEditorComponent)
}
export const StatementEditorComponent = React.memo(StatementEditorC);
