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

import { ElseBlock, IfElseStatement, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree"
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface ElseIfStatementProps {
    elseIfComponentArray: (ElseBlock | IfElseStatement)[]
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function ElseIfStatementC(props: ElseIfStatementProps) {
    const { elseIfComponentArray, userInputs, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const onClickOnElseIfConditionExpression = (elseIfModel: IfElseStatement) => (event: any) => {
        event.stopPropagation()
        expressionHandler(elseIfModel.condition, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const elseIfComponent = (
        <span>
            {elseIfComponentArray.map((elseIfModel: STNode, index: number) => {
                if (STKindChecker.isIfElseStatement(elseIfModel)) {
                    const elseIfCondition: ReactNode = (
                        <ExpressionComponent
                            model={elseIfModel.condition}
                            isRoot={false}
                            userInputs={userInputs}
                            diagnosticHandler={diagnosticHandler}
                            isTypeDescriptor={false}
                        />
                    );
                    return (
                        <span>
                                <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                                    {"else"}&nbsp;{elseIfModel.ifKeyword.value}
                                </span>
                                <button key={index} className={statementEditorClasses.expressionElement} onClick={onClickOnElseIfConditionExpression(elseIfModel)}>
                                    {elseIfCondition}
                                </button>
                                <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                                    &nbsp;{elseIfModel.ifBody.openBraceToken.value}
                                    <br/>
                                    &nbsp;&nbsp;&nbsp;{"..."}
                                    <br/>
                                    &nbsp;{elseIfModel.ifBody.closeBraceToken.value}
                                </span>
                            </span>
                    )
                }
            })
            }
        </span>
    );

    return(
        <span>
            {elseIfComponent}
        </span>
    );
}
