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
import React from 'react';

import { IconButton } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import CollapseIcon from "../../../../assets/icons/CollapseIcon";
import { ViewOption } from "../../../DataMapper/DataMapper";

import { ExpandedMappingHeaderNode } from "./ExpandedMappingHeaderNode";
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { FromClause, JoinClause, LetClause, LimitClause, NodePosition, OrderByClause, STKindChecker, STNode, WhereClause } from '@wso2-enterprise/syntax-tree';

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
            minWidth: 200,
            backgroundColor: "#fff",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            color: "#74828F"
        },
        clause: {
            padding: "5px",
            fontFamily: "monospace",
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
        },
        header: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        },
        iconsButton: {
            padding: '8px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        icon: {
            height: '15px',
            width: '15px',
            marginTop: '-7px',
            marginLeft: '-7px'
        },
        buttonWrapper: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            right: "35px"
        },
        whereClauseWrap: {
            display: 'flex',
            alignItems: 'center'
        },
    })
);

export interface ExpandedMappingHeaderWidgetProps {
    node: ExpandedMappingHeaderNode;
    title: string;
}

export function ExpandedMappingHeaderWidget(props: ExpandedMappingHeaderWidgetProps) {
    const { node, title } = props;
    const classes = useStyles();

    const onClickOnCollapse = () => {
        node.context.changeSelection(ViewOption.COLLAPSE);
    }

    const onClickEdit = (editNode:  FromClause | JoinClause | LetClause | LimitClause | OrderByClause | WhereClause) => {
        if(STKindChecker.isWhereClause(editNode)){
            props.node.context.enableStamentEditor({
                value: editNode.expression?.source,
                valuePosition: editNode.expression?.position,
                label: "Where condition"
            });
        }
    };

    const onClickAdd = () => {
        let addPosition:NodePosition;
        const intermediateClauses: STNode[] = props.node.queryExpr.queryPipeline.intermediateClauses;
        if (intermediateClauses?.length === 0) {
            addPosition = props.node.queryExpr.queryPipeline.position
        } else {
            const intermediateCount = intermediateClauses.length;
            addPosition = intermediateClauses[intermediateCount - 1].position;
        }

        const whereKeyword = 'where';

        props.node.context.enableStamentEditor({
            specificFieldPosition: {
                endColumn: addPosition.endColumn,
                endLine: addPosition.endLine,
                startColumn: addPosition.endColumn,
                startLine: addPosition.startLine
            },
            value: "EXPRESSION",
            valuePosition: {
                endColumn: addPosition.endColumn + whereKeyword.length + 12,
                endLine: addPosition.endLine,
                startColumn: addPosition.endColumn + whereKeyword.length + 2,
                startLine: addPosition.startLine
            },
            label: "Where condition",
            fieldName: ` ${whereKeyword} EXPRESSION`,
        });
    };

    const deleteWhereClause = (node: STNode) => {
        props.node.context.applyModifications([{
            type: "DELETE",
            ...node.position
        }]);
    }

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <div className={classes.clause}>
                    {title}
                </div>
                <div className={classes.buttonWrapper}>
                    <IconButton
                        onClick={onClickOnCollapse}
                        className={classes.iconsButton}
                    >
                        <div className={classes.icon}>
                            <CollapseIcon />
                        </div>
                    </IconButton>
                </div>
            </div>
            {props.node.queryExpr.queryPipeline.intermediateClauses?.map((clauseItem, index) =>
                <div className={classes.whereClauseWrap} key={`${index}-${clauseItem.source}`}>
                    <div className={classes.clause}>
                        {clauseItem.source?.trim()}
                    </div>
                    <IconButton
                        onClick={() => onClickEdit(clauseItem)}
                        className={classes.iconsButton}
                    >
                        <div className={classes.icon}>
                            <CodeOutlinedIcon />
                        </div>
                    </IconButton>
                    <IconButton
                        onClick={() => deleteWhereClause(clauseItem)}
                        className={classes.iconsButton}
                    >
                        <div className={classes.icon}>
                            <HighlightOffIcon />
                        </div>
                    </IconButton>
                </div>
            )}

            <div className={classes.whereClauseWrap}>
                <div className={classes.clause}>
                    Add Where Clause
                </div>
                <IconButton
                    onClick={onClickAdd}
                    className={classes.iconsButton}
                >
                    <div className={classes.icon}>
                        <AddCircleOutline />
                    </div>
                </IconButton>
            </div>

        </div>
    );
}
