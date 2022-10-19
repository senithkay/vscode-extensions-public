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
import React, { useState } from "react";

import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { QueryExpression, WhereClause } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { useStyles } from "../styles";
import { ClauseAddButton } from "../ClauseAddButton";
import clsx from "clsx";
import { CircularProgress } from "@material-ui/core";

export function WhereClauseItem(props: {
    intermediateNode: WhereClause;
    onEditClick: () => void;
    onDeleteClick: () => Promise<void>;
    context: IDataMapperContext;
    queryExprNode: QueryExpression;
    itemIndex: number;
}) {
    const {
        onEditClick,
        onDeleteClick,
        intermediateNode,
        context,
        queryExprNode,
        itemIndex,
    } = props;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);

    const onDelete = async () => {
        setLoading(true);
        try {
            await onDeleteClick();
        } finally {
            setLoading(false);
        }
    }

    const onEdit = async () => {
        context.handleFieldToBeEdited(`${itemIndex}`);
        onEditClick();
    }

    return (
        <>
            <div className={clsx(classes.element, classes.clauseWrap)}>
                <div className={classes.clause}>
                    <span className={classes.clauseBold}>{`${intermediateNode.whereKeyword.value} `}</span>
                    <span
                        className={classes.clauseExpression}
                        onClick={onEdit}
                    >
                        {intermediateNode.expression.source}
                    </span>
                </div>
                {isLoading || context.fieldToBeEdited === `${itemIndex}` ? (
                    <CircularProgress size={18} />
                ) : (
                    <DeleteOutline
                        className={clsx(classes.deleteIcon)}
                        onClick={onDelete}
                    />
                )}
            </div>
            <ClauseAddButton
                context={context}
                queryExprNode={queryExprNode}
                addIndex={itemIndex}
                visibleOnlyOnHover
            />
        </>
    );
}
