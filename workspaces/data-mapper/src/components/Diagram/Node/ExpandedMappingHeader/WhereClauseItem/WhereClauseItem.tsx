/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { NodePosition, QueryExpression, WhereClause } from "@wso2-enterprise/syntax-tree";
import clsx from "clsx";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { ClauseAddButton } from "../ClauseAddButton";
import { ClickableExpression } from "../Common";
import { useStyles } from "../styles";

export function WhereClauseItem(props: {
    intermediateNode: WhereClause;
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

    return (
        <>
            <div className={classes.clauseItem}>
                <div className={classes.clauseKeyWrap}>{intermediateNode.whereKeyword.value}</div>

                <div className={classes.clauseWrap}>
                    <ClickableExpression
                        node={intermediateNode.expression}
                        onEditClick={() =>
                            onEditClick(
                                intermediateNode.expression?.source,
                                intermediateNode.expression?.position,
                                "Where clause"
                            )
                        }
                        index={itemIndex}
                    />
                </div>

                {isLoading ? (
                    <CircularProgress size={18} />
                ) : (
                    <DeleteOutline className={classes.deleteIcon} onClick={onDelete} data-testid={`where-clause-delete-${itemIndex}`} />
                )}
            </div>

            <ClauseAddButton context={context} queryExprNode={queryExprNode} addIndex={itemIndex} />
        </>
    );
}
