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

import { KeySpecifier } from "@wso2-enterprise/syntax-tree";

import {
    APPEND_EXPR_CONSTRUCTOR,
    INIT_EXPR_CONSTRUCTOR,
} from "../../../../constants";
import { StatementEditorContext } from "../../../../store/statement-editor-context";
import { ExpressionArrayComponent } from "../../../ExpressionArray";
import { useStatementEditorStyles } from "../../../styles";
import { TokenComponent } from "../../../Token";

interface KeySpecifierProps {
    model: KeySpecifier;
}

export function KeySpecifierComponent(props: KeySpecifierProps) {
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
        model.fieldNames.length !== 0 ? updateModel(APPEND_EXPR_CONSTRUCTOR, {
            ...model.closeParenToken.position,
            endColumn: model.closeParenToken.position.endColumn - 1
        }) :
        updateModel(INIT_EXPR_CONSTRUCTOR, {
            ...model.closeParenToken.position,
            endColumn: model.closeParenToken.position.endColumn - 1
        })
    };

    return (
        <>
            <TokenComponent model={model.keyKeyword} />
            <TokenComponent model={model.openParenToken} />
            <ExpressionArrayComponent expressions={model.fieldNames} />
            <span
                className={statementEditorClasses.plusIcon}
                onClick={onClickOnPlusIcon}
            >
                +
            </span>
            <TokenComponent model={model.closeParenToken} />
        </>
    );
}
