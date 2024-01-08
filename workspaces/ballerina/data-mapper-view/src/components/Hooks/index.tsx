/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { URI } from "vscode-uri";
import { BallerinaProjectComponents } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { LangServerRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import {
    DiagramEngine,
	DiagramModel,
    DiagramModelGenerics
} from "@projectstorm/react-diagrams";
import { DataMapperNodeModel } from '../Diagram/Node/commons/DataMapperNode';
import { getErrorKind } from '../Diagram/utils/dm-utils';
import { OverlayLayerModel } from '../Diagram/OverlayLayer/OverlayLayerModel';
import { ErrorNodeKind } from '../DataMapper/Error/DataMapperError';
import { useDMSearchStore } from '../../store/store';
import { ListConstructorNode, MappingConstructorNode, PrimitiveTypeNode, QueryExpressionNode, RequiredParamNode } from '../Diagram/Node';
import { OFFSETS } from '../Diagram/utils/constants';
import { FromClauseNode } from '../Diagram/Node/FromClause';
import { UnionTypeNode } from '../Diagram/Node/UnionType';
import { UnsupportedExprNodeKind, UnsupportedIONode } from '../Diagram/Node/UnsupportedIO';
import { LinkConnectorNode } from '../Diagram/Node/LinkConnector';
import { LetClauseNode } from '../Diagram/Node/LetClause';
import { JoinClauseNode } from '../Diagram/Node/JoinClause';
import { LetExpressionNode } from '../Diagram/Node/LetExpression';
import { ModuleVariableNode } from '../Diagram/Node/ModuleVariable';
import { EnumTypeNode } from '../Diagram/Node/EnumType';
import { ExpandedMappingHeaderNode } from '../Diagram/Node/ExpandedMappingHeader';

export const useProjectComponents = (langServerRpcClient: LangServerRpcClient, fileName: string): {
    projectComponents: BallerinaProjectComponents;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const fetchProjectComponents = async () => {
        try {
            const componentResponse = await langServerRpcClient.getBallerinaProjectComponents({
                documentIdentifiers: [
                    {
                        uri: URI.file(fileName).toString(),
                    }
                ]
            })
            return componentResponse;
        } catch (networkError: any) {
            console.error('Error while fetching project components', networkError);
        }
    };

    const {
        data: projectComponents,
        isFetching,
        isError,
        refetch,
    } = useQuery(['fetchProjectComponents'], () => fetchProjectComponents(), {});

    return { projectComponents, isFetching, isError, refetch };
};

export const useDiagramModel = (
    nodes: DataMapperNodeModel[],
    diagramModel: DiagramModel,
    onError:(kind: ErrorNodeKind) => void
): {
    updatedModel: DiagramModel<DiagramModelGenerics>;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const zoomLevel = diagramModel.getZoomLevel();
    const offSetX = diagramModel.getOffsetX();
    const offSetY = diagramModel.getOffsetY();
    const noOfNodes = nodes.length;
    const context = nodes.find(node => node.context)?.context;
	const fnSource = context ? context.selection.selectedST.stNode.source : undefined;
    const collapsedFields = context?.collapsedFields;
    const { inputSearch, outputSearch } = useDMSearchStore();

    const genModel = async () => {
        const newModel = new DiagramModel();
        newModel.setZoomLevel(zoomLevel);
        newModel.setOffset(offSetX, offSetY);
        const showInputFilterEmpty = !nodes.some(
            node => (node instanceof RequiredParamNode && node.getSearchFilteredType()) || node instanceof FromClauseNode
        );
        if (showInputFilterEmpty) {
            const inputSearchNotFoundNode = new RequiredParamNode(undefined, undefined, undefined, true);
            inputSearchNotFoundNode.setPosition(OFFSETS.SOURCE_NODE.X, OFFSETS.SOURCE_NODE.Y);
            newModel.addNode(inputSearchNotFoundNode);
        }
        newModel.addAll(...nodes);
        for (const node of nodes) {
            try {
                if (node instanceof RequiredParamNode && !node.getSearchFilteredType()) {
                    newModel.removeNode(node);
                    continue;
                }
                node.setModel(newModel);
                await node.initPorts();
                if (node instanceof LinkConnectorNode || node instanceof QueryExpressionNode) {
                    continue;
                }
                node.initLinks();
            } catch (e) {
                const errorNodeKind = getErrorKind(node);
                onError(errorNodeKind);
            }
        }
        newModel.setLocked(true);
        newModel.addLayer(new OverlayLayerModel());
        return newModel;
    };

    const {
        data: updatedModel,
        isFetching,
        isError,
        refetch,
    } = useQuery(['genModel', {fnSource, noOfNodes, inputSearch, outputSearch, collapsedFields}], () => genModel(), {});

    return { updatedModel, isFetching, isError, refetch };
};


export const useRepositionedNodes = (nodes: DataMapperNodeModel[]) => {
    const nodesClone = [...nodes];
    let requiredParamFields = 0;
    let numberOfRequiredParamNodes = 0;
    let additionalSpace = 0;
    nodesClone.forEach((node) => {
        if (node instanceof MappingConstructorNode
            || node instanceof ListConstructorNode
            || node instanceof PrimitiveTypeNode
            || node instanceof UnionTypeNode
            || (node instanceof UnsupportedIONode && node.kind === UnsupportedExprNodeKind.Output)) {
                if (Object.values(node.getPorts()).some(port => Object.keys(port.links).length)){
                    node.setPosition(OFFSETS.TARGET_NODE.X, 0);
                } else {
                    // Bring mapping constructor node close to input node, if it doesn't have any links
                    node.setPosition(OFFSETS.TARGET_NODE_WITHOUT_MAPPING.X, 0);
                }
        }
        if (node instanceof RequiredParamNode
            || node instanceof LetClauseNode
            || node instanceof JoinClauseNode
            || node instanceof LetExpressionNode
            || node instanceof ModuleVariableNode
            || node instanceof EnumTypeNode)
        {
            node.setPosition(OFFSETS.SOURCE_NODE.X, additionalSpace + (requiredParamFields * 40) + OFFSETS.SOURCE_NODE.Y * (numberOfRequiredParamNodes + 1));
            const isLetExprNode = node instanceof LetExpressionNode;
            const hasLetVarDecls = isLetExprNode && !!node.letVarDecls.length;
            requiredParamFields = requiredParamFields
                + (isLetExprNode && !hasLetVarDecls ? 0 : node.numberOfFields);
            numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
            additionalSpace += isLetExprNode && !hasLetVarDecls ? 10 : 0;
        }
        if (node instanceof FromClauseNode) {
            requiredParamFields = requiredParamFields + node.numberOfFields;
            numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
        }
        if (node instanceof ExpandedMappingHeaderNode) {
            additionalSpace += node.height + OFFSETS.QUERY_MAPPING_HEADER_NODE.MARGIN_BOTTOM;
        }
    });

    return nodesClone;
}
