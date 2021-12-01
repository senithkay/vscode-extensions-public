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
import React, {ReactNode, useContext} from "react";

import { FunctionCall, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { isPositionsEquals } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface FunctionCallProps {
    model: FunctionCall
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function FunctionCallComponent(props: FunctionCallProps) {
    const { model, userInputs, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasFunctionNameSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.functionName.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const onClickOnFunctionName = (event: any) => {
        event.stopPropagation();
        expressionHandler(model.functionName, false, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    };

    const functionName: ReactNode = (
        <ExpressionComponent
            model={model.functionName}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const expressionComponent = (
        <span>
            {
                model.arguments.map((expression: STNode, index: number) => (
                    (STKindChecker.isCommaToken(expression)) ? (
                        <span
                            key={index}
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            )}
                        >
                            {expression.value}
                        </span>
                    ) : (
                        <ExpressionComponent
                            model={expression}
                            isRoot={false}
                            userInputs={userInputs}
                            diagnosticHandler={diagnosticHandler}
                            isTypeDescriptor={false}
                        />
                    )
                ))
            }
        </span>
    );

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasFunctionNameSelected && statementEditorClasses.expressionElementSelected)}
                onClick={onClickOnFunctionName}
            >
                {functionName}
            </button>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openParenToken.value}
            </span>
            {expressionComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeParenToken.value}
            </span>
        </span>
    );
}
