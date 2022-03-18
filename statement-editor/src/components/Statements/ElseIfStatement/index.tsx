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
import React, { ReactNode } from "react";

import { ElseBlock, STKindChecker } from "@wso2-enterprise/syntax-tree"
import classNames from "classnames";

import { StatementRenderer } from "../../StatementRenderer";
import { useStatementEditorStyles } from "../../styles";

interface ElseBlockProps {
    model: ElseBlock;
}

export function ElseBlockC(props: ElseBlockProps) {
    const { model } = props;

    const statementEditorClasses = useStatementEditorStyles();

    const conditionComponent: ReactNode = (STKindChecker.isBlockStatement(model.elseBody)) ?
        (
            <span
                className={classNames(
                    statementEditorClasses.expressionBlock,
                    statementEditorClasses.expressionBlockDisabled
                )}
            >
                <span className="keyword">{model.elseKeyword.value}</span>
                &nbsp;{model.elseBody.openBraceToken.value}
                <br/>
                &nbsp;&nbsp;&nbsp;{"..."}
                <br/>
                {model.elseBody.closeBraceToken.value}
            </span>
        ) : (
            <span>
                <span
                    className={classNames(
                        statementEditorClasses.expressionBlock,
                        statementEditorClasses.expressionBlockDisabled,
                        "keyword"
                    )}
                >
                    {"else"}
                </span>
                <StatementRenderer
                    model={model?.elseBody}
                />
            </span>
        );

    return (
        conditionComponent
    );
}
