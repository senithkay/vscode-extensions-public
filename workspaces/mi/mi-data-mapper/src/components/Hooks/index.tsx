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
	DiagramModel,
    DiagramModelGenerics
} from "@projectstorm/react-diagrams";

import { DataMapperNodeModel } from '../Diagram/Node/commons/DataMapperNode';
import { getArrayFilterNodeHeight, getIONodeHeight, hasSameFilters, isSameView } from '../Diagram/utils/diagram-utils';
import { OverlayLayerModel } from '../Diagram/OverlayLayer/OverlayLayerModel';
import { ErrorNodeKind } from '../DataMapper/Error/DataMapperError';
import { useDMCollapsedFieldsStore, useDMSearchStore } from '../../store/store';
import { ArrayFilterNode, ArrayOutputNode, InputNode, ObjectOutputNode, SubMappingNode } from '../Diagram/Node';
import { GAP_BETWEEN_FILTER_NODE_AND_INPUT_NODE, GAP_BETWEEN_INPUT_NODES, IO_NODE_DEFAULT_WIDTH, OFFSETS, VISUALIZER_PADDING } from '../Diagram/utils/constants';
import { LinkConnectorNode } from '../Diagram/Node/LinkConnector';
import { InputDataImportNodeModel, OutputDataImportNodeModel } from '../Diagram/Node/DataImport/DataImportNode';
import { ArrayFnConnectorNode } from '../Diagram/Node/ArrayFnConnector';
import { FocusedInputNode } from '../Diagram/Node/FocusedInput';
import { PrimitiveOutputNode } from '../Diagram/Node/PrimitiveOutput';

export const useRepositionedNodes = (
    nodes: DataMapperNodeModel[],
    zoomLevel: number,
    diagramModel: DiagramModel,
    filtersCollapsedChanged: boolean
) => {
    const nodesClone = [...nodes];
    const prevNodes = diagramModel.getNodes() as DataMapperNodeModel[];
    const filtersUnchanged = hasSameFilters(nodesClone, prevNodes) && !filtersCollapsedChanged;

    let prevBottomY = 0;

    nodesClone.forEach(node => {
        const exisitingNode = prevNodes.find(prevNode => prevNode.id === node.id);
        const sameView = isSameView(node, exisitingNode);

        if (node instanceof ObjectOutputNode
            || node instanceof ArrayOutputNode
            || node instanceof PrimitiveOutputNode
            || node instanceof OutputDataImportNodeModel
        ) {
            const x = (window.innerWidth - VISUALIZER_PADDING) * (100 / zoomLevel) - IO_NODE_DEFAULT_WIDTH;
            const y = exisitingNode && sameView && exisitingNode.getY() !== 0 ? exisitingNode.getY() : 0;
            node.setPosition(x, y);
        }
        if (node instanceof InputNode
            || node instanceof InputDataImportNodeModel
            || node instanceof SubMappingNode
            || node instanceof ArrayFilterNode
        ) {
            const x = OFFSETS.SOURCE_NODE.X;
            const computedY = prevBottomY + (prevBottomY ? GAP_BETWEEN_INPUT_NODES : 0);
            let y = exisitingNode && sameView && filtersUnchanged && exisitingNode.getY() !== 0 ? exisitingNode.getY() : computedY;
            node.setPosition(x, y);
            if (node instanceof InputNode) {
                const nodeHeight = getIONodeHeight(node.numberOfFields);
                prevBottomY = computedY + nodeHeight;
            } else if (node instanceof ArrayFilterNode) {
                const nodeHeight = getArrayFilterNodeHeight(node);
                prevBottomY = computedY + (nodeHeight * (100/zoomLevel)) + GAP_BETWEEN_FILTER_NODE_AND_INPUT_NODE;
            }
        }
        if (node instanceof FocusedInputNode) {
            const x = OFFSETS.SOURCE_NODE.X;
            const computedY = prevBottomY + (prevBottomY ? GAP_BETWEEN_INPUT_NODES : 0);
            let y = exisitingNode && sameView && filtersUnchanged && exisitingNode.getY() !== 0 ? exisitingNode.getY() : computedY;

            node.setPosition(x, y);
            const nodeHeight = getIONodeHeight(node.numberOfFields);
            prevBottomY = computedY + nodeHeight;
        }
    });

    return nodesClone;
}

export const useDiagramModel = (
    nodes: DataMapperNodeModel[],
    diagramModel: DiagramModel,
    onError:(kind: ErrorNodeKind) => void,
    zoomLevel: number,
): {
    updatedModel: DiagramModel<DiagramModelGenerics>;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const offSetX = diagramModel.getOffsetX();
    const offSetY = diagramModel.getOffsetY();
    const noOfNodes = nodes.length;
    const context = nodes.find(node => node.context)?.context;
    const { focusedST, views } = context ?? {};
	const focusedSrc = focusedST ? focusedST.getText() : undefined;
    const lastView = views ? views[views.length - 1] : undefined;
    const collapsedFields = useDMCollapsedFieldsStore(state => state.collapsedFields); // Subscribe to collapsedFields
    const { inputSearch, outputSearch } = useDMSearchStore();

    const genModel = async () => {
        if (diagramModel.getZoomLevel() !== zoomLevel && diagramModel.getNodes().length > 0) {
            // Update only zoom level and offset if zoom level is changed
            diagramModel.setZoomLevel(zoomLevel);
            diagramModel.setOffset(offSetX, offSetY);
            return diagramModel;
        }
        const newModel = new DiagramModel();
        newModel.setZoomLevel(zoomLevel);
        newModel.setOffset(offSetX, offSetY);
        const showInputFilterEmpty = !nodes.some(
            node => (node instanceof InputNode && node.getSearchFilteredType()) || node instanceof FocusedInputNode
        );
        if (showInputFilterEmpty) {
            const inputSearchNotFoundNode = new InputNode(undefined, undefined, true);
            inputSearchNotFoundNode.setPosition(OFFSETS.SOURCE_NODE.X, OFFSETS.SOURCE_NODE.Y);
            newModel.addNode(inputSearchNotFoundNode);
        }
        newModel.addAll(...nodes);
        for (const node of nodes) {
            try {
                if (node instanceof InputNode && !node.getSearchFilteredType()) {
                    newModel.removeNode(node);
                    continue;
                }
                node.setModel(newModel);
                await node.initPorts();
                if (node instanceof LinkConnectorNode || node instanceof ArrayFnConnectorNode) {
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
    } = useQuery(['genModel', {noOfNodes, focusedSrc, lastView, inputSearch, outputSearch, collapsedFields, newZoomLevel: zoomLevel}], () => genModel(), {});

    return { updatedModel, isFetching, isError, refetch };
};
