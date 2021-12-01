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
import { ElseIfStatementC } from "../ElseIfStatement";

interface IfStatementProps {
    model: IfElseStatement
    userInputs: VariableUserInputs
    diagnosticHandler: (diagnostics: string) => void
}

export function IfStatementC(props: IfStatementProps) {
    const { model, userInputs, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);

    const conditionComponent: ReactNode = (
        <ExpressionComponent
            model={model.condition}
            isRoot={false}
            userInputs={userInputs}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const elseIfComponentArray: (IfElseStatement)[] = [];

    // Since the current syntax-tree-interfaces doesnt support ElseIfStatements,
    // we will be iterating through the else-body to capture the data related to elseIf statement
    const captureElseIfStmtModel = (elseIfModel: ElseBlock) => {
        if (STKindChecker.isIfElseStatement(elseIfModel.elseBody)) {
            elseIfComponentArray.push(elseIfModel.elseBody);
            captureElseIfStmtModel(elseIfModel.elseBody.elseBody);
        }
    }

    captureElseIfStmtModel(model.elseBody);

    const onClickOnConditionExpression = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.condition, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const elseIfStatementProps = {
        elseIfComponentArray,
        userInputs,
        diagnosticHandler
    };


    return (
        <span>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.ifKeyword.value}
            </span>
             <button className={statementEditorClasses.expressionElement} onClick={onClickOnConditionExpression}>
                {conditionComponent}
            </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                &nbsp;{model.ifBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                &nbsp;{model.ifBody.closeBraceToken.value}
            </span>
            <ElseIfStatementC {...elseIfStatementProps}/>
            <button className={statementEditorClasses.addNewExpressionButton}> + </button>
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                &nbsp;{model.elseBody.elseKeyword.value}
                &nbsp;{model.ifBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                &nbsp;{model.ifBody.closeBraceToken.value}
            </span>
        </span>
    );
}
