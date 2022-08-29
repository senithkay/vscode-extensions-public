import { SpecificField, STNode } from "@wso2-enterprise/syntax-tree";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { ExpressionEditorLangClientInterface, LibraryDataResponse, LibraryDocResponse, LibrarySearchResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React from "react";


export interface StatementEditorComponentProps {
    model: SpecificField,
    getEELangClient?: () => Promise<ExpressionEditorLangClientInterface>;
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
    const {model, getEELangClient, currentFile, applyModifications, library, onCancel} = props;


const stmtEditorComponent = StatementEditorWrapper(
        {
            formArgs: { formArgs: {
                targetPosition: model.position
                } },
            config: {
                type: "Custom",
                model: model.valueExpr
            },
            onWizardClose: onCancel,
            syntaxTree: null,
            stSymbolInfo: null,
            getLangClient: getEELangClient,
    library,
    label: model.fieldName.value,
    initialSource:  model.valueExpr.source,
    applyModifications,
    currentFile,
    onCancel: onCancel,
    isExpressionMode: true
        }
    );

    return  (stmtEditorComponent)
}
export const StatementEditorComponent = React.memo(StatementEditorC);
