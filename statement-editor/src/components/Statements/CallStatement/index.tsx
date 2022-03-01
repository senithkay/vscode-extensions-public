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
import React, { ReactNode, useContext } from "react";

import { CallStatement } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { VariableUserInputs } from "../../../models/definitions";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface CallStatementProps {
    model: CallStatement;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function CallStatementC(props: CallStatementProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const expressionComponent: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    return (
        <span>
            {expressionComponent}
            <span className={classNames(statementEditorClasses.expressionBlock, statementEditorClasses.expressionBlockDisabled)}>
                {model.semicolonToken.value}
            </span>
        </span>
    );
}
