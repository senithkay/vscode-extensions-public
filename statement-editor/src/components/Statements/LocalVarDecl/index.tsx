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

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { isPositionsEquals } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { InputEditor } from "../../InputEditor";
import { useStatementEditorStyles } from "../../styles";

interface LocalVarDeclProps {
    model: LocalVarDecl;
}

export function LocalVarDeclC(props: LocalVarDeclProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel
        }
    } = stmtCtx;
    const hasTypedBindingPatternSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.typedBindingPattern.position);

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnBindingPattern = (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.typedBindingPattern);
    };

    const onClickOnInitializer = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.initializer);
    };

    if (!currentModel.model && model.initializer) {
        changeCurrentModel(model.initializer);
    }

    let typedBindingComponent: ReactNode;
    if (model.typedBindingPattern.bindingPattern.source) {
        typedBindingComponent = (
            <ExpressionComponent
                model={model.typedBindingPattern}
                onSelect={onClickOnBindingPattern}
            />
        )
    } else {
        const inputEditorProps = {
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

