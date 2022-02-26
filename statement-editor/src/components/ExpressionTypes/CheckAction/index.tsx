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
import React, { ReactNode, useContext } from "react";

import { CheckAction } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface CheckActionProps {
    model: CheckAction
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
    isElseIfMember: boolean
}

export function CheckActionComponent(props: CheckActionProps) {
    const { model, userInputs, diagnosticHandler, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const onClickOnExpression = async (event: any) => {
        event.stopPropagation();

        expressionHandler(model.expression, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS), typeSuggestions: [], variableSuggestions: [] });
    };
    const spanClassName =  classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            );
    const expressionComponent: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
            onSelect={onClickOnExpression}
        />
    );
    return (
        <span>
            <span className={spanClassName}>
                {model.checkKeyword.value}
            </span>
            {expressionComponent}
        </span>
    );
}
