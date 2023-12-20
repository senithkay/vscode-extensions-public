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
import { TrayItemWidget } from "./TrayItemWidget";
import { DefaultNodeModel } from "../default";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DiagramCanvasWidget } from "./DiagramCanvasWidget";
import styled from "@emotion/styled";
import { EVENT_TYPES, NODE_TYPE } from "../../resources";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { generateFlowModelFromDiagramModel } from "../../utils/generator";
import { Flow } from "../../types";
import { OptionWidget } from "./OptionWidget";
import { getNodeModel, isFixedNode } from "../../utils";
import { DiagramControls } from "../controls/DiagramControls";

export interface BodyWidgetProps {
    engine: DiagramEngine;
    flowModel: Flow;
    selectedNode: DefaultNodeModel | null;
    setSelectedNode: (node: DefaultNodeModel) => void;
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
}

export function BodyWidget(props: BodyWidgetProps) {
    const { engine, flowModel, selectedNode, setSelectedNode, onModelChange } = props;

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            let data = JSON.parse(event.dataTransfer.getData(EVENT_TYPES.ADD_NODE));
            let nodesCount = _.keys(engine.getModel().getNodes()).length;

            let node: DefaultNodeModel = getNodeModel(data.type, (nodesCount++).toString());
            let point = engine.getRelativeMousePoint(event);
            node.setPosition(point);
            engine.getModel().addNode(node);

            const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
            onModelChange(updatedFlow);
            setSelectedNode(null);
        },
        [engine]
    );

    const updateFlowModel = () => {
        const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
        onModelChange(updatedFlow);
    };

    const handleRefreshDiagram = () => {
        // TODO: need to implement refresh flow
        setSelectedNode(null);
    };

    // has start and return node types in flow model
    const hasStartNode = flowModel.nodes.some((node) => node.templateId === NODE_TYPE.START);
    const hasReturnNode = flowModel.nodes.some((node) => node.templateId === NODE_TYPE.RETURN);

    return (
        <S.Body>
            <S.Content>
                <TrayWidget>
                    {!hasStartNode && false && <TrayItemWidget model={{ type: NODE_TYPE.START }} name="Start" />}
                    <TrayItemWidget model={{ type: NODE_TYPE.CODE_BLOCK }} name="Code Block" />
                    <TrayItemWidget model={{ type: NODE_TYPE.SWITCH }} name="Switch" />
                    <TrayItemWidget model={{ type: NODE_TYPE.HTTP_REQUEST }} name="HTTP Request" />
                    <TrayItemWidget model={{ type: NODE_TYPE.TRANSFORM }} name="Transform" />
                    {!hasReturnNode && <TrayItemWidget model={{ type: NODE_TYPE.RETURN }} name="Return" />}
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
                {selectedNode && !isFixedNode(selectedNode?.getKind()) && (
                    <OptionWidget
                        selectedNode={selectedNode}
                        setSelectedNode={setSelectedNode}
                        updateFlowModel={updateFlowModel}
                    />
                )}
            </S.Content>
        </S.Body>
    );
}
