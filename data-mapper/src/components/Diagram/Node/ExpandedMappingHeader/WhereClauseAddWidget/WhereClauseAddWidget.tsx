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
import React from 'react';

import { IconButton } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { NodePosition, QueryExpression, STNode } from '@wso2-enterprise/syntax-tree';
import { IDataMapperContext } from '../../../../../utils/DataMapperContext/DataMapperContext';

const useStyles = makeStyles(() =>
    createStyles({
        clause: {
            padding: "5px",
            fontFamily: "monospace",
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
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
        whereClauseWrap: {
            display: 'flex',
            alignItems: 'center'
        },
    })
);

export interface ExpandedMappingHeaderWidgetProps {
    queryExprNode: QueryExpression;
    context: IDataMapperContext;
}

export function WhereClauseAddWidget(props: ExpandedMappingHeaderWidgetProps) {
    const { context, queryExprNode } = props;
    const classes = useStyles();

    const onClickAdd = () => {
        let addPosition:NodePosition;
        const intermediateClauses: STNode[] = queryExprNode.queryPipeline.intermediateClauses;
        if (intermediateClauses?.length === 0) {
            addPosition = queryExprNode.queryPipeline.position
        } else {
            const intermediateCount = intermediateClauses.length;
            addPosition = intermediateClauses[intermediateCount - 1].position;
        }

        const whereKeyword = 'where';
        const expressionPlaceholder = 'EXPRESSION';

        context.enableStamentEditor({
            specificFieldPosition: {
                startColumn: addPosition.endColumn,
                startLine: addPosition.startLine,
                endColumn: addPosition.endColumn,
                endLine: addPosition.endLine
            },
            value: "EXPRESSION",
            valuePosition: {
                startColumn: addPosition.endColumn + whereKeyword.length + 2,
                startLine: addPosition.startLine,
                endColumn: addPosition.endColumn + whereKeyword.length + expressionPlaceholder.length + 2,
                endLine: addPosition.endLine
            },
            label: "Where condition",
            fieldName: ` ${whereKeyword} ${expressionPlaceholder}`,
        });
    };

    return (
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
    );
}
