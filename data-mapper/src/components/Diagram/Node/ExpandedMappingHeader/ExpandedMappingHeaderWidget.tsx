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
import React from "react";

import { IconButton } from "@material-ui/core";
import CollapseIcon from "../../../../assets/icons/CollapseIcon";
import { ViewOption } from "../../../DataMapper/DataMapper";
import { ExpandedMappingHeaderNode } from "./ExpandedMappingHeaderNode";
import { ClauseAddButton } from "./ClauseAddButton";
import { useStyles } from "./styles";
import {
    STNode,
    STKindChecker,
    LetVarDecl,
} from "@wso2-enterprise/syntax-tree";
import { LetClauseItem } from "./LetClauseItem";
import { WhereClauseItem } from "./WhereClauseItem";
import clsx from "clsx";

export interface ExpandedMappingHeaderWidgetProps {
    node: ExpandedMappingHeaderNode;
    title: string;
}

export function ExpandedMappingHeaderWidget(
    props: ExpandedMappingHeaderWidgetProps
) {
    const { node } = props;
    const classes = useStyles();

    const onClickOnCollapse = () => {
        node.context.changeSelection(ViewOption.COLLAPSE);
    };

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
                <IconButton
                    onClick={onClickOnCollapse}
                    className={classes.iconsButton}
                >
                    <div className={classes.icon}>
                        <CollapseIcon />
                    </div>
                </IconButton>
            </div>

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
