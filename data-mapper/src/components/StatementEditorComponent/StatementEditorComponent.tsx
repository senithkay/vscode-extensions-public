import { SpecificField } from "@wso2-enterprise/syntax-tree";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LibraryDataResponse, LibraryDocResponse, LibrarySearchResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React from "react";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { StatementEditorInfo } from "../DataMapper/DataMapper";
import { getUpdatedSource } from "../../utils/st-utils";


export interface StatementEditorComponentProps {
    statementEditorInfo: StatementEditorInfo,
    langClientPromise?:Promise<IBallerinaLangClient>;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    applyModifications: (modifications: STModification[]) => void;
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    onCancel: () => void;
    importStatements: string[];
}
function StatementEditorC(props: StatementEditorComponentProps) {
    const {statementEditorInfo, langClientPromise, currentFile, applyModifications, library, onCancel, importStatements} = props;

    const updatedContent = statementEditorInfo.fieldName?  getUpdatedSource(statementEditorInfo.fieldName, currentFile.content, 
        statementEditorInfo.specificFieldPosition) : currentFile.content;


const stmtEditorComponent = StatementEditorWrapper(
        {
            formArgs: { formArgs: {
                targetPosition:statementEditorInfo.valuePosition
                } },
            config: {
                type: "Custom",
                model: null
            },
            onWizardClose: onCancel,
            syntaxTree: null,
            stSymbolInfo: null,
            getLangClient: () => langClientPromise,
            library,
            label: statementEditorInfo.label ? statementEditorInfo.label : statementEditorInfo.fieldName,
            initialSource:  statementEditorInfo.value,
            applyModifications,
            currentFile: {
                ...currentFile,
                content: updatedContent,
                originalContent: currentFile.content
            },
            onCancel: onCancel,
            isExpressionMode: true,
            importStatements
        }
    );

    return  (stmtEditorComponent)
}
export const StatementEditorComponent = React.memo(StatementEditorC);
