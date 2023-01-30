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

import { CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import TooltipBase from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExitToApp from "@material-ui/icons/ExitToApp";
import QueryIcon from '@material-ui/icons/StorageOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { STKindChecker, traversNode } from "@wso2-enterprise/syntax-tree";
import clsx from 'clsx';

import { ViewOption } from "../../../DataMapper/DataMapper";
import { DataMapperPortWidget } from '../../Port';
import { FUNCTION_BODY_QUERY } from "../../utils/constants";
import { QueryParentFindingVisitor } from '../../visitors/QueryParentFindingVisitor';

import {
    QueryExpressionNode,
} from './QueryExpressionNode';

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

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
            padding: "5px",
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
            padding: "5px",
            height: "32px",
            width: "32px"
        },
        editIcon: {
            color: theme.palette.grey[300],
        },
        deleteIcon: {
            color: theme.palette.error.main
        },
        loadingContainer: {
            padding: "10px"
        },
        circularProgress: {
            color: "#CBCEDB",
            display: "block"
        }
    })
);

export interface QueryExprAsSFVNodeWidgetProps {
    node: QueryExpressionNode;
    engine: DiagramEngine;
}

export function QueryExpressionNodeWidget(props: QueryExprAsSFVNodeWidgetProps) {
    const { node, engine } = props;
    const classes = useStyles();

    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const onClickOnExpand = () => {
        let isExprBodyQuery: boolean;

        if (STKindChecker.isBracedExpression(node.parentNode)) {
            // Handle scenarios where user tries to expand into
            // braced indexed query expressions which are at the function body level
            const specificFieldFindingVisitor = new QueryParentFindingVisitor(node.value.position);
            traversNode(node.context.selection.selectedST.stNode, specificFieldFindingVisitor);
            const specificField = specificFieldFindingVisitor.getSpecificField();
            if (specificField && STKindChecker.isFunctionDefinition(specificField)) {
                isExprBodyQuery = true;
            }
        } else if (
            STKindChecker.isExpressionFunctionBody(node.parentNode) ||
            STKindChecker.isLetExpression(node.parentNode)
        ) {
            isExprBodyQuery = true;
        }
        node.context.changeSelection(ViewOption.EXPAND,
            {
                ...node.context.selection,
                selectedST: {
                    stNode: isExprBodyQuery ? node.context.selection.selectedST.stNode : node.parentNode,
                    fieldPath: isExprBodyQuery ? FUNCTION_BODY_QUERY : node.targetFieldFQN
                }
            })
    }

    const deleteQueryLink = async () => {
        setDeleteInProgress(true);
        await node.deleteLink();
    }

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

    const loadingScreen = (
        <CircularProgress
            size={22}
            thickness={3}
            className={classes.circularProgress}
        />
    );

    return (!node.hidden && (
        <>
            {(!!node.sourcePort && !!node.inPort && !!node.outPort) && (
                <div className={classes.root} >
                    <div className={classes.header}>
                        <DataMapperPortWidget engine={engine} port={node.inPort} />
                        <TooltipComponent interactive={false} arrow={true} title={"Query Expression"}>
                            <span className={classes.openQueryIcon} >
                                <QueryIcon  />
                            </span>
                        </TooltipComponent>
                        <div className={classes.element} onClick={onClickOnExpand} data-testid={`expand-query-${node?.targetFieldFQN}`}>
                            <div className={classes.iconWrapper}>
                                <ExitToApp className={clsx(classes.editIcon)}/>
                            </div>
                        </div>
                        {deleteInProgress ? (
                            <div className={clsx(classes.element, classes.loadingContainer)}>
                                {loadingScreen}
                            </div>
                        ) : (
                            <div className={classes.element} onClick={deleteQueryLink} data-testid={`delete-query-${node?.targetFieldFQN}`}>
                                <div className={classes.iconWrapper}>
                                    <DeleteIcon className={clsx(classes.deleteIcon)}/>
                                </div>
                            </div>
                        )}
                        <DataMapperPortWidget engine={engine} port={node.outPort} />
                    </div>
                </div>
            )}
        </>
    ));
}
