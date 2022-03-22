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
import React, { useContext } from "react";

import { TableConstructor } from "@wso2-enterprise/syntax-tree";

import { TABLE_CONSTRUCTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../../utils/utils";
import { ExpressionArrayComponent } from "../../ExpressionArray";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface TableConstructorProps {
    model: TableConstructor;
}

export function TableConstructorComponent(props: TableConstructorProps) {
    const { model } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickOnPlusIcon = () => {
        const expressionTemplate = generateExpressionTemplate(TABLE_CONSTRUCTOR);
        const newField = model.rows.length !== 0 ? `, ${expressionTemplate} ]` : `${expressionTemplate} ]`;
        updateModel(newField, model.closeBracket.position);
    };

    const rowsComponent = (
        <ExpressionArrayComponent
            expressions={model.rows}
        />
    );

    return (
        <span>
            <TokenComponent model={model.tableKeyword} className={"keyword"} />
            <TokenComponent model={model.openBracket} />
            {rowsComponent}
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
            <TokenComponent model={model.closeBracket} />
        </span>
    );
}
