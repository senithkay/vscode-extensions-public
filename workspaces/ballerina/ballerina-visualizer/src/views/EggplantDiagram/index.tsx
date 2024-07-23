/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    PanelContainer,
    NodeList,
    Form,
    Category as PanelCategory,
    FormField,
    FormValues,
} from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";
import { Diagram } from "@wso2-enterprise/eggplant-diagram";
import { EggplantAvailableNodesRequest, Flow, Node, Category, AvailableNode } from "@wso2-enterprise/ballerina-core";
import {
    convertEggplantCategoriesToSidePanelCategories,
    convertNodePropertiesToFormFields,
    getContainerTitle,
    updateNodeProperties,
} from "./../../utils/eggplant";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    FORM = "FORM",
}

export function EggplantDiagram() {
    const { rpcClient } = useVisualizerContext();

    const [model, setModel] = useState<Flow>();
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelView, setSidePanelView] = useState<SidePanelView>(SidePanelView.NODE_LIST);
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [fields, setFields] = useState<FormField[]>([]);
    const selectedNodeRef = useRef<Node>();
    const topNodeRef = useRef<Node>();

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
        setSidePanelView(SidePanelView.NODE_LIST);
        setFields([]);
        selectedNodeRef.current = undefined;
        topNodeRef.current = undefined;
    };

    const handleOnAddNode = (parent: Node) => {
        setShowSidePanel(true);
        setSidePanelView(SidePanelView.NODE_LIST);
        topNodeRef.current = parent;
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
                setCategories(convertEggplantCategoriesToSidePanelCategories(response.categories as Category[]));
            });
    };

    const handleOnSelectNode = (nodeId: string, metadata?: any) => {
        setShowSidePanel(true);
        setSidePanelView(SidePanelView.FORM);
        const node = metadata as AvailableNode;
        console.log(">>> on select panel node", { nodeId, metadata });
        rpcClient
            .getEggplantDiagramRpcClient()
            .getNodeTemplate({ id: node.id })
            .then((response) => {
                console.log(">>> Node template", response);
                selectedNodeRef.current = response.flowNode;
                setFields(convertNodePropertiesToFormFields(response.flowNode.nodeProperties));
            });
    };

    const handleOnFormSubmit = (data: FormValues) => {
        console.log(">>> on form submit", data);
        if (selectedNodeRef.current && topNodeRef.current) {
            const updatedNodeProperties = updateNodeProperties(data, selectedNodeRef.current.nodeProperties);
            const updatedNode: Node = {
                ...selectedNodeRef.current,
                lineRange: {
                    fileName: topNodeRef.current.lineRange.fileName,
                    startLine: topNodeRef.current.lineRange.endLine,
                    endLine: topNodeRef.current.lineRange.endLine,
                },
                nodeProperties: updatedNodeProperties,
            };
            console.log(">>> Updated node", updatedNode);

            rpcClient
                .getEggplantDiagramRpcClient()
                .getSourceCode({ flowNode: updatedNode })
                .then((response) => {
                    console.log(">>> Updated source code", response);
                    // update the model
                });

            // clear memory
            setFields([]);
            selectedNodeRef.current = undefined;
            handleOnCloseSidePanel();
        }
    };

    const handleOnFormBack = () => {
        setSidePanelView(SidePanelView.NODE_LIST);
        // clear memory
        setFields([]);
        selectedNodeRef.current = undefined;
    };

    return (
        <>
            <Container>{!!model && <Diagram model={model} onAddNode={handleOnAddNode} />}</Container>
            <PanelContainer
                title={getContainerTitle(sidePanelView)}
                show={showSidePanel}
                onClose={handleOnCloseSidePanel}
                onBack={sidePanelView === SidePanelView.FORM ? handleOnFormBack : undefined}
            >
                {sidePanelView === SidePanelView.NODE_LIST && (
                    <NodeList categories={categories} onSelect={handleOnSelectNode} />
                )}
                {sidePanelView === SidePanelView.FORM && <Form formFields={fields} onSubmit={handleOnFormSubmit} />}
            </PanelContainer>
        </>
    );
}
