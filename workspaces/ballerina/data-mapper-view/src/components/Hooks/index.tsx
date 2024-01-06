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
import { RequiredParamNode } from '../Diagram/Node';
import { OFFSETS } from '../Diagram/utils/constants';

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
    engine: DiagramEngine,
    onError:(kind: ErrorNodeKind) => void
): {
    diagramModel: DiagramModel<DiagramModelGenerics>;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const defaultModelOptions = { zoom: 90 }
    const model = new DiagramModel(defaultModelOptions);
    const zoomLevel = model.getZoomLevel();
    const offSetX = model.getOffsetX();
    const offSetY = model.getOffsetY();
    const noOfNodes = nodes.length;
	const fnSource = nodes.find(node => node.context).context.selection.selectedST.stNode.source;
    const { inputSearch, outputSearch } = useDMSearchStore();

    const genModel = async () => {
        const newModel = new DiagramModel();
        newModel.setZoomLevel(zoomLevel);
        newModel.setOffset(offSetX, offSetY);
        if (!nodes.some(node => node instanceof RequiredParamNode && node.getSearchFilteredType())) {
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
                node.initLinks();
            } catch (e) {
                const errorNodeKind = getErrorKind(node);
                onError(errorNodeKind);
            }
        }
        newModel.setLocked(true);
        engine.setModel(newModel);
        newModel.addLayer(new OverlayLayerModel());
        return newModel;
    };

    const {
        data: diagramModel,
        isFetching,
        isError,
        refetch,
    } = useQuery(['genModel', {fnSource, noOfNodes, inputSearch, outputSearch}], () => genModel(), {});

    return { diagramModel, isFetching, isError, refetch };
};
