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
import {
    EggplantAvailableNodesRequest,
    Flow,
    FlowNode,
    Branch,
    Category,
    AvailableNode,
    LineRange,
} from "@wso2-enterprise/ballerina-core";
import {
    convertEggplantCategoriesToSidePanelCategories,
    convertNodePropertiesToFormFields,
    getContainerTitle,
    getFormProperties,
    updateNodeProperties,
} from "./../../utils/eggplant";
import { STNode } from "@wso2-enterprise/syntax-tree";

const Container = styled.div`
    width: 100%;
    height: calc(100vh - 50px);
`;

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    FORM = "FORM",
}

export interface EggplantDiagramProps {
    syntaxTree: STNode; // INFO: this is used to make the diagram rerender when code changes
}

export function EggplantDiagram(param: EggplantDiagramProps) {
    const { rpcClient } = useVisualizerContext();

    const [model, setModel] = useState<Flow>();
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [sidePanelView, setSidePanelView] = useState<SidePanelView>(SidePanelView.NODE_LIST);
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [fields, setFields] = useState<FormField[]>([]);
    const selectedNodeRef = useRef<FlowNode>();
    const topNodeRef = useRef<FlowNode | Branch>();
    const targetRef = useRef<LineRange>();

    useEffect(() => {
        getSequenceModel();
    }, [param.syntaxTree]);

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

    const handleOnAddNode = (parent: FlowNode | Branch, target: LineRange) => {
        console.log(">>> opening panel...", { parent, target });
        setShowSidePanel(true);
        setSidePanelView(SidePanelView.NODE_LIST);
        topNodeRef.current = parent;
        targetRef.current = target;
        const getNodeRequest: EggplantAvailableNodesRequest = {
            parentNodeLineRange: {
                startLine: parent.codedata.lineRange.startLine,
                endLine: parent.codedata.lineRange.endLine,
            },
            parentNodeKind: parent.codedata.node,
            branchLabel: "label" in parent ? parent.label : undefined,
        };
        console.log(">>> get available node request", getNodeRequest);
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
            .getNodeTemplate({ id: node.codedata })
            .then((response) => {
                console.log(">>> FlowNode template", response);
                selectedNodeRef.current = response.flowNode;
                const formProperties = getFormProperties(response.flowNode);
                setFields(convertNodePropertiesToFormFields(formProperties, model.connections));
            });
    };

    const handleOnFormSubmit = (data: FormValues) => {
        console.log(">>> on form submit", data);
        if (selectedNodeRef.current && topNodeRef.current) {
            let updatedNode: FlowNode = {
                ...selectedNodeRef.current,
                codedata: {
                    ...selectedNodeRef.current.codedata,
                    lineRange: {
                        ...selectedNodeRef.current.codedata.lineRange,
                        startLine: targetRef.current.startLine,
                        endLine: targetRef.current.endLine,
                    },
                },
            };

            if (selectedNodeRef.current.branches?.at(0)?.properties) {
                // branch properties
                // TODO: Handle multiple branches
                const updatedNodeProperties = updateNodeProperties(
                    data,
                    selectedNodeRef.current.branches.at(0).properties
                );
                updatedNode.branches.at(0).properties = updatedNodeProperties;
            } else if (selectedNodeRef.current.properties) {
                // node properties
                const updatedNodeProperties = updateNodeProperties(data, selectedNodeRef.current.properties);
                updatedNode.properties = updatedNodeProperties;
            } else {
                console.error(">>> Error updating source code. No properties found");
            }
            console.log(">>> Updated node", updatedNode);

            rpcClient
                .getEggplantDiagramRpcClient()
                .getSourceCode({ flowNode: updatedNode })
                .then((response) => {
                    console.log(">>> Updated source code", response);
                    if (response.textEdits) {
                        // clear memory
                        setFields([]);
                        selectedNodeRef.current = undefined;
                        handleOnCloseSidePanel();
                    } else {
                        console.error(">>> Error updating source code", response);
                        // handle error
                    }
                });
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
                {sidePanelView === SidePanelView.NODE_LIST && categories?.length > 0 && (
                    <NodeList categories={categories} onSelect={handleOnSelectNode} onClose={handleOnCloseSidePanel} />
                )}
                {sidePanelView === SidePanelView.FORM && <Form formFields={fields} onSubmit={handleOnFormSubmit} />}
            </PanelContainer>
        </>
    );
}
