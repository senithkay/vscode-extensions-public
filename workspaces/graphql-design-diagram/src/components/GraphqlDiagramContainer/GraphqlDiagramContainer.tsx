/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";

import { DiagramModel } from '@projectstorm/react-diagrams';

import { GraphqlDiagramCanvasWidget } from "../Canvas/GraphqlDiagramCanvasWidget";
import { GraphqlHeader } from "../GraphqlHeader";
import { NodeType } from "../NodeFilter";
import { GraphqlDesignModel } from "../resources/model";
import { OperationTypes } from "../TypeFilter";
import { graphqlModelGenerator } from "../utils/model-generators/serviceModelGenerator";

interface GraphqlDiagramContainerProps {
    designModel: GraphqlDesignModel;
}

export function GraphqlDiagramContainer(props: GraphqlDiagramContainerProps) {
    const { designModel } = props;
    const [graphqlServiceModel, setGraphqlServiceModel] = useState<DiagramModel>(undefined);
    const [operationType, setOperationType] = useState<OperationTypes>(OperationTypes.All_Operations);
    const [filteredNode, setFilteredNode] = useState<NodeType>(undefined);

    useEffect(() => {
        setGraphqlServiceModel(graphqlModelGenerator(designModel, operationType, filteredNode));
    }, [designModel, operationType, filteredNode]);

    const updateFilter = (type: OperationTypes) => {
        setOperationType(type);
    }

    const updateNodeFiltering = (node: NodeType) => {
        setFilteredNode(node);
    }

    const modelRenderer = (
        <>
            <GraphqlHeader
                updateFilter={updateFilter}
                updateNodeFiltering={updateNodeFiltering}
                designModel={designModel}
                selectedNode={filteredNode}
            />
            <GraphqlDiagramCanvasWidget model={graphqlServiceModel} />
        </>
    );

    return (
        <>
            {graphqlServiceModel && modelRenderer}
        </>
    );
}
