import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { UnionIcon } from "../../../resources/assets/icons/UnionIcon";
import { HeaderName, NodeHeader } from "../../../resources/styles/styles";
import { UnionNodeModel } from "../UnionNodeModel";

interface UnionNodeHeadWidgetProps {
    engine: DiagramEngine;
    node: UnionNodeModel;
}

export function UnionNodeHeadWidget(props: UnionNodeHeadWidgetProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.unionObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])



    return (
        <NodeHeader>
            <UnionIcon/>
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
