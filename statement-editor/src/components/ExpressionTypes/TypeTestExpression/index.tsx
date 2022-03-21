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

import { TypeTestExpression } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { ModelKind } from "../../../models/definitions";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";

interface TypeTestExpressionProps {
    model: TypeTestExpression;
}

export function TypeTestExpressionComponent(props: TypeTestExpressionProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            changeCurrentModel
        }
    } = stmtCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnExpression = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.expression);
    };

    const onClickOnTypeDescriptor = async (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.typeDescriptor, ModelKind.TypeDesc);
    };


    const expr: ReactNode = (
        <ExpressionComponent
            model={model.expression}
            onSelect={onClickOnExpression}
        />
    );

    const typeDescriptor: ReactNode = (
        <ExpressionComponent
            model={model.typeDescriptor}
            onSelect={onClickOnTypeDescriptor}
            isTypeDesc={true}
        />
    );

    return (
        <span>
            {expr}
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                 &nbsp;{model.isKeyword.value}
            </span>
            {typeDescriptor}
        </span>
    );
}
