/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DagreEngine, DiagramEngine, DiagramModel, LinkModel } from "@projectstorm/react-diagrams";
import { DefaultNodeFactory, DefaultPortFactory, DefaultLabelFactory, DefaultLinkFactory, DefaultNodeModel, DefaultLinkModel } from "../components/default";
import { OverlayLayerFactory, OverlayLayerModel } from "../components/overlay";
import { DeleteItemsAction } from "@projectstorm/react-canvas-core";
import { action } from "@storybook/addon-actions";
import { Flow } from "@wso2-enterprise/eggplant-core";
import { generateFlowModelFromDiagramModel } from "./generator";
import { DefaultState } from "../states/DefaultState";

export function generateEngine(): DiagramEngine {
    const engine = createEngine(
        { registerDefaultDeleteItemsAction: false }
    );
    // register default factories
    engine.getNodeFactories().registerFactory(new DefaultNodeFactory());
    engine.getPortFactories().registerFactory(new DefaultPortFactory());
    engine.getLinkFactories().registerFactory(new DefaultLinkFactory());
    engine.getLabelFactories().registerFactory(new DefaultLabelFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());

    // register an DeleteItemsAction with only ctrl + d as keyCodes
    engine.getActionEventBus().registerAction(new DeleteItemsAction({ keyCodes: [68], modifiers: { ctrlKey: true } }));

    // register custom state
    engine.getStateMachine().pushState(new DefaultState());

    return engine;
}

export function getDagreEngine() {
    const engine = new DagreEngine({
        graph: {
            rankdir: 'LR',
            ranksep: 160,
            edgesep: 80,
            nodesep: 40,
            ranker: 'tight-tree',
        },
    });
    return engine;
}

export function removeOverlay(diagramEngine: DiagramEngine) {
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

// register diagram listener
export function addDiagramListener(diagramEngine: DiagramEngine,
    flowModel: Flow,
    onModelChange: (flowModel: Flow) => void,
    setSelectedNode: (node: DefaultNodeModel | null) => void,
    setSelectedLink: (node: DefaultLinkModel | null) => void,
) {
    // register node listeners
    diagramEngine
        .getModel()
        .getNodes()
        .forEach((node) => {
            node.registerListener({
                // eventDidFire: action('node eventDidFire'),
                positionChanged: (event: any) => {
                    action("node positionChanged")(event);
                    genFlowModelAndCallback(diagramEngine.getModel(), flowModel, onModelChange);
                    setSelectedNode(null);
                },
                entityRemoved: (event: any) => {
                    action("node entityRemoved")(event);
                    genFlowModelAndCallback(diagramEngine.getModel(), flowModel, onModelChange);
                    setSelectedNode(null);
                },
                selectionChanged: (event: any) => {
                    action("node selectionChanged")(event);
                    if (event.isSelected) {
                        setSelectedNode(event.entity as DefaultNodeModel);
                        setSelectedLink(null);
                    } else {
                        setSelectedNode(null);
                    }
                }
            });
        });

    // register link listeners
    diagramEngine
        .getModel()
        .getLinks()
        .forEach((link) => {
            link.registerListener({
                // eventDidFire: action("link eventDidFire"),
                entityRemoved: (event: any) => {
                    action("link entityRemoved")(event);
                    genFlowModelAndCallback(diagramEngine.getModel(), flowModel, onModelChange);
                },
                selectionChanged: (event: any) => {
                    action("link selectionChanged")(event);
                    if (event.isSelected) {
                        setSelectedLink(event.entity as DefaultLinkModel);
                        setSelectedNode(null);
                    } else {
                        setSelectedLink(null);
                    }
                }
            });
        });

    // register add link listener
    diagramEngine.getModel().registerListener({
        linksUpdated: (event: any) => {
            action("link linksUpdated")(event);
            (event.link as LinkModel).registerListener({
                targetPortChanged(event: any) {
                    action("link targetPortChanged")(event);
                    genFlowModelAndCallback(diagramEngine.getModel(), flowModel, onModelChange);
                },
            });
        },
    });
}

// generate flow model and send to callback
export function genFlowModelAndCallback(
    diagramModel: DiagramModel,
    flowModel: Flow,
    onModelChange: (flowModel: Flow) => void
) {
    const newFlowModel: Flow = generateFlowModelFromDiagramModel(
        flowModel,
        diagramModel
    );
    onModelChange(newFlowModel);
}
