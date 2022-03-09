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

import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";
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

interface LocalVarDeclProps {
    model: LocalVarDecl;
    isElseIfMember: boolean;
}

export function LocalVarDeclC(props: LocalVarDeclProps) {
    const { model, isElseIfMember } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx } = stmtCtx;
    const { currentModel } = modelCtx;
    const hasTypedBindingPatternSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.typedBindingPattern.position);

    const statementEditorClasses = useStatementEditorStyles();
    const { expressionHandler } = useContext(SuggestionsContext);
    const { currentFile, getLangClient } = stmtCtx;
    const targetPosition = stmtCtx.formCtx.formModelPosition;
    const fileURI = `expr://${currentFile.path}`;

    const onClickOnBindingPattern = (event: any) => {
        event.stopPropagation();
        expressionHandler(model.typedBindingPattern, false, false,
            {expressionSuggestions: [], typeSuggestions: [], variableSuggestions: []});
    };

    const onClickOnInitializer = async (event: any) => {
        event.stopPropagation();

        const content: string = await addStatementToTargetLine(
            currentFile.content, targetPosition, stmtCtx.modelCtx.statementModel.source, getLangClient);

        const completions: SuggestionItem[] = await getContextBasedCompletions(fileURI, content, targetPosition,
            model.initializer.position, false, isElseIfMember, model.initializer.source, getLangClient);

        expressionHandler(model.initializer, false, false, {
            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
            typeSuggestions: [],
            variableSuggestions: completions
        });
    };

    if (!currentModel.model && model.initializer) {
        addStatementToTargetLine(currentFile.content, targetPosition,
            stmtCtx.modelCtx.statementModel.source, getLangClient).then((content: string) => {
                getContextBasedCompletions(fileURI, content, targetPosition, model.initializer.position, false,
                    isElseIfMember, model.initializer.source, getLangClient, currentFile.content).then((completions) => {
                        expressionHandler(model.initializer, false, false, {
                            expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS),
                            typeSuggestions: [],
                            variableSuggestions: completions
                        });
                    });
            });
    }

    let typedBindingComponent: ReactNode;
    if (model.typedBindingPattern.bindingPattern.source) {
        typedBindingComponent = (
            <ExpressionComponent
                model={model.typedBindingPattern}
                isElseIfMember={isElseIfMember}
                onSelect={onClickOnBindingPattern}
            />
        )
    } else {
        const inputEditorProps = {
            statementType: model?.kind,
            model
        };

        typedBindingComponent = (
            <span
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasTypedBindingPatternSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnBindingPattern}
            >
                <InputEditor {...inputEditorProps} />
            </span>
        )
    }

    const expressionComponent: ReactNode = (
        <ExpressionComponent
            model={model.initializer}
            isElseIfMember={isElseIfMember}
            onSelect={onClickOnInitializer}
        />
    );

    return (
        <span>
            {typedBindingComponent}
            {
                model.equalsToken && (
                    <>
                        <span
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled,
                                "operator"
                            )}
                        >
                            &nbsp;{model.equalsToken.value}
                        </span>
                        {expressionComponent}
                    </>
                )
            }

            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
            {/* TODO: use model.semicolonToken.isMissing when the ST interface is supporting */}
                {model.semicolonToken.position.startColumn !== model.semicolonToken.position.endColumn &&
                    model.semicolonToken.value}
            </span>
        </span>
    );
}

