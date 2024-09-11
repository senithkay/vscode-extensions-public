/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { URI } from "vscode-uri";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { LangClientRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import {
	DiagramModel,
    DiagramModelGenerics
} from "@projectstorm/react-diagrams";
import { DataMapperNodeModel } from '../Diagram/Node/commons/DataMapperNode';
import { getErrorKind, getIONodeHeight } from '../Diagram/utils/dm-utils';
import { OverlayLayerModel } from '../Diagram/OverlayLayer/OverlayLayerModel';
import { ErrorNodeKind } from '../DataMapper/Error/RenderingError';
import { useDMSearchStore } from '../../store/store';
import { ListConstructorNode, MappingConstructorNode, PrimitiveTypeNode, QueryExpressionNode, RequiredParamNode } from '../Diagram/Node';
import { GAP_BETWEEN_FIELDS, GAP_BETWEEN_INPUT_NODES, GAP_BETWEEN_NODE_HEADER_AND_BODY, IO_NODE_DEFAULT_WIDTH, IO_NODE_FIELD_HEIGHT, IO_NODE_HEADER_HEIGHT, OFFSETS, VISUALIZER_PADDING } from '../Diagram/utils/constants';
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
import { isDMSupported } from '../DataMapper/utils';
import { FunctionDefinition, ModulePart } from '@wso2-enterprise/syntax-tree';

export const useProjectComponents = (langServerRpcClient: LangClientRpcClient, fileName: string): {
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
    onError:(kind: ErrorNodeKind) => void,
    zoomLevel: number,
    screenWidth: number,
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
	const fnSource = context ? context.selection.selectedST.stNode.source : undefined;
    const fieldPath = context?.selection.selectedST.fieldPath;
    const queryExprPosition = context?.selection.selectedST?.position;
    const collapsedFields = context?.collapsedFields;
    const { inputSearch, outputSearch } = useDMSearchStore();
    const prevScreenWidth = useRef(screenWidth);

    const genModel = async () => {
        if (prevScreenWidth.current !== screenWidth && diagramModel.getNodes().length > 0) {
            const diagModelNodes = diagramModel.getNodes() as DataMapperNodeModel[];
            diagModelNodes.forEach(diagModelNode => {
                const repositionedNode = nodes.find(newNode => newNode.id === diagModelNode.id);
                if (repositionedNode) {
                    diagModelNode.setPosition(repositionedNode.getX(), repositionedNode.getY());
                }
            });
            diagramModel.setZoomLevel(zoomLevel);
            diagramModel.setOffset(offSetX, offSetY);
            prevScreenWidth.current = screenWidth;
            return diagramModel;
        }
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
        for (const node of nodes) {
            const existingNode = diagramModel.getNodes().find(n => (n as DataMapperNodeModel).id === node.id);
            if (existingNode && existingNode.getY() !== 0) {
                node.setPosition(existingNode.getX(), existingNode.getY());
            }
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
                console.log(e);
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
    } = useQuery(['genModel', {fnSource, fieldPath, queryExprPosition, noOfNodes, inputSearch, outputSearch, collapsedFields, screenWidth}], () => genModel(), {});

    return { updatedModel, isFetching, isError, refetch };
};

export const useRepositionedNodes = (nodes: DataMapperNodeModel[], zoomLevel: number, diagramModel: DiagramModel) => {
    const nodesClone = [...nodes];
    const prevNodes = diagramModel.getNodes() as DataMapperNodeModel[];
    let requiredParamFields = 0;
    let numberOfRequiredParamNodes = 0;
    let additionalSpace = 0;

    let prevBottomY = 0;

    nodesClone.forEach(node => {
        const exisitingNode = prevNodes.find(prevNode => prevNode.id === node.id);

        const nodeHeight = node.height === 0 ? 800 : node.height;
        if (node instanceof MappingConstructorNode
            || node instanceof ListConstructorNode
            || node instanceof PrimitiveTypeNode
            || node instanceof UnionTypeNode
            || (node instanceof UnsupportedIONode && node.kind === UnsupportedExprNodeKind.Output)) {
                const x = (window.innerWidth - VISUALIZER_PADDING) * (100 / zoomLevel) - IO_NODE_DEFAULT_WIDTH;
                const y = exisitingNode && exisitingNode.getY() !== 0 ? exisitingNode.getY() : 0;
                node.setPosition(x, y);
        }
        if (node instanceof RequiredParamNode
            || node instanceof LetClauseNode
            || node instanceof JoinClauseNode
            || node instanceof LetExpressionNode
            || node instanceof ModuleVariableNode
            || node instanceof EnumTypeNode)
        {
            const x = OFFSETS.SOURCE_NODE.X;
            const computedY = prevBottomY + (prevBottomY ? GAP_BETWEEN_INPUT_NODES : 0);
            let y = exisitingNode && exisitingNode.getY() !== 0 ? exisitingNode.getY() : computedY;

            node.setPosition(x, y);

            const nodeHeight = getIONodeHeight(node.numberOfFields);
            prevBottomY = computedY + nodeHeight;
        }
        if (node instanceof FromClauseNode) {
            requiredParamFields = requiredParamFields + node.numberOfFields;
            numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
        }
        if (node instanceof ExpandedMappingHeaderNode) {
            additionalSpace += nodeHeight + OFFSETS.QUERY_MAPPING_HEADER_NODE.MARGIN_BOTTOM;
        }
    });

    return nodesClone;
}

export const useDMMetaData = (langServerRpcClient: LangClientRpcClient): {
    ballerinaVersion: string;
    dMSupported: boolean;
    dMUnsupportedMessage: string;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const fetchDMMetaData = async () => {
        try {
            const ballerinaVersion = (await langServerRpcClient.getBallerinaVersion()).version;
            const dMSupported = isDMSupported(ballerinaVersion);
            const dMUnsupportedMessage = `The current ballerina version ${ballerinaVersion.replace(
                "(swan lake)", "").trim()
            } does not support the Data Mapper feature. Please update your Ballerina versions to 2201.1.2, 2201.2.1, or higher version.`;
            return { ballerinaVersion, dMSupported, dMUnsupportedMessage };
        } catch (networkError: any) {
            console.error('Error while fetching ballerina version', networkError);
        }
    };

    const {
        data: { ballerinaVersion, dMSupported, dMUnsupportedMessage } = {},
        isFetching,
        isError,
        refetch,
    } = useQuery(['fetchDMMetaData'], () => fetchDMMetaData(), {});

    return { ballerinaVersion, dMSupported, dMUnsupportedMessage, isFetching, isError, refetch };
};

export const useFileContent = (langServerRpcClient: LangClientRpcClient, filePath: string, fnST: FunctionDefinition): {
    content: [string, string[]];
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const { source, position } = fnST;
    const fetchContent = async () : Promise<[string, string[]]> => {
        const importStatements: string[] = [];
        try {
            const fullST = await langServerRpcClient.getST({
                documentIdentifier: { uri: URI.file(filePath).toString() }
            });
            const modulePart = fullST.syntaxTree as ModulePart;
            modulePart?.imports.map((importDeclaration: any) => (
                importStatements.push(importDeclaration.source.trim())
            ));
            return [modulePart.source, importStatements];
        } catch (networkError: any) {
            console.error('Error while fetching content', networkError);
        }
    };

    const {
        data: content,
        isFetching,
        isError,
        refetch,
    } = useQuery(['fetchContent', {filePath, source, position}], () => fetchContent(), {});

    return { content, isFetching, isError, refetch };
};
