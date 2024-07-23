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
    Node as PanelNode,
    Item as PanelItem,
    FormField,
    FormValues,
} from "@wso2-enterprise/ballerina-side-panel";
import styled from "@emotion/styled";
import { Diagram } from "@wso2-enterprise/eggplant-diagram";
import {
    EggplantAvailableNodesRequest,
    Flow,
    Node,
    Category,
    AvailableNode,
    NodeProperties,
    NodePropertyKey,
} from "@wso2-enterprise/ballerina-core";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

enum SidePanelView {
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
        selectedNodeRef.current = undefined
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
                setCategories(
                    convertEggplantCategoriesToSidePanelCategories(response.categories as Category[])
                );
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
                id: "0",
                branches: [],
                fixed: false,
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

function convertNodePropertiesToFormFields(nodeProperties: NodeProperties): FormField[] {
    const formFields: FormField[] = [];

    for (const key in nodeProperties) {
        if (nodeProperties.hasOwnProperty(key)) {
            const expression = nodeProperties[key as NodePropertyKey];
            if (expression) {
                const formField: FormField = {
                    key,
                    label: expression.label,
                    type: expression.type,
                    optional: expression.optional,
                    editable: expression.editable,
                    documentation: expression.documentation,
                    value: expression.value,
                };
                formFields.push(formField);
            }
        }
    }

    return formFields;
}

function updateNodeProperties(values: FormValues, nodeProperties: NodeProperties): NodeProperties {
    const updatedNodeProperties: NodeProperties = { ...nodeProperties };

    for (const key in values) {
        if (values.hasOwnProperty(key) && updatedNodeProperties.hasOwnProperty(key)) {
            const expression = updatedNodeProperties[key as NodePropertyKey];
            if (expression) {
                expression.value = values[key];
            }
        }
    }

    return updatedNodeProperties;
}

function getContainerTitle(view: SidePanelView): string {
    switch (view) {
        case SidePanelView.NODE_LIST:
            return "Add Node";
        case SidePanelView.FORM:
            return "Node Properties";
        default:
            return "";
    }
}
