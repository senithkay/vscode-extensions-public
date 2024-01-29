import * as React from "react";
import { DiagramEngine, DiagramModel, DefaultNodeModel, DiagramWidget } from "@projectstorm/react-diagrams";
import { APIResource, Sequence } from "@wso2-enterprise/mi-syntax-tree/src";

interface DiagramProps {
    model: APIResource | Sequence;
}

export const Diagram: React.FC<DiagramProps> = (props: DiagramProps) => {


    //6. Render the diagram!
    return <h1>Diagram: {props.model}</h1>;
};
