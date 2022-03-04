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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext } from "react";

import { MappingConstructor, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { DEFAULT_EXPRESSIONS, MAPPING_CONSTRUCTOR } from "../../../constants";
import { VariableUserInputs } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { SuggestionsContext } from "../../../store/suggestions-context";
import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
import { generateExpressionTemplate } from "../../../utils/utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface MappingConstructorProps {
    model: MappingConstructor;
    userInputs: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
}

export function MappingConstructorComponent(props: MappingConstructorProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);
    const { expressionHandler } = useContext(SuggestionsContext);

    const onClickOnPlusIcon = () => {
        const expressionTemplate = generateExpressionTemplate(MAPPING_CONSTRUCTOR);
        const newField = model.fields.length !== 0 ? `, ${expressionTemplate} }` : `${expressionTemplate} }`;
        updateModel(newField, model.closeBrace.position);
    };

    const onClickOnExpression = (clickedExpression: STNode, event: any) => {
        event.stopPropagation();
        expressionHandler(clickedExpression, false, false,
            { expressionSuggestions: getSuggestionsBasedOnExpressionKind(DEFAULT_EXPRESSIONS) })
    };

    const fieldsComponent = (
        <span>
            {
                model.fields.map((expression: STNode, index: number) => (
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
                            key={index}
                            model={expression}
                            userInputs={userInputs}
                            isElseIfMember={isElseIfMember}
                            diagnosticHandler={diagnosticHandler}
                            isTypeDescriptor={false}
                            onSelect={(event) => onClickOnExpression(expression, event)}
                            deleteConfig={{defaultExprDeletable: true}}
                        />
                    )
                ))
            }
        </span>
    );

    return (
        <span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openBrace.value}
            </span>
            {fieldsComponent}
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeBrace.value}
            </span>
        </span>
    );
}
