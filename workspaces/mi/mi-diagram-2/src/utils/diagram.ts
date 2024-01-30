/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import createEngine, { DagreEngine, DiagramEngine, DiagramModel, LinkModel } from "@projectstorm/react-diagrams";
import { CallNodeFactory } from "../components/nodes/CallNode/CallNodeFactory";
import { NodeLinkFactory } from "../components/NodeLink/NodeLinkFactory";
import { NodePortFactory } from "../components/NodePort/NodePortFactory";


export function generateEngine(): DiagramEngine {
    const engine = createEngine();
    
    engine.getPortFactories().registerFactory(new NodePortFactory());
    engine.getLinkFactories().registerFactory(new NodeLinkFactory());
    engine.getNodeFactories().registerFactory(new CallNodeFactory());
    return engine;
}
