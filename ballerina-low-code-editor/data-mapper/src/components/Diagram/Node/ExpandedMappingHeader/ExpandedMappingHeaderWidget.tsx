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
// tslint:disable: jsx-no-lambda  jsx-no-multiline-js
import React from "react";

import { PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import {
    LetVarDecl,
    NodePosition,
    STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { ClauseAddButton } from "./ClauseAddButton";
import { ExpandedMappingHeaderNode } from "./ExpandedMappingHeaderNode";
import { LetClauseItem } from "./LetClauseItem";
import { LimitClauseItem } from "./LimitClauseItem";
import { OrderByClauseItem } from "./OrderClauseItem";
import { useStyles } from "./styles";
import { WhereClauseItem } from "./WhereClauseItem";

export interface ExpandedMappingHeaderWidgetProps {
    node: ExpandedMappingHeaderNode;
    title: string;

    engine: DiagramEngine;
    port: PortModel<PortModelGenerics>;
}

export function ExpandedMappingHeaderWidget(props: ExpandedMappingHeaderWidgetProps) {
    const { node, engine, port } = props;
    const classes = useStyles();

    const onClickEdit = (editNode: STNode) => {
        if (STKindChecker.isWhereClause(editNode)) {
            node.context.enableStatementEditor({
                value: editNode.expression?.source,
                valuePosition: editNode.expression?.position as NodePosition,
                label: "Where clause",
            });
        } else if (STKindChecker.isLetClause(editNode) && editNode.letVarDeclarations[0]) {
            node.context.enableStatementEditor({
                value: (editNode.letVarDeclarations[0] as LetVarDecl)?.expression?.source,
                valuePosition: (editNode.letVarDeclarations[0] as LetVarDecl)?.expression?.position as NodePosition,
                label: "Let clause",
            });
        } else if (STKindChecker.isLimitClause(editNode)) {
            node.context.enableStatementEditor({
                value: editNode.expression?.source,
                valuePosition: editNode.expression?.position as NodePosition,
                label: "Limit clause",
            });
        } else if (STKindChecker.isFromClause(editNode)) {
            node.context.enableStatementEditor({
                value: editNode.expression.source,
                valuePosition: editNode.expression.position as NodePosition,
                label: "From clause",
            });
        } else if (STKindChecker.isOrderKey(editNode)) {
            node.context.enableStatementEditor({
                value: editNode.expression.source,
                valuePosition: editNode.expression.position,
                label: "Order by clause key",
            });
        }
    };

    const deleteClause = async (clauseItem: STNode) => {
        await node.context.applyModifications([{ type: "DELETE", ...clauseItem.position }]);
    };

    const fromClause = props.node.queryExpr.queryPipeline.fromClause;
    const intermediateClauses = props.node.queryExpr.queryPipeline.intermediateClauses;

    return (
        <>
            <div>
                <div className={classes.clauseItem}>
                    <div className={classes.clauseKeyWrap}>{fromClause.fromKeyword.value}</div>
                    <div className={classes.clauseWrap}>
                        <span
                            className={classes.clauseItemKey}
                        >
                            {` ${fromClause.typedBindingPattern.source} ${fromClause.inKeyword.value}`}
                        </span>
                        <span
                            className={classes.clauseExpression}
                            onClick={() => onClickEdit(fromClause)}
                        >
                            {fromClause.expression.source}
                        </span>
                    </div>
                </div>

                <ClauseAddButton
                    context={node.context}
                    queryExprNode={node.queryExpr}
                    addIndex={-1}
                />

                {intermediateClauses.length > 0 &&
                    intermediateClauses?.map((clauseItem, index) => {
                        const itemProps = {
                            key: index,
                            onEditClick: (editNode?: STNode) => onClickEdit(editNode || clauseItem),
                            onDeleteClick: () => deleteClause(clauseItem),
                            context: node.context,
                            queryExprNode: node.queryExpr,
                            itemIndex: index,
                        };
                        if (STKindChecker.isWhereClause(clauseItem)) {
                            return <WhereClauseItem {...itemProps} intermediateNode={clauseItem} />;
                        } else if (STKindChecker.isLetClause(clauseItem)) {
                            return <LetClauseItem {...itemProps} intermediateNode={clauseItem} />;
                        } else if (STKindChecker.isLimitClause(clauseItem)) {
                            return <LimitClauseItem {...itemProps} intermediateNode={clauseItem} />;
                        } else if (STKindChecker.isOrderByClause(clauseItem)) {
                            return <OrderByClauseItem {...itemProps} intermediateNode={clauseItem} />;
                        }
                    })}

                <div className={classes.queryInputInputPortWrap}>
                    <PortWidget port={port} engine={engine} />
                </div>
            </div>
        </>
    );
}
