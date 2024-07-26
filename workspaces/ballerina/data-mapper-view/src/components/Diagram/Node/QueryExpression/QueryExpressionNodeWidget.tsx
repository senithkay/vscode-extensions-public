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
import { Button, Codicon, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';

export const useStyles = () => ({
    root: css({
        width: '100%',
        backgroundColor: "var(--vscode-sideBar-background)",
        padding: "2px",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: "var(--vscode-checkbox-border)",
        alignItems: "center",
        border: "1px solid var(--vscode-welcomePage-tileBorder)",
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
        fontWeight: 600,
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
        alignItems: "center",
        "& > *": {
            margin: "0 2px"
        }
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

    const loadingScreen = (
        <ProgressRing sx={{ height: '16px', width: '16px' }} />
    );

    return (!node.hidden && (
        <>
            {(!!node.sourcePort && !!node.inPort && !!node.outPort) && (
                <div className={classes.root} >
                    <div className={classes.header}>
                        <DataMapperPortWidget engine={engine} port={node.inPort} />
                        <Tooltip content={"Query Expression"} position="bottom">
                            <Codicon name="list-unordered" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                        </Tooltip>
                        <Button
                            appearance="icon"
                            tooltip="Edit"
                            onClick={onClickOnExpand}
                            data-testid={`expand-query-${node?.targetFieldFQN}`}
                        >
                            <Codicon name="export" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                        </Button>
                        {deleteInProgress ? (
                            <div className={classnames(classes.element, classes.loadingContainer)}>
                                {loadingScreen}
                            </div>
                        ) : (
                            <Button
                                appearance="icon"
                                tooltip="Delete"
                                onClick={deleteQueryLink} data-testid={`delete-query-${node?.targetFieldFQN}`}
                            >
                                <Codicon name="trash" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                            </Button>
                        )}
                        <DataMapperPortWidget engine={engine} port={node.outPort} />
                    </div>
                </div>
            )}
        </>
    ));
}
