/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback } from "react";
import * as _ from "lodash";
import { TrayWidget } from "./TrayWidget";
import { TrayItemModel, TrayItemWidget } from "./TrayItemWidget";
import { DefaultNodeModel } from "../default";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DiagramCanvasWidget } from "./DiagramCanvasWidget";
import styled from "@emotion/styled";
import { Colors, EVENT_TYPES } from "../../resources";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { generateFlowModelFromDiagramModel } from "../../utils/generator";
import { Flow } from "../../types";
import { OptionWidget } from "./OptionWidget";
import { getDefaultNodeModel, isSingleNode } from "../../utils";
import { DiagramControls } from "../controls/DiagramControls";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface BodyWidgetProps {
    engine: DiagramEngine;
    flowModel: Flow;
    selectedNode: DefaultNodeModel | null;
    setSelectedNode: (node: DefaultNodeModel) => void;
    openDataMapper: (position: NodePosition) => void;
    onModelChange?: (flowModel: Flow) => void;
}

namespace S {
    export const Body = styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
    `;

    export const Content = styled.div`
        display: flex;
        flex-grow: 1;
    `;

    export const Layer = styled.div`
        position: relative;
        flex-grow: 1;
    `;

    export const Title = styled.h4`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const Divider = styled.div`
        height: 1px;
        width: 100%;
        /* background-color: ${Colors.OUTLINE_VARIANT}; */
        margin: 14px 0;
    `;
}

export function BodyWidget(props: BodyWidgetProps) {
    const { engine, flowModel, selectedNode, setSelectedNode, openDataMapper, onModelChange } = props;

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            let data = JSON.parse(event.dataTransfer.getData(EVENT_TYPES.ADD_NODE)) as TrayItemModel;

            let node: DefaultNodeModel = getDefaultNodeModel(engine.getModel(), data.type, data.endpoint, data.action);
            let point = engine.getRelativeMousePoint(event);
            node.setPosition(point);
            engine.getModel().addNode(node);

            const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
            onModelChange(updatedFlow);
            setSelectedNode(null);
        },
        [engine, flowModel]
    );

    const updateFlowModel = () => {
        const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
        onModelChange(updatedFlow);
    };

    const handleRefreshDiagram = () => {
        // TODO: need to implement refresh flow
        setSelectedNode(null);
    };

    // has return node types in flow model
    const hasReturnNode = flowModel.nodes.some((node) => node.templateId === "HttpResponseNode");

    return (
        <S.Body>
            <S.Content>
                <TrayWidget>
                    <S.Title>Core Components</S.Title>
                    <TrayItemWidget model={{ type: "SwitchNode" }} name="Switch" />
                    <TrayItemWidget model={{ type: "TransformNode" }} name="Transform" />
                    <TrayItemWidget model={{ type: "CodeBlockNode" }} name="Code Block" />
                    <TrayItemWidget model={{ type: "NewPayloadNode" }} name="New Payload" />
                    {/* <TrayItemWidget model={{ type: "HttpRequestNode", action: "get" }} name="GET Request" />
                    <TrayItemWidget model={{ type: "HttpRequestNode", action: "post" }} name="POST Request" /> */}
                    {!hasReturnNode && <TrayItemWidget model={{ type: "HttpResponseNode" }} name="Return" />}

                    {flowModel.endpoints?.length > 0 && (
                        <>
                            <S.Divider />
                            <S.Title>Endpoints</S.Title>
                        </>
                    )}
                    {flowModel.endpoints.map((endpoint, index) => {
                        return (
                            <>
                                <TrayItemWidget
                                    key={index + "get"}
                                    model={{ type: "HttpRequestNode", endpoint: endpoint, action: "get" }}
                                    name={endpoint.name + " GET"}
                                />
                                <TrayItemWidget
                                    key={index + "post"}
                                    model={{ type: "HttpRequestNode", endpoint: endpoint, action: "post" }}
                                    name={endpoint.name + " POST"}
                                />
                            </>
                        );
                    })}
                </TrayWidget>
                <S.Layer
                    onDrop={handleDrop}
                    onDragOver={(event) => {
                        event.preventDefault();
                    }}
                >
                    <DiagramCanvasWidget>
                        <CanvasWidget engine={engine} />
                    </DiagramCanvasWidget>
                    <DiagramControls engine={engine} refresh={handleRefreshDiagram} />
                </S.Layer>
                {selectedNode && !isSingleNode(selectedNode?.getKind()) && (
                    <OptionWidget
                        engine={engine}
                        flowModel={flowModel}
                        selectedNode={selectedNode}
                        setSelectedNode={setSelectedNode}
                        openDataMapper={openDataMapper}
                        updateFlowModel={updateFlowModel}
                    />
                )}
            </S.Content>
        </S.Body>
    );
}
