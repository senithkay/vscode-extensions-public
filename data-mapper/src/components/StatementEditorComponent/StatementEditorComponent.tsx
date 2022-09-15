import { NodePosition, SpecificField, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LibraryDataResponse, LibraryDocResponse, LibrarySearchResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React from "react";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { ExpressionInfo } from "../DataMapper/DataMapper";
import { getUpdatedSource } from "../../utils/st-utils";
import { Panel } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import FormControl from "@material-ui/core/FormControl";


export interface StatementEditorComponentProps {
    expressionInfo: ExpressionInfo,
    label: string,
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
    const {expressionInfo, label, langClientPromise, currentFile, applyModifications, library, onCancel, importStatements} = props;

    const updatedContent = expressionInfo.fieldName?  getUpdatedSource(expressionInfo.fieldName, currentFile.content,
        expressionInfo.specificFieldPosition) : currentFile.content;

    const stmtEditorComponent = StatementEditorWrapper(
        {
            formArgs: { formArgs: {
                targetPosition: expressionInfo.valuePosition
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
            label: expressionInfo.label,
            initialSource:  expressionInfo.value,
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

    return  (
    <Panel onClose={onCancel}>
        <FormControl variant="outlined" data-testid="data-mapper-stmt-editor-form" >
            {stmtEditorComponent}
        </FormControl>
    </Panel>)
}
export const StatementEditorComponent = React.memo(StatementEditorC);
