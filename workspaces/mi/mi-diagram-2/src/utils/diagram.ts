/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import createEngine, { DiagramEngine } from "@projectstorm/react-diagrams";
import { MediatorNodeFactory } from "../components/nodes/MediatorNode/MediatorNodeFactory";
import { NodeLinkFactory } from "../components/NodeLink/NodeLinkFactory";
import { NodePortFactory } from "../components/NodePort/NodePortFactory";
import { StartNodeFactory } from "../components/nodes/StartNode/StartNodeFactory";
import { EndNodeFactory } from "../components/nodes/EndNode/EndNodeFactory";
import { NodeLinkModel, NodeLinkModelOptions } from "../components/NodeLink/NodeLinkModel";
import { NodePortModel } from "../components/NodePort/NodePortModel";
import { ConditionNodeFactory } from "../components/nodes/ConditionNode/ConditionNodeFactory";
import { CallNodeFactory } from "../components/nodes/CallNode/CallNodeFactory";
import { EmptyNodeFactory } from "../components/nodes/EmptyNode/EmptyNodeFactory";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";
import { ConditionNodeModel } from "../components/nodes/ConditionNode/ConditionNodeModel";
import { EmptyNodeModel } from "../components/nodes/EmptyNode/EmptyNodeModel";
import { MediatorNodeModel } from "../components/nodes/MediatorNode/MediatorNodeModel";
import { EndNodeModel } from "../components/nodes/EndNode/EndNodeModel";
import { OverlayLayerFactory } from "../components/OverlayLoader/OverlayLayerFactory";

export function generateEngine(): DiagramEngine {
    const engine = createEngine({
        registerDefaultDeleteItemsAction: false,
    });

    engine.getPortFactories().registerFactory(new NodePortFactory());
    engine.getLinkFactories().registerFactory(new NodeLinkFactory());
    engine.getNodeFactories().registerFactory(new MediatorNodeFactory());
    engine.getNodeFactories().registerFactory(new StartNodeFactory());
    engine.getNodeFactories().registerFactory(new EndNodeFactory());
    engine.getNodeFactories().registerFactory(new ConditionNodeFactory());
    engine.getNodeFactories().registerFactory(new CallNodeFactory());
    engine.getNodeFactories().registerFactory(new EmptyNodeFactory());
    engine.getLayerFactories().registerFactory(new OverlayLayerFactory());
    return engine;
}

// create link between ports
export function createPortsLink(sourcePort: NodePortModel, targetPort: NodePortModel, options?: NodeLinkModelOptions) {
    const link = new NodeLinkModel(options);
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

// create link between nodes
export type AllNodeModel = StartNodeModel| EndNodeModel | MediatorNodeModel | ConditionNodeModel | CallNodeModel | EmptyNodeModel;
export type SourceNodeModel = Exclude<AllNodeModel, EndNodeModel>;
export type TargetNodeModel = Exclude<AllNodeModel, StartNodeModel>;
export function createNodesLink(sourceNode: SourceNodeModel, targetNode: TargetNodeModel, options?: NodeLinkModelOptions) {
    const sourcePort = sourceNode.getOutPort();
    const targetPort = targetNode.getInPort();
    const link = createPortsLink(sourcePort, targetPort, options);
    link.setSourceNode(sourceNode);
    link.setTargetNode(targetNode);
    return link;
}
