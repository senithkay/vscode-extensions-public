/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { SpecificField, STKindChecker } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { ExpressionComponent } from "../../Expression";
import { InputEditor } from "../../InputEditor";
import { useStatementEditorStyles } from "../../styles";

interface SpecificFieldProps {
    model: SpecificField
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
    isTypeDescriptor: boolean
}

export function SpecificFieldComponent(props: SpecificFieldProps) {
    const { model, userInputs, diagnosticHandler, isTypeDescriptor } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    let hasFieldNameSelected = false;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    let fieldName: ReactNode;

    if (STKindChecker.isIdentifierToken(model.fieldName)) {
        const inputEditorProps = {
            statementType: model.kind,
            model: model.fieldName,
            expressionHandler,
            userInputs,
            diagnosticHandler,
            isTypeDescriptor
        };

        fieldName =  <InputEditor {...inputEditorProps} />
    } else {
        fieldName = (
            <ExpressionComponent
                model={model.fieldName}
                isRoot={false}
                userInputs={userInputs}
                diagnosticHandler={diagnosticHandler}
                isTypeDescriptor={false}
            />
        );
    }

    const valueExpression: ReactNode = (
        <ExpressionComponent
            model={model.valueExpr}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnFieldName = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.fieldName, false, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    };

    if (currentModel.model) {
        if (currentModel.model.position === model.fieldName.position) {
            hasFieldNameSelected = true;
        }
    }

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasFieldNameSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnFieldName}
            >
                {fieldName}
            </button>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.colon.value}
            </span>
            {valueExpression}
        </span>
    );
}
