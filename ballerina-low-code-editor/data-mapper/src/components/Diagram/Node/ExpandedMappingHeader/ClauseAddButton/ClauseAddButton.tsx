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
import React, { useState } from "react";

import { CircularProgress } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AddCircleOutline from "@material-ui/icons/AddCircleOutline";
import { NodePosition, QueryExpression, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { genLetClauseVariableName } from "../../../../../utils/st-utils";
import { useStyles } from "../styles";

export interface ExpandedMappingHeaderWidgetProps {
    queryExprNode: QueryExpression;
    context: IDataMapperContext;
    addIndex: number;
}

export function ClauseAddButton(props: ExpandedMappingHeaderWidgetProps) {
    const { context, queryExprNode, addIndex } = props;
    const classes = useStyles();
    const [isLoading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const getAddFieldPosition = (): NodePosition => {
        let addPosition: NodePosition;
        const intermediateClauses: STNode[] = queryExprNode.queryPipeline.intermediateClauses;
        const insertAfterNode = intermediateClauses[addIndex];

        if (addIndex >= 0 && insertAfterNode) {
            addPosition = {
                ...insertAfterNode.position as NodePosition,
                startColumn: (insertAfterNode.position as NodePosition).endColumn
            };
        } else {
            addPosition = {
                ...queryExprNode.queryPipeline.fromClause.position as NodePosition,
                startColumn: (queryExprNode.queryPipeline.fromClause.position as NodePosition).endColumn
            }
        }

        return addPosition;
    };

    const onClickAddLetClause = async () => {
        handleClose();
        setLoading(true);
        try {
            const addPosition = getAddFieldPosition();
            const variableName = genLetClauseVariableName(queryExprNode.queryPipeline.intermediateClauses);
            await context.applyModifications([
                {
                    type: "INSERT",
                    config: { STATEMENT: ` let var ${variableName} = EXPRESSION` },
                    ...addPosition,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onClickAddWhereClause = async () => {
        handleClose();
        setLoading(true);
        try {
            const addPosition = getAddFieldPosition();
            await context.applyModifications([
                {
                    type: "INSERT",
                    config: { STATEMENT: ` where EXPRESSION` },
                    ...addPosition,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onClickAddLimitClause = async () => {
        handleClose();
        setLoading(true);
        try {
            const addPosition = getAddFieldPosition();
            await context.applyModifications([
                {
                    type: "INSERT",
                    config: { STATEMENT: ` limit EXPRESSION` },
                    ...addPosition,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onClickAddOrderByClause = async () => {
        handleClose();
        setLoading(true);
        try {
            const addPosition = getAddFieldPosition();
            await context.applyModifications([
                {
                    type: "INSERT",
                    config: { STATEMENT: ` order by EXPRESSION ascending` },
                    ...addPosition,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={classes.lineWrap}>
                <div className={classes.line} />
                <div className={classes.addButtonWrap} data-testid={`intermediary-add-btn-${addIndex}`}>
                    {isLoading ? (
                        <CircularProgress size={13} />
                    ) : (
                        <AddCircleOutline onClick={handleClick} className={classes.addIcon}/>
                    )}
                </div>
                <div className={classes.line} />
            </div>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                className={classes.addMenu}
            >
                <MenuItem onClick={onClickAddWhereClause}>Add Where Clause</MenuItem>
                <MenuItem onClick={onClickAddLetClause}>Add Let Clause</MenuItem>
                <MenuItem onClick={onClickAddLimitClause}>Add Limit Clause</MenuItem>
                <MenuItem onClick={onClickAddOrderByClause}>Add Order by Clause</MenuItem>
            </Menu>
        </>
    );
}
