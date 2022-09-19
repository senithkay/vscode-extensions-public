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

export function WhereClauseItem(props: {
    intermediateNode: WhereClause;
    onEditClick: () => void;
    onDeleteClick: () => void;
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
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={clsx(classes.element, classes.clauseWrap)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <ClauseAddButton
                    context={context}
                    queryExprNode={queryExprNode}
                    addIndex={itemIndex - 1}
                    iconClass={classes.topIcon}
                />
            )}
            {isHovered && (
                <ClauseAddButton
                    context={context}
                    queryExprNode={queryExprNode}
                    addIndex={itemIndex}
                    iconClass={classes.bottomIcon}
                />
            )}
            <div className={clsx(classes.clause)}>
                <span>{`${intermediateNode.whereKeyword.value} `}</span>
                <span
                    className={classes.clauseExpression}
                    onClick={onEditClick}
                >
                    {intermediateNode.expression.source}
                </span>
            </div>
            <DeleteOutline
                className={clsx(
                    classes.deleteIcon,
                    isHovered && classes.deleteIconHovered
                )}
                onClick={onDeleteClick}
            />
        </div>
    );
}
