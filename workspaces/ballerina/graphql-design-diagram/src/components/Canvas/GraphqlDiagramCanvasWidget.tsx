/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: no-implicit-dependencies jsx-no-multiline-js jsx-wrap-multiline
import React, { useEffect, useState } from "react";

import { DagreEngine, DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { toJpeg } from 'html-to-image';

import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";
import { GraphqlOverlayLayerModel } from "../OverlayLoader";
import { getComponentName } from "../utils/common-util";
import { createGraphqlDiagramEngine } from "../utils/engine-util";

import { CanvasWidgetContainer } from "./CanvasWidgetContainer";
import { ContainerController } from "./ContainerController";
import { NavigationWrapperCanvasWidget } from "./DiagramNavigationWrapper/NavigationWrapperCanvasWidget";

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
    const { selectedDiagramNode, setSelectedNode } = useGraphQlContext();

    useEffect(() => {
        model.addLayer(new GraphqlOverlayLayerModel());
        diagramEngine.setModel(model);
        setDiagramModel(model);
        autoDistribute();
        setSelectedNode(undefined);

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
            zoomToFit();
            diagramEngine.getModel().removeLayer(diagramEngine.getModel().getLayers().find(layer => layer instanceof GraphqlOverlayLayerModel));
            diagramEngine.setModel(model);
        }, 30);
    };

    const downloadDiagram = () => {
        const canvas: HTMLDivElement = diagramEngine.getCanvas();
        if (!canvas) {
            return;
        }

        toJpeg(canvas, {
            cacheBust: true,
            quality: 0.95,
            width: canvas.scrollWidth,
            height: canvas.scrollHeight,
            backgroundColor: 'white'
        })
            .then((dataUrl: string) => {
                const link = document.createElement('a');
                link.download = 'graphql-diagram.jpeg';
                link.href = dataUrl;
                link.click();
            })
            .catch((err: { message: any; }) => {
                // tslint:disable-next-line:no-console
                console.log(err.message);
            });
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (selectedDiagramNode && event.target === diagramEngine.getCanvas()) {
            setSelectedNode(undefined);
        }
    };

    return (
        <>
            {diagramModel && diagramEngine && diagramEngine.getModel() &&
            <div onClick={handleCanvasClick} data-testid="graphql-canvas-widget">
                <CanvasWidgetContainer>
                    <NavigationWrapperCanvasWidget
                        diagramEngine={diagramEngine}
                        focusedNode={diagramEngine?.getModel()?.getNode(getComponentName(selectedDiagramNode))}
                    />
                    <ContainerController onZoom={onZoom} zoomToFit={zoomToFit} onDownload={downloadDiagram} />
                </CanvasWidgetContainer>
            </div>
            }
        </>
    );
}
