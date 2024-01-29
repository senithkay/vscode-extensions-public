import * as React from "react";
import { DiagramEngine, DiagramModel, DefaultNodeModel, DiagramWidget } from "@projectstorm/react-diagrams";
import { APIResource, Sequence } from "@wso2-enterprise/mi-syntax-tree/lib/src";

interface DiagramProps {
    model: APIResource | Sequence;
}

export const Diagram: React.FC = () => {
    //1. Create the diagram engine
    var engine = new DiagramEngine();

    // engine.installDefaultFactories();

    //2. Create the diagram model
    var model = new DiagramModel();

    //3. Create a default node
    var node1 = new DefaultNodeModel("Node 1", "rgb(0,192,255)");
    let port = node1.addOutPort("Out");
    node1.setPosition(100, 100);

    //4. Add the node to the diagram model
    model.addAll(node1);

    //5. Load the model into the diagram engine
    engine.setModel(model);

    //6. Render the diagram!
    return <DiagramWidget className="diagram-container" diagramEngine={engine} />;
};
