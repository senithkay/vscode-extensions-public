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
import React, {useContext} from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { VariableUserInputs } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { getExpressionTypeComponent, isPositionsEquals } from "../../utils";
import { useStatementEditorStyles } from "../styles";

export interface ExpressionComponentProps {
    model: STNode;
    userInputs?: VariableUserInputs;
    isElseIfMember: boolean;
    diagnosticHandler: (diagnostics: string) => void;
    isTypeDescriptor: boolean;
    onClickOnExpr?: (event: any) => void;
}

export function ExpressionComponent(props: ExpressionComponentProps) {
    const { model, userInputs, isElseIfMember, diagnosticHandler, isTypeDescriptor, onClickOnExpr } = props;

    const statementEditorClasses = useStatementEditorStyles();
    const stmtCtx = useContext(StatementEditorContext);
    const { modelCtx: {
        currentModel,
        updateModel
    } } = stmtCtx;

    const hasExpressionSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.position);

    const component = getExpressionTypeComponent(model, userInputs, isElseIfMember, diagnosticHandler, isTypeDescriptor);

    const onClickOnClose = (event: any) => {
        event.stopPropagation();
        updateModel('', model.position);
    }

    return (
        <span>
            <button
                className={classNames(
                    statementEditorClasses.expressionElement,
                    hasExpressionSelected && statementEditorClasses.expressionElementSelected
                )}
                onClick={onClickOnExpr}
            >
                {component}
                <button
                    className="expressionElementCloseButton"
                    onClick={onClickOnClose}
                >
                    x
                </button>
            </button>
        </span>
    );
}
