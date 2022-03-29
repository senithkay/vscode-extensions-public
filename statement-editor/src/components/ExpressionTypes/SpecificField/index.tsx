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
import React, { useContext } from "react";

import { SpecificField } from "@wso2-enterprise/syntax-tree";

import { MAPPING_CONSTRUCTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { generateExpressionTemplate } from "../../../utils/utils";
import { ExpressionComponent } from "../../Expression";
import { useStatementEditorStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface SpecificFieldProps {
    model: SpecificField;
}

export function SpecificFieldComponent(props: SpecificFieldProps) {
    const { model } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const {
        modelCtx: {
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const onClickOnPlusIcon = () => {
        const newField = `,\n${generateExpressionTemplate(MAPPING_CONSTRUCTOR)}`;
        updateModel(newField, {
            ...model.valueExpr.position,
            startColumn: model.valueExpr.position.endColumn
        });
    };

    return (
        <>
            <ExpressionComponent model={model.fieldName} />
            <TokenComponent model={model.colon} />
            <ExpressionComponent model={model.valueExpr} />
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
        </>
    );
}
