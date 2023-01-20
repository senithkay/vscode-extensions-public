import createEngine, { DiagramEngine } from "@projectstorm/react-diagrams";

import { GraphqlServiceLinkFactory } from "../Link/GraphqlServiceLink/GraphqlServiceLinkFactory";
import { EnumNodeFactory } from "../Nodes/EnumNode/EnumNodeFactory";
import { GraphqlServiceNodeFactory } from "../Nodes/GraphqlServiceNode/GraphqlServiceNodeFactory";
import { GraphqlBasePortFactory } from "../Port/GraphqlBasePortFactory";

export function createGraphqlDiagramEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({registerDefaultPanAndZoomCanvasAction: true,
                                                       registerDefaultZoomCanvasAction: false});
    diagramEngine.getLinkFactories().registerFactory(new GraphqlServiceLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new GraphqlBasePortFactory());
    diagramEngine.getNodeFactories().registerFactory(new GraphqlServiceNodeFactory());

    diagramEngine.getNodeFactories().registerFactory(new EnumNodeFactory());
    return diagramEngine;
}
