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

import { SpecificField, STKindChecker } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { isPositionsEquals } from "../../../utils";
import { ExpressionComponent } from "../../Expression";
import { InputEditor } from "../../InputEditor";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface SpecificFieldProps {
    model: SpecificField;
}

export function SpecificFieldComponent(props: SpecificFieldProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel
        }
    } = stmtCtx;

    const hasFieldNameSelected = currentModel.model &&
        isPositionsEquals(currentModel.model.position, model.fieldName.position);

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnFieldName = (event: any) => {
        event.stopPropagation();
        changeCurrentModel(model.fieldName);
    };


    let fieldName: ReactNode;

    const valueExpression: ReactNode = (
        <ExpressionComponent
            model={model.valueExpr}
        />
    );

    const styleClassName = classNames(
        statementEditorClasses.expressionElement,
        hasFieldNameSelected && statementEditorClasses.expressionElementSelected
    );

    if (STKindChecker.isIdentifierToken(model.fieldName)) {
        const inputEditorProps = {
            model: model.fieldName
        };

        fieldName =  (
            <span className={styleClassName}  onClick={onClickOnFieldName} >
                <InputEditor {...inputEditorProps} />
            </span>
        );
    } else {
        fieldName = (
            <ExpressionComponent
                model={model.fieldName}
            />
        );
    }

    return (
        <span>
            {fieldName}
            <TokenComponent model={model.colon} />
            {valueExpression}
        </span>
    );
}
