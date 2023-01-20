import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { EnumNodeModel } from "../EnumNodeModel";
import { EnumHead, EnumName } from "../styles";

interface EnumHeadProps {
    engine: DiagramEngine;
    node: EnumNodeModel;
}

export function EnumHeadWidget(props: EnumHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.enumObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])



    return (
        <EnumHead>
            {/*<GraphQLIcon />*/}
            <GraphqlBasePortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
            />
            <EnumName>{displayName}</EnumName>

            <GraphqlBasePortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
            />
            <GraphqlBasePortWidget
                port={node.getPort(`top-${node.getID()}`)}
                engine={engine}
            />
        </EnumHead>
    )
}
