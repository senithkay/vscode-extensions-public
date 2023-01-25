import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";
import { GraphqlServiceNodeModel } from "../../GraphqlServiceNode/GraphqlServiceNodeModel";
import React, { useEffect, useRef } from "react";
import { ServiceHead } from "../../GraphqlServiceNode/styles/styles";
import { GraphQLIcon } from "../../../resources/assets/icons/GraphQL";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { HeaderName, NodeHeader } from "../../../resources/styles/styles";
import { ServiceClassNodeModel } from "../ServiceClassNodeModel";
import { ServiceClassIcon } from "../../../resources/assets/icons/ServiceClassIcon";

interface ServiceClassHeadProps {
    engine: DiagramEngine;
    node: ServiceClassNodeModel;
}

export function ServiceClassHeadWidget(props: ServiceClassHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.classObject.serviceName;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])



    return (
        <NodeHeader>
            <ServiceClassIcon/>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
            />
            <HeaderName>{displayName}</HeaderName>

            <GraphqlBasePortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
            />
            <GraphqlBasePortWidget
                port={node.getPort(`top-${node.getID()}`)}
                engine={engine}
            />
        </NodeHeader>
    )
}
