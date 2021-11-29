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
// tslint:disable: jsx-wrap-multiline
import React, { ReactNode, useContext } from "react";

import { TypeTestExpression } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { TYPE_DESCRIPTOR } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface TypeTestExpressionProps {
    model: TypeTestExpression
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function TypeTestExpressionComponent(props: TypeTestExpressionProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const expr: ReactNode = <ExpressionComponent
        model={model.expression}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
        isTypeDescriptor={false}
    />;

    const typeDescriptor: ReactNode = <ExpressionComponent
        model={model.typeDescriptor}
        isRoot={false}
        userInputs={userInputs}
        diagnosticHandler={diagnosticHandler}
        isTypeDescriptor={true}
    />;

    const onClickOnTypeDescriptor = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.typeDescriptor, false, true,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(TYPE_DESCRIPTOR) })
    };

    return (
        <span>
            <button
                className={statementEditorClasses.expressionElement}
            >
                {expr}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                 &nbsp;{model.isKeyword.value}
            </span>
            <button
                className={statementEditorClasses.expressionElement}
                onClick={onClickOnTypeDescriptor}
            >
                {typeDescriptor}
            </button>
        </span>
    );
}
