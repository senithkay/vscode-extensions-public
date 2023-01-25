import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { Interaction } from "../../../resources/model";
import { FieldName, NodeFieldContainer } from "../../../resources/styles/styles";
import { UnionNodeModel } from "../UnionNodeModel";

interface UnionFieldProps {
    engine: DiagramEngine;
    node: UnionNodeModel;
    unionField: Interaction;
}


export function UnionField(props: UnionFieldProps) {
    const { engine, node, unionField } = props;

    const functionPorts = useRef<PortModel[]>([]);

    const field = unionField.componentName;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${field}`));
        functionPorts.current.push(node.getPortFromID(`right-${field}`));
    }, [unionField]);

    return(
        <NodeFieldContainer>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${field}`)}
                engine={engine}
            />
            <FieldName style={{marginLeft: '7px'}}>
                {field}
            </FieldName>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${field}`)}
                engine={engine}
            />
        </NodeFieldContainer>
    );
}
