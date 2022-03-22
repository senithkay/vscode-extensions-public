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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";

import { FromClause } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface FromClauseProps {
    model: FromClause;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function FromClauseComponent(props: FromClauseProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);

    const typedBindinfPatternComponent = (
        <ExpressionComponent
            model={model.typedBindingPattern}
        />
    );

    const expressionName: ReactNode = (
        <ExpressionComponent
            model={model.expression}
        />
    );

    return (
        <span>
            <TokenComponent model={model.fromKeyword} className={"keyword"} />
            {typedBindinfPatternComponent}
            <TokenComponent model={model.inKeyword} className={"keyword"} />
            {expressionName}
        </span>
    );
}
