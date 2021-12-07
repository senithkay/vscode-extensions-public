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

import { TypedBindingPattern } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { SuggestionItem, VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { isPositionsEquals } from "../../../utils";
import {
    addStatementToTargetLine,
    getContextBasedCompletions
} from "../../../utils/ls-utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface TypedBindingPatternProps {
    model: TypedBindingPattern;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function TypedBindingPatternComponent(props: TypedBindingPatternProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasTypeDescSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.typeDescriptor.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const typeDescriptorComponent: ReactNode = (
        <ExpressionComponent
            model={model.typeDescriptor}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={true}
        />
    );
    const bindingPatternComponent: ReactNode = (
        <ExpressionComponent
            model={model.bindingPattern}
            userInputs={userInputs}
            isElseIfMember={isElseIfMember}
            diagnosticHandler={diagnosticHandler}
            isTypeDescriptor={false}
        />
    );

    const onClickOnType = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(
            fileURI, content, targetPosition, model.typeDescriptor.position,
            true, isElseIfMember, model.typeDescriptor.source, getLangClient);

        expressionHandler(model.typeDescriptor, false, true, {
            expressionSuggestions: [],
            typeSuggestions: completions,
            variableSuggestions: []
        });
    };

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasTypeDescSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnType}
            >
                {typeDescriptorComponent}
            </button>
            {bindingPatternComponent}
        </span>
    );
}
