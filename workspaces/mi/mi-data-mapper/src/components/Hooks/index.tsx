/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    DiagramEngine,
	DiagramModel,
    DiagramModelGenerics
} from "@projectstorm/react-diagrams";
import { DataMapperNodeModel } from '../Diagram/Node/commons/DataMapperNode';
import { OverlayLayerModel } from '../Diagram/OverlayLayer/OverlayLayerModel';
import { ErrorNodeKind } from '../DataMapper/Error/DataMapperError';
import { useDMSearchStore } from '../../store/store';
import { MappingConstructorNode, RequiredParamNode } from '../Diagram/Node';
import { OFFSETS } from '../Diagram/utils/constants';
import { LinkConnectorNode } from '../Diagram/Node/LinkConnector';

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
    // const zoomLevel = diagramModel.getZoomLevel();
    // const offSetX = diagramModel.getOffsetX();
    // const offSetY = diagramModel.getOffsetY();
    const noOfNodes = nodes.length;
    // const context = nodes.find(node => node.context)?.context;
	// const fnSource = context ? context.selection.selectedST.stNode.source : undefined;
    // const collapsedFields = context?.collapsedFields;
    // const { inputSearch, outputSearch } = useDMSearchStore();

    const genModel = async () => {
        const newModel = new DiagramModel();
        // const showInputFilterEmpty = !nodes.some(
        //     node => (node instanceof RequiredParamNode && node.getSearchFilteredType()) || node instanceof FromClauseNode
        // );
        // if (showInputFilterEmpty) {
        //     const inputSearchNotFoundNode = new RequiredParamNode(undefined, undefined, undefined, true);
        //     inputSearchNotFoundNode.setPosition(OFFSETS.SOURCE_NODE.X, OFFSETS.SOURCE_NODE.Y);
        //     newModel.addNode(inputSearchNotFoundNode);
        // }
        newModel.addAll(...nodes);
        for (const node of nodes) {
            try {
                // if (node instanceof RequiredParamNode && !node.getSearchFilteredType()) {
                //     newModel.removeNode(node);
                //     continue;
                // }
                node.setModel(newModel);
                await node.initPorts();
                if (node instanceof LinkConnectorNode) {
                    continue;
                }
                node.initLinks();
            } catch (e) {
                // onError(ErrorNodeKind.GENERIC);
                console.error(e);
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
    } = useQuery(['genModel', {noOfNodes}], () => genModel(), {});

    return { updatedModel, isFetching, isError, refetch };
};


export const useRepositionedNodes = (nodes: DataMapperNodeModel[]) => {
    const nodesClone = [...nodes];
    let requiredParamFields = 0;
    let numberOfRequiredParamNodes = 0;
    let additionalSpace = 0;
    nodesClone.forEach((node) => {
        if (node instanceof MappingConstructorNode) {
                if (Object.values(node.getPorts()).some(port => Object.keys(port.links).length)){
                    node.setPosition(OFFSETS.TARGET_NODE.X, 0);
                } else {
                    // Bring mapping constructor node close to input node, if it doesn't have any links
                    node.setPosition(OFFSETS.TARGET_NODE_WITHOUT_MAPPING.X, 0);
                }
        }
        if (node instanceof RequiredParamNode) {
            node.setPosition(OFFSETS.SOURCE_NODE.X, additionalSpace + (requiredParamFields * 40) + OFFSETS.SOURCE_NODE.Y * (numberOfRequiredParamNodes + 1));
            
            requiredParamFields = requiredParamFields + node.numberOfFields;
            numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
        }
    });

    return nodesClone;
}
