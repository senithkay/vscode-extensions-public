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

import { ElseBlock, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree"
import classNames from "classnames";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExprDeleteButton } from "../../Button/ExprDeleteButton";
import { StatementRenderer } from "../../StatementRenderer";
import { useStatementRendererStyles } from "../../styles";
import { TokenComponent } from "../../Token";

interface ElseBlockProps {
    model: ElseBlock;
}

export function ElseBlockC(props: ElseBlockProps) {
    const { model } = props;
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            updateModel
        }
    } = stmtCtx;

    const statementRendererClasses = useStatementRendererStyles();

    const deleteIfStatement = (ifBodyModel: STNode) => {
        const newPosition: NodePosition = {
            ...ifBodyModel.position,
            startColumn: 0,
            endColumn: 0
        }
        updateModel(``, newPosition);
    };

    const conditionComponent: ReactNode = (STKindChecker.isBlockStatement(model.elseBody)) ?
        (
            <>
                <TokenComponent model={model.elseKeyword} className="keyword" />
                <TokenComponent model={model.elseBody.openBraceToken} />
                &nbsp;&nbsp;&nbsp;{"..."}
                <TokenComponent model={model.elseBody.closeBraceToken} />
                &nbsp;
                <ExprDeleteButton model={model.elseBody} onClick={deleteIfStatement} />;
            </>
        ) : (
            <span>
                <span
                    className={classNames(
                        statementRendererClasses.expressionBlock,
                        statementRendererClasses.expressionBlockDisabled,
                        "keyword"
                    )}
                >
                    <ExprDeleteButton
                        model={model.elseBody.ifBody}
                        onClick={deleteIfStatement}
                    />&nbsp;
                    {"else"}&nbsp;
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
