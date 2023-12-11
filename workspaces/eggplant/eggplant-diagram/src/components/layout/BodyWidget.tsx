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
import { Flow, Node } from "../../types";
import { OptionWidget } from "./OptionWidget";
import { addNodeSelectChangeListener, getNodeModel } from "../../utils";

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
            addNodeSelectChangeListener(node, setSelectedNode);
            engine.getModel().addNode(node);

            const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
            onModelChange(updatedFlow);
        },
        [engine]
    );

    const updateFlowModel = (node: Node) => {        
        const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
        onModelChange(updatedFlow);
    };

    return (
        <S.Body>
            <S.Content>
                <TrayWidget>
                    <TrayItemWidget model={{ type: NODE_TYPE.START }} name="Start" />
                    <TrayItemWidget model={{ type: NODE_TYPE.CODE_BLOCK }} name="Code Block" />
                    <TrayItemWidget model={{ type: NODE_TYPE.SWITCH }} name="Switch" />
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
                </S.Layer>
                {selectedNode && (
                    <OptionWidget selectedNode={selectedNode} setSelectedNode={setSelectedNode} updateFlowModel={updateFlowModel} />
                )}
            </S.Content>
        </S.Body>
    );
}
