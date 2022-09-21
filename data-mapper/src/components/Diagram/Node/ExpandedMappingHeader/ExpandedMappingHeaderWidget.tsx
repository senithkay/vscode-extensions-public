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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import {
    LetVarDecl,
    STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";
import clsx from "clsx";

import { ClauseAddButton } from "./ClauseAddButton";
import { ExpandedMappingHeaderNode } from "./ExpandedMappingHeaderNode";
import { LetClauseItem } from "./LetClauseItem";
import { useStyles } from "./styles";
import { WhereClauseItem } from "./WhereClauseItem";

export interface ExpandedMappingHeaderWidgetProps {
    node: ExpandedMappingHeaderNode;
    title: string;
}

export function ExpandedMappingHeaderWidget(
    props: ExpandedMappingHeaderWidgetProps
) {
    const { node } = props;
    const classes = useStyles();

    const onClickEdit = (editNode: STNode) => {
        if (STKindChecker.isWhereClause(editNode)) {
            node.context.enableStatementEditor({
                value: editNode.expression?.source,
                valuePosition: editNode.expression?.position,
                label: "Where clause",
            });
        } else if (
            STKindChecker.isLetClause(editNode) &&
            editNode.letVarDeclarations[0]
        ) {
            node.context.enableStatementEditor({
                value: (editNode.letVarDeclarations[0] as LetVarDecl)
                    ?.expression?.source,
                valuePosition: (editNode.letVarDeclarations[0] as LetVarDecl)
                    ?.expression?.position,
                label: "Let clause",
            });
        } else if (STKindChecker.isFromClause(editNode)) {
            node.context.enableStatementEditor({
                value: editNode.expression.source,
                valuePosition: editNode.expression.position,
                label: "From clause",
            });
        }
    };

    const deleteWhereClause = (clauseItem: STNode) => {
        node.context.applyModifications([
            {
                type: "DELETE",
                ...clauseItem.position,
            },
        ]);
    };

    const fromClause = props.node.queryExpr.queryPipeline.fromClause;
    const intermediateClauses =
        props.node.queryExpr.queryPipeline.intermediateClauses;

    return (
        <div className={classes.root}>
            <div className={classes.element}>
                <div className={classes.clause}>
                    {`${fromClause.fromKeyword.value} ${fromClause.typedBindingPattern.source} ${fromClause.inKeyword.value} `}
                    <span
                        className={classes.clauseExpression}
                        onClick={() => onClickEdit(fromClause)}
                    >
                        {fromClause.expression.source}
                    </span>
                </div>
            </div>
            {intermediateClauses.length > 0 && (
                <div className={classes.addIconWrap}>
                    <ClauseAddButton
                        context={node.context}
                        queryExprNode={node.queryExpr}
                        addIndex={-1}
                    />
                </div>
            )}
            {intermediateClauses.length > 0 ? (
                intermediateClauses?.map((clauseItem, index) => {
                    const itemProps = {
                        key: index,
                        onEditClick: () => onClickEdit(clauseItem),
                        onDeleteClick: () => deleteWhereClause(clauseItem),
                        context: node.context,
                        queryExprNode: node.queryExpr,
                        itemIndex: index,
                    };
                    if (STKindChecker.isWhereClause(clauseItem)) {
                        return (
                            <WhereClauseItem
                                {...itemProps}
                                intermediateNode={clauseItem}
                            />
                        );
                    } else if (STKindChecker.isLetClause(clauseItem)) {
                        return (
                            <LetClauseItem
                                {...itemProps}
                                intermediateNode={clauseItem}
                            />
                        );
                    }
                })
            ) : (
                <div className={clsx(classes.element, classes.empty)}>
                    <div className={classes.title}>Add Clause</div>
                    <ClauseAddButton
                        context={node.context}
                        queryExprNode={node.queryExpr}
                        addIndex={-1}
                    />
                </div>
            )}
        </div>
    );
}
