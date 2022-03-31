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

import { RecordTypeDesc, STKindChecker } from "@wso2-enterprise/syntax-tree";

import {
    APPEND_EXCLUSIVE_RECORD_CONSTRUCTOR,
    APPEND_INCLUSIVE_RECORD_CONSTRUCTOR, INIT_EXCLUSIVE_RECORD_CONSTRUCTOR,
    INIT_INCLUSIVE_RECORD_CONSTRUCTOR
} from "../../../../constants";
import { StatementEditorContext } from "../../../../store/statement-editor-context";
import { ExpressionComponent } from "../../../Expression";
import { ExpressionArrayComponent } from "../../../ExpressionArray";
import { useStatementEditorStyles } from "../../../styles";
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

    const statementEditorClasses = useStatementEditorStyles();

    const onClickOnPlusIcon = (event: any) => {
        event.stopPropagation();
        const newExpression = STKindChecker.isOpenBracePipeToken(model.bodyStartDelimiter) ?
            (model.fields.length !== 0 ? APPEND_EXCLUSIVE_RECORD_CONSTRUCTOR : INIT_EXCLUSIVE_RECORD_CONSTRUCTOR) :
            (model.fields.length !== 0 ? APPEND_INCLUSIVE_RECORD_CONSTRUCTOR : INIT_INCLUSIVE_RECORD_CONSTRUCTOR)
        updateModel(newExpression, model.bodyEndDelimiter.position);
    };

    return (
        <>
            <TokenComponent model={model.recordKeyword} />
            <TokenComponent model={model.bodyStartDelimiter} />
            <ExpressionArrayComponent expressions={model.fields} />
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
            {model.recordRestDescriptor && <ExpressionComponent model={model.recordRestDescriptor}/>}
            <TokenComponent model={model.bodyEndDelimiter} />
        </>
    );
}
