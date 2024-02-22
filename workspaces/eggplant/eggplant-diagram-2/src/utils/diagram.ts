/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import createEngine, { DiagramEngine } from "@projectstorm/react-diagrams";
import { BaseNodeFactory } from "../components/nodes/BaseNode/BaseNodeFactory";
import { NodeLinkFactory } from "../components/NodeLink/NodeLinkFactory";
import { NodePortFactory } from "../components/NodePort/NodePortFactory";
import { NodeLinkModel, NodeLinkModelOptions } from "../components/NodeLink/NodeLinkModel";
import { NodePortModel } from "../components/NodePort/NodePortModel";
import { EmptyNodeFactory } from "../components/nodes/EmptyNode/EmptyNodeFactory";
import { EmptyNodeModel } from "../components/nodes/EmptyNode/EmptyNodeModel";
import { BaseNodeModel } from "../components/nodes/BaseNode/BaseNodeModel";

export function generateEngine(): DiagramEngine {
    const engine = createEngine({
        registerDefaultDeleteItemsAction: false,
        registerDefaultZoomCanvasAction: false,
    });

    engine.getPortFactories().registerFactory(new NodePortFactory());
    engine.getLinkFactories().registerFactory(new NodeLinkFactory());
    engine.getNodeFactories().registerFactory(new BaseNodeFactory());
    engine.getNodeFactories().registerFactory(new EmptyNodeFactory());
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
export type NodeModel = BaseNodeModel | EmptyNodeModel;
export function createNodesLink(sourceNode: NodeModel, targetNode: NodeModel, options?: NodeLinkModelOptions) {
    const sourcePort = sourceNode.getOutPort();
    const targetPort = targetNode.getInPort();
    const link = createPortsLink(sourcePort, targetPort, options);
    link.setSourceNode(sourceNode);
    link.setTargetNode(targetNode);
    return link;
}
