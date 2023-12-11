/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback, useReducer } from "react";
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
import { addNodeListener } from "../../utils";

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

    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            let data = JSON.parse(event.dataTransfer.getData(EVENT_TYPES.ADD_NODE));
            let nodesCount = _.keys(engine.getModel().getNodes()).length;

            let node: DefaultNodeModel = null;
            switch (data.type) {
                case NODE_TYPE.START:
                    node = new DefaultNodeModel({ name: "Start " + (nodesCount + 1), kind: NODE_TYPE.START });
                    node.addOutPort("Out");
                    break;
                case NODE_TYPE.END:
                    node = new DefaultNodeModel({ name: "Return " + (nodesCount + 1), kind: NODE_TYPE.END });
                    node.addInPort("In");
                    break;
                case NODE_TYPE.CODE_BLOCK:
                    node = new DefaultNodeModel({ name: "Code Block " + (nodesCount + 1), kind: NODE_TYPE.CODE_BLOCK });
                    node.addInPort("In");
                    node.addOutPort("Out");
                    break;
                case NODE_TYPE.SWITCH:
                    node = new DefaultNodeModel({ name: "Switch " + (nodesCount + 1), kind: NODE_TYPE.SWITCH });
                    node.addInPort("In");
                    node.addOutPort("OutCase1");
                    node.addOutPort("OutCase2");
                    break;
                default:
                    break;
            }
            let point = engine.getRelativeMousePoint(event);
            node.setPosition(point);
            addNodeListener(node, setSelectedNode);
            engine.getModel().addNode(node);
            // forceUpdate();
            const updatedFlow: Flow = generateFlowModelFromDiagramModel(flowModel, engine.getModel());
            // const updatedFlow: Flow = getUpdatedModel(engine.getModel(), node, flowModel);
            onModelChange(updatedFlow);
        },
        [engine]
    );

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
                {selectedNode && <OptionWidget selectedNode={selectedNode} />}
            </S.Content>
        </S.Body>
    );
}
