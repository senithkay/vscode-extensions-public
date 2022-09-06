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

import { RecordFieldWithDefaultValue } from "@wso2-enterprise/syntax-tree";

import { FIELD_DESCRIPTOR } from "../../../../constants";
import { StatementEditorContext } from "../../../../store/statement-editor-context";
import { ExpressionComponent } from "../../../Expression";
import { TokenComponent } from "../../../Token";

interface RecordFieldWithDefaultValueProps {
    model: RecordFieldWithDefaultValue;
    isHovered?: boolean;
}

export function RecordFieldWithDefaultValueComponent(props: RecordFieldWithDefaultValueProps) {
    const { model, isHovered } = props;

    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            updateModel,
        }
    } = stmtCtx;

    const onClickOnPlusIcon = (event: any) => {
        event.stopPropagation();
        const newPosition = {
            startLine: model.position.endLine,
            startColumn: model.position.endColumn,
            endLine: model.position.endLine,
            endColumn: model.position.endColumn
        }
        updateModel(`${FIELD_DESCRIPTOR};`, newPosition);
    };

    return (
        <>
            <ExpressionComponent model={model.typeName} />
            <ExpressionComponent model={model.fieldName} />
            <TokenComponent model={model.equalsToken} />
            <ExpressionComponent model={model.expression} />
            <TokenComponent model={model.semicolonToken} isHovered={isHovered} onPlusClick={onClickOnPlusIcon} />
        </>
    );
}
