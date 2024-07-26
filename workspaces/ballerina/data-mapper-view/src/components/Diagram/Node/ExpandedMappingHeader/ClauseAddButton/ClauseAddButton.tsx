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

import { NodePosition, QueryExpression, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { genLetClauseVariableName } from "../../../../../utils/st-utils";
import { useStyles } from "../styles";
import { Button, Icon, Item, Menu, MenuItem, Popover, ProgressRing } from "@wso2-enterprise/ui-toolkit";

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
            await context.applyModifications(modifications);
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

    const menuItems: Item[] = [
        { id: 0, label: "Add where clause", onClick: onClickAddWhereClause },
        { id: 1, label: "Add let clause", onClick: onClickAddLetClause },
        { id: 2, label: "Add limit clause", onClick: onClickAddLimitClause },
        { id: 3, label: "Add order by clause", onClick: onClickAddOrderByClause },
        { id: 4, label: "Add join clause", onClick: onClickAddJoinClause },
        { id: 5, label: "Add outer join clause", onClick: onClickAddOuterJoinClause },
    ]

    return (
        <>
            <div className={classes.lineWrap}>
                <div className={classes.line} />
                <div className={classes.addButtonWrap} data-testid={`intermediary-add-btn-${addIndex}`}>
                    {isLoading ? (
                        <ProgressRing sx={{ height: '16px', width: '16px' }} />
                    ) : (
                        <Button
                            appearance="icon"
                            onClick={handleClick}
                        >
                            <Icon name="add-circle-outline" className={classes.addIcon} />
                        </Button>
                    )}
                </div>
                <div className={classes.line} />
            </div>
            <Popover
                open={open}
                anchorEl={anchorEl}
                handleClose={handleClose}
                sx={{
                    padding: 0,
                    borderRadius: 0
                }}
            >
                <Menu 
                    sx={{ 
                        padding: 0,
                        backgroundColor: "var(--vscode-editor-background)",
                        color: "var(--vscode-inputOption-activeForeground)",
                    }}
                >
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            sx={{ fontSize: "var(--type-ramp-base-font-size)" }}
                        />
                    ))}
                </Menu>
            </Popover>
        </>
    );
}
