import createEngine, { DiagramEngine } from "@projectstorm/react-diagrams";

import { GraphqlServiceLinkFactory } from "../Link/GraphqlServiceLink/GraphqlServiceLinkFactory";
import { GraphqlServiceNodeFactory } from "../Nodes/GraphqlServiceNode/GraphqlServiceNodeFactory";
import { GRAPHQL_SERVICE_NODE } from "../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { GraphqlBasePortFactory } from "../Port/GraphqlBasePortFactory";

export function createGraphqlDiagramEngine(): DiagramEngine {
    const diagramEngine: DiagramEngine = createEngine({registerDefaultPanAndZoomCanvasAction: true,
                                                       registerDefaultZoomCanvasAction: false});
    diagramEngine.getLinkFactories().registerFactory(new GraphqlServiceLinkFactory());
    diagramEngine.getPortFactories().registerFactory(new GraphqlBasePortFactory(GRAPHQL_SERVICE_NODE));
    diagramEngine.getNodeFactories().registerFactory(new GraphqlServiceNodeFactory());
    return diagramEngine;
}
