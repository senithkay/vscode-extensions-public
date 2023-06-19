/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { useState } from "react";

import { CircularProgress, MenuItem, Select } from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { CommaToken, NodePosition, OrderByClause, OrderKey, QueryExpression, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { ClauseAddButton } from "../ClauseAddButton";
import { ClickableExpression } from "../Common";
import { useStyles } from "../styles";

export function OrderByClauseItem(props: {
    intermediateNode: OrderByClause;
    onEditClick: (value: string, position: NodePosition, label: string) => void;
    onDeleteClick: () => Promise<void>;
    context: IDataMapperContext;
    queryExprNode: QueryExpression;
    itemIndex: number;
}) {
    const { onEditClick, onDeleteClick, intermediateNode, context, queryExprNode, itemIndex } =
        props;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);

    const onDelete = async () => {
        setLoading(true);
        try {
            await onDeleteClick();
        } finally {
            setLoading(false);
        }
    };

    const onOrderDirectionChange = async (value: string, currentKey: OrderKey) => {
        setLoading(true);
        try {
            await context.applyModifications([{ type: "INSERT", config: { "STATEMENT": value }, ...currentKey.orderDirection.position }]);
        } finally {
            setLoading(false);
        }
    }

    const addOrderKey = async () => {
        setLoading(true);
        try {
            const lastOrderKey = intermediateNode.orderKey[intermediateNode.orderKey.length - 1];
            await context.applyModifications([{
                type: "INSERT",
                config: { "STATEMENT": ', EXPRESSION ascending' },
                startLine: lastOrderKey.position.endLine,
                startColumn: lastOrderKey.position.endColumn,
                endLine: lastOrderKey.position.endLine,
                endColumn: lastOrderKey.position.endColumn,
            }]);
        } finally {
            setLoading(false);
        }
    }

    const onDeleteOrderKey = async (index: number) => {
        setLoading(true);
        try {
            const orderKeyPosition: NodePosition = (intermediateNode.orderKey[index] as OrderKey)?.position;
            if (index === 0) {
                const CommaTokenPosition: NodePosition = (intermediateNode.orderKey[index + 1] as CommaToken)?.position;
                await context.applyModifications([{
                    type: "DELETE",
                    startLine: orderKeyPosition.startLine,
                    startColumn: orderKeyPosition.startColumn,
                    endLine: CommaTokenPosition?.endLine || orderKeyPosition.endLine,
                    endColumn: CommaTokenPosition?.endColumn || orderKeyPosition.endColumn,
                }]);
            } else {
                const CommaTokenPosition: NodePosition = (intermediateNode.orderKey[index - 1] as CommaToken)?.position;
                await context.applyModifications([{
                    type: "DELETE",
                    startLine: CommaTokenPosition?.startLine || orderKeyPosition.startLine,
                    startColumn: CommaTokenPosition?.startColumn || orderKeyPosition.startColumn,
                    endLine: orderKeyPosition.endLine,
                    endColumn: orderKeyPosition.endColumn,
                }]);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className={classes.clauseItem}>
                <div className={classes.clauseKeyWrap}>{`${intermediateNode.orderKeyword.value} ${intermediateNode.byKeyword.value}`}</div>

                <div className={classes.clauseWrap}>
                    {intermediateNode.orderKey.map((item, index) => {
                        if (STKindChecker.isOrderKey(item)) {
                            return (
                                <span className={classes.clauseExpressionLight}>
                                    <ClickableExpression
                                        node={item.expression}
                                        onEditClick={() =>
                                            onEditClick(
                                                item.expression?.source,
                                                item.expression?.position,
                                                "Order by clause"
                                            )
                                        }
                                        index={itemIndex}
                                    />
                                    <Select
                                        value={item.orderDirection?.value}
                                        onChange={(event) => onOrderDirectionChange(event.target.value as string, item)}
                                        className={classes.orderSelect}
                                    >
                                        <MenuItem value="ascending">ascending</MenuItem>
                                        <MenuItem value="descending">descending</MenuItem>
                                    </Select>

                                    {intermediateNode.orderKey.length > 1 && (
                                        <DeleteOutline
                                            className={classes.deleteOrderKeyIcon}
                                            onClick={() => onDeleteOrderKey(index)}
                                        />
                                    )}
                                </span>
                            );
                        } else if (STKindChecker.isCommaToken(item)) {
                            return <span>{item.value}</span>;
                        }
                    })}
                    <Add className={classes.addOrderKeyIcon} onClick={addOrderKey} />
                </div>

                {isLoading ? (
                    <CircularProgress size={18} />
                ) : (
                    <DeleteOutline className={classes.deleteIcon} onClick={onDelete} data-testid={`order-clause-delete-${itemIndex}`} />
                )}
            </div>

            <ClauseAddButton context={context} queryExprNode={queryExprNode} addIndex={itemIndex} />
        </>
    );
}
