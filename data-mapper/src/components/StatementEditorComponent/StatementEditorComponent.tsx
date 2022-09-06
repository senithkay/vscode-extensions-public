import { SpecificField } from "@wso2-enterprise/syntax-tree";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LibraryDataResponse, LibraryDocResponse, LibrarySearchResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React from "react";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { Panel } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import FormControl from "@material-ui/core/FormControl";


export interface StatementEditorComponentProps {
    model: SpecificField,
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
    const {model, langClientPromise, currentFile, applyModifications, library, onCancel} = props;

    const stmtEditorComponent = StatementEditorWrapper(
        {
            formArgs: { formArgs: {
                targetPosition: model.valueExpr.position
                } },
            config: {
                type: "Custom",
                model: model.valueExpr
            },
            onWizardClose: onCancel,
            syntaxTree: null,
            stSymbolInfo: null,
            getLangClient: () => langClientPromise,
            library,
            label: model.fieldName.value,
            initialSource:  model.valueExpr.source,
            applyModifications,
            currentFile,
            onCancel: onCancel,
            isExpressionMode: true
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
