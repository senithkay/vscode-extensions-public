/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
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
