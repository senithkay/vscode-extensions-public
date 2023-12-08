/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { DefaultNodeFactory, DefaultPortFactory, DefaultLabelFactory, DefaultLinkFactory, DefaultNodeModel } from "../components/default";
import { OverlayLayerFactory, OverlayLayerModel } from "../components/overlay";
import { Colors } from "../resources";

export function generateEngine(): DiagramEngine {
    const engine = createEngine();
    // register default factories
    engine.getNodeFactories().registerFactory(new DefaultNodeFactory());
    engine.getPortFactories().registerFactory(new DefaultPortFactory());
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
    engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());

    return engine;
}

export function removeOverlay(diagramEngine: DiagramEngine) {
    // center diagram
    if (diagramEngine.getCanvas().getBoundingClientRect) {
        diagramEngine.zoomToFitNodes({ margin: 40, maxZoom: 1 });
    }
    // remove preloader overlay layer
    const overlayLayer = diagramEngine
        .getModel()
        .getLayers()
        .find((layer) => layer instanceof OverlayLayerModel);
    if (overlayLayer) {
        diagramEngine.getModel().removeLayer(overlayLayer);
    }
    diagramEngine.repaintCanvas();
}
