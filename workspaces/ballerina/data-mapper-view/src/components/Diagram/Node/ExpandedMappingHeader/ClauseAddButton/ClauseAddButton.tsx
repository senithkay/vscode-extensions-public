/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { applyModifications } from "../../../utils/ls-utils";

export interface ExpandedMappingHeaderWidgetProps {
    queryExprNode: QueryExpression;
    context: IDataMapperContext;
    addIndex: number;
}

export function ClauseAddButton(props: ExpandedMappingHeaderWidgetProps) {
    const { context, queryExprNode, addIndex } = props;
    const { ballerinaRpcClient } = useVisualizerContext();
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

    const insertStatement = async (statement: string) => {
        handleClose();
        setLoading(true);
        try {
            const addPosition = getAddFieldPosition();
            const modifications = [
                {
                    type: "INSERT",
                    config: { STATEMENT: statement },
                    ...addPosition,
                },
            ];
            await applyModifications(context.filePath, modifications, ballerinaRpcClient);
        } finally {
            setLoading(false);
        }
    }

    const onClickAddLetClause = async () => {
        const variableName = genLetClauseVariableName(queryExprNode.queryPipeline.intermediateClauses);
        await insertStatement(` let var ${variableName} = EXPRESSION`)
    };

    const onClickAddWhereClause = async () => insertStatement(` where EXPRESSION`);

    const onClickAddLimitClause = async () => insertStatement(` limit EXPRESSION`);

    const onClickAddOrderByClause = async () => insertStatement(` order by EXPRESSION ascending`);

    const onClickAddJoinClause = async () => {
        const variableName = genLetClauseVariableName(queryExprNode.queryPipeline.intermediateClauses);
        await insertStatement(` join var ${variableName} in EXPRESSION on EXPRESSION equals EXPRESSION`)
    };

    const onClickAddOuterJoinClause = async () => {
        const variableName = genLetClauseVariableName(queryExprNode.queryPipeline.intermediateClauses);
        await insertStatement(` outer join var ${variableName} in EXPRESSION on EXPRESSION equals EXPRESSION`)
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
                <MenuItem onClick={onClickAddWhereClause}>Add where clause</MenuItem>
                <MenuItem onClick={onClickAddLetClause}>Add let clause</MenuItem>
                <MenuItem onClick={onClickAddLimitClause}>Add limit clause</MenuItem>
                <MenuItem onClick={onClickAddOrderByClause}>Add order by clause</MenuItem>
                <MenuItem onClick={onClickAddJoinClause}>Add join clause</MenuItem>
                <MenuItem onClick={onClickAddOuterJoinClause}>Add outer join clause</MenuItem>

            </Menu>
        </>
    );
}
