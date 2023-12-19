/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { DiagramEngine, DiagramModel, LinkModel } from "@projectstorm/react-diagrams";
import { debounce } from 'lodash';
import { BodyWidget } from "./components/layout/BodyWidget";
import { Flow } from "./types";
import {
    generateDiagramModelFromFlowModel,
    generateEngine,
    removeOverlay,
    generateFlowModelFromDiagramModel,
    addNodeSelectChangeListener,
    addNodePositionChangeListener,
} from "./utils";
import { OverlayLayerModel } from "./components/overlay";
import { DefaultNodeModel } from "./components/default";

interface EggplantAppProps {
    flowModel: Flow;
    onModelChange: (flowModel: Flow) => void;
}

export function EggplantApp(props: EggplantAppProps) {
    const { flowModel, onModelChange } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);
    const [selectedNode, setSelectedNode] = useState<DefaultNodeModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            drawDiagram();
        }
    }, [diagramEngine, flowModel]);

    const debouncedOnModelChange = debounce(onModelChange, 300);

    const drawDiagram = () => {
        const model = new DiagramModel();
        model.addLayer(new OverlayLayerModel());

        generateDiagramModelFromFlowModel(model, flowModel);

        diagramEngine.setModel(model);
        // TODO: deregister listeners
        diagramEngine.getModel().registerListener({
            linksUpdated: (event: any) => {
                (event.link as LinkModel).registerListener({
                    targetPortChanged(event: any) {
                        const portUpdatedModel: Flow = generateFlowModelFromDiagramModel(flowModel, diagramEngine.getModel());
                        onModelChange(portUpdatedModel);
                    },
                });
            },
        });

        diagramEngine
            .getModel()
            .getNodes()
            .forEach((node) => {
                addNodeSelectChangeListener(node as DefaultNodeModel, setSelectedNode);
                addNodePositionChangeListener(node as DefaultNodeModel, () => {
                    const portUpdatedModel: Flow = generateFlowModelFromDiagramModel(flowModel, diagramEngine.getModel());
                    debouncedOnModelChange(portUpdatedModel);
                });
            });

        setDiagramModel(model);

        // setTimeout(() => {
        //     removeOverlay(diagramEngine);
        // }, 10);
        removeOverlay(diagramEngine);
    };

    return (
        <>
            {diagramEngine && diagramModel && (
                <BodyWidget
                    engine={diagramEngine}
                    flowModel={flowModel}
                    onModelChange={onModelChange}
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                />
            )}
        </>
    );
}

export default EggplantApp;
