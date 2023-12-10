/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { DiagramEngine, DiagramModel, LinkModel, LinkModelGenerics, PortModel } from "@projectstorm/react-diagrams";
import { BodyWidget } from "./components/layout/BodyWidget";
import { Flow } from "./types";
import { generateDiagramModelFromFlowModel, generateEngine, getUpdatedModelForLinks, removeOverlay } from "./utils";
import { OverlayLayerModel } from "./components/overlay";
import { set } from "lodash";
import { BaseEntityEvent, BaseEvent } from "@projectstorm/react-canvas-core";

interface EggplantAppProps {
    flowModel: Flow;
    onModelChange: (flowModel: Flow) => void;
}

export function EggplantApp(props: EggplantAppProps) {
    const { flowModel, onModelChange } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            drawDiagram();
        }
    }, [diagramEngine]);

    const drawDiagram = () => {
        const model = new DiagramModel();
        model.addLayer(new OverlayLayerModel());

        generateDiagramModelFromFlowModel(model, flowModel);


        diagramEngine.setModel(model);

        diagramEngine.getModel().registerListener({
            linksUpdated: (event: any) => {
                (event.link as LinkModel).registerListener({
                    targetPortChanged(event: any) {
                        const newLink: LinkModel = (event.entity as LinkModel);
                        const portUpdatedModel: Flow = getUpdatedModelForLinks(flowModel, newLink);
                        onModelChange(portUpdatedModel);
                    },
                });
            }
        });
        setDiagramModel(model);

        setTimeout(() => {
            removeOverlay(diagramEngine);
        }, 1000);
    };

    return <>{diagramEngine && diagramModel && <BodyWidget engine={diagramEngine} flowModel={flowModel} onModelChange={onModelChange} />}</>;
}

export default EggplantApp;

