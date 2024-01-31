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
import { NodeLinkModel } from "../components/NodeLink/NodeLinkModel";
import { NodePortModel } from "../components/NodePort/NodePortModel";
import { ConditionNodeFactory } from "../components/nodes/ConditionNode/ConditionNodeFactory";
import { EndpointNodeFactory } from "../components/nodes/EndpointNode/EndpointNodeFactory";

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
    engine.getNodeFactories().registerFactory(new EndpointNodeFactory());
    return engine;
}

export function createLink(sourcePort: NodePortModel, targetPort: NodePortModel) {
    const link = new NodeLinkModel();
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}
