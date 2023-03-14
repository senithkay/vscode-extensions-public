/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import createEngine, { DiagramEngine } from "@projectstorm/react-diagrams";

import { GraphqlDefaultLinkFactory } from "../Link/DefaultLink/GraphqlDefaultLinkFactory";
import { GraphqlServiceLinkFactory } from "../Link/GraphqlServiceLink/GraphqlServiceLinkFactory";
import { EnumNodeFactory } from "../Nodes/EnumNode/EnumNodeFactory";
import { GraphqlServiceNodeFactory } from "../Nodes/GraphqlServiceNode/GraphqlServiceNodeFactory";
import { HierarchicalNodeFactory } from "../Nodes/HierarchicalResourceNode/HierarchicalNodeFactory";
import { InterfaceNodeFactory } from "../Nodes/InterfaceNode/InterfaceNodeFactory";
import { RecordNodeFactory } from "../Nodes/RecordNode/RecordNodeFactory";
import { ServiceClassNodeFactory } from "../Nodes/ServiceClassNode/ServiceClassNodeFactory";
import { UnionNodeFactory } from "../Nodes/UnionNode/UnionNodeFactory";
import { GraphqlBasePortFactory } from "../Port/GraphqlBasePortFactory";

export function createGraphqlDiagramEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({
        registerDefaultPanAndZoomCanvasAction: true,
        registerDefaultZoomCanvasAction: false
    });
    diagramEngine.getLinkFactories().registerFactory(new GraphqlServiceLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new GraphqlBasePortFactory());
    diagramEngine.getNodeFactories().registerFactory(new GraphqlServiceNodeFactory());
    diagramEngine.getLinkFactories().registerFactory(new GraphqlDefaultLinkFactory());

    diagramEngine.getNodeFactories().registerFactory(new EnumNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new RecordNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new ServiceClassNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new UnionNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new InterfaceNodeFactory());
    diagramEngine.getNodeFactories().registerFactory(new HierarchicalNodeFactory());
    return diagramEngine;
}
