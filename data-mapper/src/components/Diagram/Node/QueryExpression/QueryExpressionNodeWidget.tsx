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
import * as React from 'react';

import { IconButton } from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import TooltipBase from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import QueryIcon from '@material-ui/icons/StorageOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import ExitToApp from "@material-ui/icons/ExitToApp";
import { ViewOption } from "../../../DataMapper/DataMapper";
import { DataMapperPortWidget, RecordFieldPortModel } from '../../Port';

import {
    QueryExpressionNode,
} from './QueryExpressionNode';
import clsx from 'clsx';

export const tooltipBaseStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

const styles = (theme: Theme) => createStyles({
    root: {
        width: '100%',
        backgroundColor: theme.palette.common.white,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: theme.palette.grey[400],
        boxShadow: "0px 5px 50px rgba(203, 206, 219, 0.5)",
        borderRadius: "10px",
		alignItems: "center",
		overflow: "hidden",
    },
    element: {
        backgroundColor: theme.palette.common.white,
        padding: "10px",
        cursor: "pointer",
        transitionDuration: "0.2s",
        userSelect: "none",
        pointerEvents: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "&:hover": {
            filter: "brightness(0.95)",
        },
    },
    iconWrapper: {
        height: "22px",
        width: "22px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    fromClause: {
        padding: "5px",
        fontFamily: "GilmerMedium",
        marginRight: '10px'
    },
    mappingPane: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    icons: {
        padding: '5px'
    },
    openQueryIcon: {
        color: theme.palette.grey[300],
        padding: "10px",
        height: "42px",
        width: "42px"
    },
    editIcon: {
        color: theme.palette.grey[300],
    },
    deleteIcon: {
        color: theme.palette.error.main
    }
});

export interface QueryExprAsSFVNodeWidgetProps extends WithStyles<typeof styles> {
    node: QueryExpressionNode;
    engine: DiagramEngine;
}

class QueryExprAsSFVNodeWidgetC extends React.Component<QueryExprAsSFVNodeWidgetProps> {
    render() {
        const node = this.props.node;
        const classes = this.props.classes;
        const engine = this.props.engine;

        const onClickOnExpand = () => {
            node.context.changeSelection(ViewOption.EXPAND,
                {
                    ...node.context.selection,
                    selectedST: {
                        stNode: node.parentNode,
                        fieldPath: node.targetFieldFQN
                    }
                })
        }

        const deleteQueryLink = () => {
            node.deleteLink();
        }

        const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

        return (!node.hidden &&(
            <>
                {/* TODO: Identify inner query expressions and render minimized boxes to denote those with links */}
                {!!node.sourcePort && (
                    <div className={classes.root} >
                        <div className={classes.header}>
                            <DataMapperPortWidget engine={engine} port={node.inPort} />
                            <TooltipComponent interactive={false} arrow={true} title={"Query Expression"}>
                                <span className={classes.openQueryIcon} >
                                    <QueryIcon  />
                                </span>
                            </TooltipComponent>
                            <div className={classes.element} onClick={onClickOnExpand}>
                                <div className={classes.iconWrapper}>
                                    <ExitToApp className={clsx(classes.editIcon)}/>
                                </div>
                            </div>
                            <div className={classes.element} onClick={deleteQueryLink}>
                                <div className={classes.iconWrapper}>
                                    <DeleteIcon className={clsx(classes.deleteIcon)}/>
                                </div>
                            </div>
                            <DataMapperPortWidget engine={engine} port={node.outPort} />
                        </div>
                    </div>
                )}
            </>
        ));
    }
}

export const QueryExpressionNodeWidget = withStyles(styles, { withTheme: true })(QueryExprAsSFVNodeWidgetC);
