// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline jsx-no-lambda
import React, { useContext } from "react";

import  {
    ExpressionEditor,
    ExpressionEditorCustomTemplate,
    GetExpCompletionsParams
} from "@wso2-enterprise/ballerina-expression-editor";
import {
    DiagramDiagnostic,
    ExpressionInjectablesProps,
    FormElementProps,
    PrimitiveBalType
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import * as monaco from "monaco-editor";

import { Context } from "../../../../../Contexts/Diagram";
import { ExpressionConfigurable } from "../ExpressionConfigurable";

export interface LowCodeExpressionEditorProps {
    validate?: (field: string, isInvalid: boolean, isEmpty: boolean, canIgnore?: boolean) => void;
    clearInput?: boolean;
    tooltipTitle?: any;
    tooltipActionText?: string;
    tooltipActionLink?: string;
    interactive?: boolean;
    focus?: boolean;
    revertFocus?: () => void;
    statementType?: PrimitiveBalType | any;
    customTemplate?: ExpressionEditorCustomTemplate;
    expandDefault?: boolean;
    revertClearInput?: () => void;
    onFocus?: (value: string) => void;
    hideTextLabel?: boolean;
    changed?: boolean | string;
    subEditor?: boolean;
    editPosition?: any;
    expressionInjectables?: ExpressionInjectablesProps;
    hideSuggestions?: boolean;
    hideExpand?: boolean;
    getCompletions?: (completionProps: GetExpCompletionsParams) => Promise<monaco.languages.CompletionList>;
    showHints?: boolean;
    disabled?: boolean;
    hideTypeLabel?: boolean;
    enterKeyPressed?: (value: string) => void;
    initialDiagnostics?: DiagramDiagnostic[];
    diagnosticsFilterExtraColumns?: {
        start?: number;
        end?: number;
    };
    disableFiltering?: boolean;
}

export function LowCodeExpressionEditor(props: FormElementProps<LowCodeExpressionEditorProps>) {
    const {
        state: { targetPosition: targetPositionDraft },
        props: {
            currentFile,
            langServerURL,
            syntaxTree,
            diagnostics: mainDiagnostics,
        },
        api: {
            ls: { getExpressionEditorLangClient }
        }
    } = useContext(Context);

    return(
        <>
            <ExpressionEditor
                targetPositionDraft={targetPositionDraft}
                currentFile={currentFile}
                langServerURL={langServerURL}
                mainDiagnostics={mainDiagnostics}
                getExpressionEditorLangClient={getExpressionEditorLangClient}
                expressionConfigurable={(configProps: any) => (<ExpressionConfigurable {...configProps}/>)}
                syntaxTree={syntaxTree}
                {...props}
            />
        </>
    );
}
