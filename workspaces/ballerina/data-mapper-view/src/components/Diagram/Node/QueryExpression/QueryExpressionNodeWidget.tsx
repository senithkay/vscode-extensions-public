/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { css } from "@emotion/css";
import { CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import TooltipBase from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExitToApp from "@material-ui/icons/ExitToApp";
import QueryIcon from '@material-ui/icons/StorageOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ExpressionFunctionBody, STKindChecker, traversNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";

import { ViewOption } from "../../../DataMapper/DataMapper";
import { DataMapperPortWidget } from '../../Port';
import { FUNCTION_BODY_QUERY } from "../../utils/constants";
import { isRepresentFnBody } from "../../utils/dm-utils";
import { QueryParentFindingVisitor } from '../../visitors/QueryParentFindingVisitor';

import {
    QueryExpressionNode,
} from './QueryExpressionNode';

export const tooltipBaseStyles = {
    tooltip: {
        color: "var(--vscode-input-placeholderForeground)",
        backgroundColor: "var(--vscode-input-background)",
        border: "1px solid var(--vscode-editorWidget-background)",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "var(--vscode-input-background)"
    }
};

export const useStyles = () => ({
    root: css({
        width: '100%',
        backgroundColor: "var(--vscode-input-background)",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: "var(--vscode-checkbox-border)",
        boxShadow: "0px 5px 50px rgba(203, 206, 219, 0.5)",
        borderRadius: "10px",
        alignItems: "center",
        overflow: "hidden",
    }),
    element: css({
        backgroundColor: "var(--vscode-input-background)",
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
    }),
    iconWrapper: css({
        height: "22px",
        width: "22px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }),
    fromClause: css({
        padding: "5px",
        fontFamily: "GilmerMedium",
        marginRight: '10px'
    }),
    mappingPane: css({
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    }),
    header: css({
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }),
    icons: css({
        padding: '5px'
    }),
    openQueryIcon: css({
        color: "var(--vscode-pickerGroup-border)",
        padding: "5px",
        height: "32px",
        width: "32px"
    }),
    editIcon: css({
        color: "var(--vscode-pickerGroup-border)",
    }),
    deleteIcon: css({
        color: "var(--vscode-errorForeground)"
    }),
    loadingContainer: css({
        padding: "10px"
    }),
    circularProgress: css({
        color: "var(--vscode-input-background)",
        display: "block"
    })
});

export interface QueryExprAsSFVNodeWidgetProps {
    node: QueryExpressionNode;
    engine: DiagramEngine;
}

export function QueryExpressionNodeWidget(props: QueryExprAsSFVNodeWidgetProps) {
    const { node, engine } = props;
    const { stNode: selectedST } = node.context.selection.selectedST;
    let exprFnBody: ExpressionFunctionBody;
    if (STKindChecker.isFunctionDefinition(selectedST) && STKindChecker.isExpressionFunctionBody(selectedST.functionBody)) {
        exprFnBody = selectedST.functionBody;
    }
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
        } else if (exprFnBody && isRepresentFnBody(node.parentNode, exprFnBody)) {
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
                                <ExitToApp className={classnames(classes.editIcon)}/>
                            </div>
                        </div>
                        {deleteInProgress ? (
                            <div className={classnames(classes.element, classes.loadingContainer)}>
                                {loadingScreen}
                            </div>
                        ) : (
                            <div className={classes.element} onClick={deleteQueryLink} data-testid={`delete-query-${node?.targetFieldFQN}`}>
                                <div className={classes.iconWrapper}>
                                    <DeleteIcon className={classnames(classes.deleteIcon)}/>
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
