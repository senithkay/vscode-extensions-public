/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: no-implicit-dependencies jsx-no-multiline-js jsx-wrap-multiline
import React, { useEffect, useState } from "react";

import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DagreEngine, DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";

import { createGraphqlDiagramEngine } from "../utils/engine-util";

import { CanvasWidgetContainer } from "./CanvasWidgetContainer";
import { ContainerController } from "./ContainerController";

interface DiagramCanvasProps {
    model: DiagramModel;
}

const dagreEngine = new DagreEngine({
    graph: {
        rankdir: 'LR',
        ranksep: 175,
        edgesep: 20,
        nodesep: 60,
        ranker: 'longest-path',
        marginx: 40,
        marginy: 40
    }
});

export function GraphqlDiagramCanvasWidget(props: DiagramCanvasProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(createGraphqlDiagramEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);

    useEffect(() => {
        diagramEngine.setModel(model);
        setDiagramModel(model);
        autoDistribute();

    }, [model]);

    const zoomToFit = () => {
        diagramEngine.zoomToFitNodes({ maxZoom: 1 });
    };

    const onZoom = (zoomIn: boolean) => {
        const delta: number = zoomIn ? +5 : -5;
        diagramEngine.getModel().setZoomLevel(diagramEngine.getModel().getZoomLevel() + delta);
        diagramEngine.repaintCanvas();
    };

    const autoDistribute = () => {
        setTimeout(() => {
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.repaintCanvas();
            zoomToFit();
        }, 30);
    };

    return (
        <>
            {diagramModel && diagramEngine && diagramEngine.getModel() &&
            <CanvasWidgetContainer>
                <CanvasWidget engine={diagramEngine}/>
                <ContainerController onZoom={onZoom} zoomToFit={zoomToFit}/>
            </CanvasWidgetContainer>
            }
        </>
    );
}
