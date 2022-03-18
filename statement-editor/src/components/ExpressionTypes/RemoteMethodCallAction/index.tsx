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

import { RemoteMethodCallAction, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface RemoteMethodCallActionProps {
    model: RemoteMethodCallAction;
}

export function RemoteMethodCallActionComponent(props: RemoteMethodCallActionProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const expressionArgComponent = (
        <span>
            { model.arguments.length > 0 &&
                (model.arguments.map((argument: STNode, index: number) => (
                    (STKindChecker.isCommaToken(argument)) ? (
                        <span
                            key={index}
                            className={classNames(
                                statementEditorClasses.expressionBlock,
                                statementEditorClasses.expressionBlockDisabled
                            )}
                        >
                            {argument.value}
                        </span>
                    ) : (
                        <ExpressionComponent
                            model={argument}
                        />
                    )
                ))
                )
            }
        </span>
    );

    const onClickOnExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.expression);
    };

    const onClickOnMethodName = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.methodName);
    };

    const methodName: ReactNode = (
        <ExpressionComponent
            model={model.methodName}
            onSelect={onClickOnMethodName}
        >
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.openParenToken.value}
            </span>
            {expressionArgComponent}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                {model.closeParenToken.value}
            </span>
        </ExpressionComponent>
    );

    const expression: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            onSelect={onClickOnExpression}
        />
    );

    return (
        <span>
            {expression}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled,
                    "operator"
                )}
            >
                {model.rightArrowToken.value}
            </span>
            {methodName}
        </span>
    );
}
