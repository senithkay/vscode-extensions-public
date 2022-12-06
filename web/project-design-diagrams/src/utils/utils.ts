/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import createEngine, { DiagramEngine } from '@projectstorm/react-diagrams';
import { EntityFactory, EntityLinkFactory, EntityPortFactory } from '../components/entity-relationship';
import { ExtServiceNodeFactory, ServiceLinkFactory, ServiceNodeFactory, ServicePortFactory } from '../components/service-interaction';
import { GatewayNodeFactory } from "../components/gateway/GatewayNode/GatewayNodeFactory";
import { GatewayPortFactory } from "../components/gateway/GatewayPort/GatewayPortFactory";
import { GatewayLinkFactory } from "../components/gateway/GatewayLink/GatewayLinkFactory";
import { GatewayNodeModel } from "../components/gateway/GatewayNode/GatewayNodeModel";

export function createRenderPackageObject(projectPackages: IterableIterator<string>): Map<string, boolean> {
    let packages2render: Map<string, boolean> = new Map<string, boolean>();
    let packages: string[] = Array.from(projectPackages).sort();

    packages.forEach((balPackage) => {
        packages2render.set(balPackage, true);
    })

    return packages2render;
}

export function createServicesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false});
    diagramEngine.getNodeFactories().registerFactory(new GatewayNodeFactory());
    diagramEngine.getPortFactories().registerFactory(new GatewayPortFactory());
    diagramEngine.getLinkFactories().registerFactory(new GatewayLinkFactory());
    diagramEngine.getLinkFactories().registerFactory(new ServiceLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new ServicePortFactory());
    diagramEngine.getNodeFactories().registerFactory(new ServiceNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new ExtServiceNodeFactory());
    return diagramEngine;
}

export function createEntitiesEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false});
    diagramEngine.getLinkFactories().registerFactory(new EntityLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new EntityPortFactory());
    diagramEngine.getNodeFactories().registerFactory(new EntityFactory());
    return diagramEngine;
}

export function positionGatewayNodes(engine: DiagramEngine) {
    const model = engine.getModel();
    const gatewayNodes: GatewayNodeModel[] = <GatewayNodeModel[]>
        (model.getNodes().filter((node) => node instanceof GatewayNodeModel));
    const canvas = engine.getCanvas();
    if (canvas) {
        const midX = canvas.clientWidth / 2;
        const midY = canvas.clientHeight / 2;
        gatewayNodes.forEach((node) => {
            if (node.type === 'NORTH') {
                node.setPosition(midX - 600, midY - 210);
            } else if (node.type === 'SOUTH') {
                node.setPosition(midX - 600, midY);
            } else if (node.type === 'EAST') {
                node.setPosition(canvas.clientWidth - 1200, midY - 275);
            } else if (node.type === 'WEST') {
                node.setPosition(midX - 1200, midY - 275);
            }
        });
    }
}
