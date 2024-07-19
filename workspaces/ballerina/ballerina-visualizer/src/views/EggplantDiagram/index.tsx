/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    PanelContainer,
    NodeList,
    Category as PanelCategory,
    Node as PanelNode,
    Item as PanelItem,
} from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";
import { Diagram } from "@wso2-enterprise/eggplant-diagram";
import {
    EggplantAvailableNodesRequest,
    Flow,
    Node,
    Category,
    Item,
    AvailableNode,
} from "@wso2-enterprise/ballerina-core";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

export function EggplantDiagram() {
    const { rpcClient } = useVisualizerContext();

    const [model, setModel] = useState<Flow>();
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [categories, setCategories] = useState<PanelCategory[]>([]);

    useEffect(() => {
        getSequenceModel();
    }, []);

    const getSequenceModel = () => {
        rpcClient
            .getEggplantDiagramRpcClient()
            .getFlowModel()
            .then((model) => {
                setModel(model.flowModel);
            });
    };

    const handleOnCloseSidePanel = () => {
        setShowSidePanel(false);
    };

    const handleOnAddNode = (parent: Node) => {
        setShowSidePanel(true);
        const getNodeRequest: EggplantAvailableNodesRequest = {
            parentNodeLineRange: {
                startLine: parent.lineRange.startLine,
                endLine: parent.lineRange.endLine,
            },
            parentNodeKind: parent.kind,
        };
        rpcClient
            .getEggplantDiagramRpcClient()
            .getAvailableNodes(getNodeRequest)
            .then((response) => {
                console.log(">>> Available nodes", response);
                setCategories(convertEggplantCategoriesToSidePanelCategories((response as any).availableNodes as Category[]));
            });
    };

    const handleOnSelectNode = (nodeId: string, metadata?: any) => {
        const node = metadata as AvailableNode;        
        console.log(">>> on select panel node", { nodeId, metadata });
        rpcClient
            .getEggplantDiagramRpcClient()
            .getNodeTemplate({id: node.id})
            .then((response) => {
                console.log(">>> Node template", response);
            });
    };

    return (
        <>
            <Container>{!!model && <Diagram model={model} onAddNode={handleOnAddNode} />}</Container>
            <PanelContainer show={showSidePanel} onClose={handleOnCloseSidePanel}>
                <NodeList categories={categories} onSelect={handleOnSelectNode} />
            </PanelContainer>
        </>
    );
}

// utils

function convertAvailableNodeToPanelNode(node: AvailableNode): PanelNode {
    return {
        id: node.id.kind,
        label: node.name,
        description: node.description,
        enabled: node.enabled,
        metadata: node,
    };
}

function convertDiagramCategoryToSidePanelCategory(category: Category): PanelCategory {
    const items: PanelItem[] = category.items.map((item) => {
        if ("id" in item) {
            return convertAvailableNodeToPanelNode(item as AvailableNode);
        } else {
            return convertDiagramCategoryToSidePanelCategory(item as Category);
        }
    });

    return {
        title: category.name,
        description: category.description,
        items: items,
    };
}

function convertEggplantCategoriesToSidePanelCategories(categories: Category[]): PanelCategory[] {
    return categories.map(convertDiagramCategoryToSidePanelCategory);
}
