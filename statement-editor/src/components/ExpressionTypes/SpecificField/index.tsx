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

import { DEFAULT_EXPRESSIONS } from "../../../constants";
import { SuggestionItem } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind, isPositionsEquals } from "../../../utils";
import { addStatementToTargetLine, getContextBasedCompletions } from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { InputEditor } from "../../InputEditor";
import { useStatementEditorStyles } from "../../styles";

interface SpecificFieldProps {
    model: SpecificField;
    isElseIfMember: boolean;
}

export function SpecificFieldComponent(props: SpecificFieldProps) {
    const { model, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasFieldNameSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.fieldName.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const onClickOnFieldName = (event: any) => {
        event.stopPropagation()
        expressionHandler(model.fieldName, false,
            { expressionSuggestions: [], typeSuggestions: [], variableSuggestions: [] })
    };

    const onClickOnValueExpr = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.valueExpr.position,
            false, isElseIfMember, model.valueExpr.source, getLangClient);

        expressionHandler(model.valueExpr, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    let fieldName: ReactNode;

    const valueExpression: ReactNode = (
        <ExpressionComponent
            model={model.valueExpr}
            isElseIfMember={isElseIfMember}
            onSelect={onClickOnValueExpr}
        />
    );

    if (STKindChecker.isIdentifierToken(model.fieldName)) {
        const inputEditorProps = {
            model: model.fieldName,
            expressionHandler
        };

        fieldName =  (
            <span
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasFieldNameSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnFieldName}
            >
                <InputEditor {...inputEditorProps} />
            </span>
        );
    } else {
        fieldName = (
            <ExpressionComponent
                model={model.fieldName}
                isElseIfMember={isElseIfMember}
                onSelect={onClickOnFieldName}
            />
        );
    }

    return (
        <span>
            {fieldName}
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
