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

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { NodePosition, QueryExpression, STNode } from '@wso2-enterprise/syntax-tree';
import { IDataMapperContext } from '../../../../../utils/DataMapperContext/DataMapperContext';
import { genLetClauseVariableName } from '../../../../../utils/st-utils';
import { useStyles } from '../styles';
import clsx from 'clsx';
import AddIcon from '@material-ui/icons/Add';

export interface ExpandedMappingHeaderWidgetProps {
    queryExprNode: QueryExpression;
    context: IDataMapperContext;
    addIndex: number;
}

export function ClauseAddButton(props: ExpandedMappingHeaderWidgetProps) {
    const { context, queryExprNode, addIndex } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | SVGSVGElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const getAddFieldPosition = ():NodePosition => {
        let addPosition: NodePosition;
        const intermediateClauses: STNode[] = queryExprNode.queryPipeline.intermediateClauses;
        const insertAfterNode = intermediateClauses[addIndex];

        if(addIndex >= 0 && insertAfterNode){
            addPosition = {
                ...insertAfterNode.position,
                startColumn: insertAfterNode.position.endColumn
            };
        }else{
            addPosition = {
                ...queryExprNode.queryPipeline.fromClause.position,
                startColumn: queryExprNode.queryPipeline.fromClause.position.endColumn
            }
        }

        return addPosition;
    }

    const onClickAddLetClause = () => {
        handleClose();
        const addPosition = getAddFieldPosition();
        const variableName = genLetClauseVariableName(queryExprNode.queryPipeline.intermediateClauses)
        context.applyModifications([{
            type: "INSERT",
            config: { "STATEMENT": ` let var ${variableName} = EXPRESSION`},
            ...addPosition
        }]);
    }

    const onClickAddWhereClause = () => {
        handleClose();
        const addPosition = getAddFieldPosition();
        context.applyModifications([{
            type: "INSERT",
            config: { "STATEMENT": ` where EXPRESSION`},
            ...addPosition
        }]);
    }

    return (
        <>
            <AddIcon className={clsx(classes.addIcon)} onClick={handleClick} />
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={onClickAddWhereClause}>Add Where Clause</MenuItem>
                <MenuItem onClick={onClickAddLetClause}>Add Let Clause</MenuItem>
            </Menu>
        </>
    );
}
