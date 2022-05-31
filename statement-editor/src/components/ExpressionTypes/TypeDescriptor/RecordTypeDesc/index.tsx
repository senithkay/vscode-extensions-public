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

import { RecordTypeDesc } from "@wso2-enterprise/syntax-tree";

import { TYPED_BINDING_CONSTRUCTOR } from "../../../../constants";
import { StatementEditorContext } from "../../../../store/statement-editor-context";
import { ExpressionComponent } from "../../../Expression";
import { ExpressionArrayComponent } from "../../../ExpressionArray";
import { useStatementRendererStyles } from "../../../styles";
import { TokenComponent } from "../../../Token";

interface RecordTypeDescProps {
    model: RecordTypeDesc;
}

export function RecordTypeDescComponent(props: RecordTypeDescProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            updateModel,
        }
    } = stmtCtx;

    const statementRendererClasses = useStatementRendererStyles();

    const onClickOnPlusIcon = (event: any) => {
        event.stopPropagation();
        const newPosition = model.fields.length === 0 ? {
            ...model.bodyEndDelimiter.position,
            endColumn: model.bodyEndDelimiter.position.startColumn
        } : {
            startLine: model.fields[model.fields.length - 1].position.endLine,
            startColumn: model.fields[model.fields.length - 1].position.endColumn,
            endLine: model.bodyEndDelimiter.position.startLine,
            endColumn: model.bodyEndDelimiter.position.startColumn
        }
        updateModel(`${TYPED_BINDING_CONSTRUCTOR};`, newPosition);
    };

    return (
        <>
            <TokenComponent model={model.recordKeyword} />
            <TokenComponent model={model.bodyStartDelimiter} />
            <ExpressionArrayComponent expressions={model.fields} />
            <span
                className={statementRendererClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
            {model.recordRestDescriptor && <ExpressionComponent model={model.recordRestDescriptor}/>}
            <TokenComponent model={model.bodyEndDelimiter} />
        </>
    );
}
