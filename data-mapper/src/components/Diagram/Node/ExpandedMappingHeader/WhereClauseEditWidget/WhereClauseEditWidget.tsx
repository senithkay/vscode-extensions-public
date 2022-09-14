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

import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { FromClause, JoinClause, LetClause, LimitClause, OrderByClause, STKindChecker, STNode, WhereClause } from '@wso2-enterprise/syntax-tree';
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
    intermediateNodes: (FromClause | JoinClause | LetClause | LimitClause | OrderByClause | WhereClause)[];
    context: IDataMapperContext;

}

export function WhereClauseEditWidget(props: ExpandedMappingHeaderWidgetProps) {
    const { context, intermediateNodes } = props;
    const classes = useStyles();

    const onClickEdit = (editNode:  FromClause | JoinClause | LetClause | LimitClause | OrderByClause | WhereClause) => {
        if(STKindChecker.isWhereClause(editNode)){
            context.enableStamentEditor({
                value: editNode.expression?.source,
                valuePosition: editNode.expression?.position,
                label: "Where condition"
            });
        }
    };

    const deleteWhereClause = (node: STNode) => {
        context.applyModifications([{
            type: "DELETE",
            ...node.position
        }]);
    }

    return (
        <>
            {intermediateNodes?.map((clauseItem, index) =>
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
        </>
    );
}
