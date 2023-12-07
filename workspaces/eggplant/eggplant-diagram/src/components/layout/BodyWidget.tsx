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
import { App } from "../../App";
import { TrayItemWidget } from "./TrayItemWidget";
import { DefaultNodeModel } from "../default";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DiagramCanvasWidget } from "./DiagramCanvasWidget";
import styled from "@emotion/styled";
import { Colors, EVENT_TYPES, NODE_TYPE } from "../../resources";

export interface BodyWidgetProps {
    app: App;
}

namespace S {
    export const Body = styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
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
    const { app } = props;

    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            var data = JSON.parse(event.dataTransfer.getData(EVENT_TYPES.ADD_NODE));
            var nodesCount = _.keys(app.getDiagramEngine().getModel().getNodes()).length;

            var node: DefaultNodeModel = null;
            switch (data.type) {
                case NODE_TYPE.START:
                    node = new DefaultNodeModel("Start " + (nodesCount + 1), Colors.PRIMARY_CONTAINER);
                    node.addOutPort("Out");
                    break;
                case NODE_TYPE.END:
                    node = new DefaultNodeModel("Return " + (nodesCount + 1), Colors.PRIMARY_CONTAINER);
                    node.addInPort("In");
                    break;
                case NODE_TYPE.CONDITION:
                    node = new DefaultNodeModel("Switch " + (nodesCount + 1), Colors.PRIMARY_CONTAINER);
                    node.addInPort("In");
                    node.addOutPort("OutCase1");
                    node.addOutPort("OutCase2");
                    break;
                default:
                    node = new DefaultNodeModel("Function " + (nodesCount + 1), Colors.PRIMARY_CONTAINER);
                    node.addInPort("In");
                    node.addOutPort("Out");
            }
            var point = app.getDiagramEngine().getRelativeMousePoint(event);
            node.setPosition(point);
            app.getDiagramEngine().getModel().addNode(node);
            forceUpdate(); // TODO: trigger code mutation
        },
        [app]
    );

    return (
        <S.Body>
            <S.Content>
                <TrayWidget>
                    <TrayItemWidget model={{ type: NODE_TYPE.START }} name="Start" />
                    <TrayItemWidget model={{ type: NODE_TYPE.END }} name="Return" />
                    <TrayItemWidget model={{ type: NODE_TYPE.CONDITION }} name="Switch" />
                    <TrayItemWidget model={{ type: NODE_TYPE.FUNCTION }} name="Function" />
                </TrayWidget>
                <S.Layer
                    onDrop={handleDrop}
                    onDragOver={(event) => {
                        event.preventDefault();
                    }}
                >
                    <DiagramCanvasWidget>
                        <CanvasWidget engine={app.getDiagramEngine()} />
                    </DiagramCanvasWidget>
                </S.Layer>
            </S.Content>
        </S.Body>
    );
}
