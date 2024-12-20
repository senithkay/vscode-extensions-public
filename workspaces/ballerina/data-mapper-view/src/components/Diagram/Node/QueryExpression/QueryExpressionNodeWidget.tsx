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

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ExpressionFunctionBody, STKindChecker, traversNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";

import { ViewOption } from "../../../DataMapper/DataMapper";
import { DataMapperPortWidget } from '../../Port';
import { FUNCTION_BODY_QUERY, SELECT_CALUSE_QUERY } from "../../utils/constants";
import { getQueryExprMappingType, hasCollectClauseExpr, hasIndexedQueryExpr, isRepresentFnBody } from "../../utils/dm-utils";
import { QueryParentFindingVisitor } from '../../visitors/QueryParentFindingVisitor';

import {
    QueryExpressionNode,
} from './QueryExpressionNode';
import { Button, Codicon, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import { isPositionsEquals } from '../../../../utils/st-utils';
import { QueryExprFindingVisitorByPosition } from '../../visitors/QueryExprFindingVisitorByPosition';
import { useIntermediateNodeStyles } from '../../../styles';

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
    const classes = useIntermediateNodeStyles();

    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const onClickOnExpand = () => {
        let isExprBodyQuery: boolean;
        let isSelectClauseQuery: boolean;

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
        } else if (STKindChecker.isSelectClause(node.parentNode)
            || (STKindChecker.isSpecificField(node.parentNode)
                && STKindChecker.isQueryExpression(node.parentNode.valueExpr)
                && !isPositionsEquals(node.value.position, node.parentNode.valueExpr.position))
        ) {
            isSelectClauseQuery = true;
        }
        let selectClauseIndex: number;
        if (isSelectClauseQuery) {
            const queryExprFindingVisitor = new QueryExprFindingVisitorByPosition(node.value.position);
            traversNode(selectedST, queryExprFindingVisitor);
            selectClauseIndex = queryExprFindingVisitor.getSelectClauseIndex();
        }

        const hasIndexedQuery = hasIndexedQueryExpr(node.parentNode);
        const hasCollectClause = hasCollectClauseExpr(node.value);
        const mappingType = getQueryExprMappingType(hasIndexedQuery, hasCollectClause);
        node.context.changeSelection(ViewOption.EXPAND,
            {
                ...node.context.selection,
                selectedST: {
                    stNode: isExprBodyQuery || isSelectClauseQuery ? node.context.selection.selectedST.stNode : node.parentNode,
                    fieldPath: isExprBodyQuery ? FUNCTION_BODY_QUERY : isSelectClauseQuery ? SELECT_CALUSE_QUERY : node.targetFieldFQN,
                    position: node.value.position,
                    index: selectClauseIndex,
                    mappingType: mappingType,
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
                            tooltip="Go to query"
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
