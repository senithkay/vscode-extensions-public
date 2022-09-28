import React from "react";

import FormControl from "@material-ui/core/FormControl";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { LibraryDataResponse, LibraryDocResponse, LibrarySearchResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Panel } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { getUpdatedSource } from "../../utils/st-utils";
import { ExpressionInfo } from "../DataMapper/DataMapper";


export interface StatementEditorComponentProps {
    expressionInfo: ExpressionInfo,
    langClientPromise?: Promise<IBallerinaLangClient>;
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
    onClose: () => void;
    importStatements: string[];
}
function StatementEditorC(props: StatementEditorComponentProps) {
    const {
        expressionInfo,
        langClientPromise,
        currentFile,
        applyModifications,
        library,
        onCancel,
        onClose,
        importStatements
    } = props;

    const updatedContent = expressionInfo.fieldName ?  getUpdatedSource(expressionInfo.fieldName, currentFile.content,
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
            onWizardClose: onClose,
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
            onCancel,
            isExpressionMode: true,
            importStatements
        }
    );

    return  (
        <Panel onClose={onCancel}>
            <FormControl variant="outlined" data-testid="data-mapper-stmt-editor-form" >
                {stmtEditorComponent}
            </FormControl>
        </Panel>
    )
}

export const StatementEditorComponent = React.memo(StatementEditorC);
