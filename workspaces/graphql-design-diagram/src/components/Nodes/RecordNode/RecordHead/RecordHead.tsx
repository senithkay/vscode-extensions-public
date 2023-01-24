import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { RecordIcon } from "../../../resources/assets/icons/RecordIcon";
import { HeaderName } from "../../../resources/styles/styles";
import { RecordNodeModel } from "../RecordNodeModel";
import { RecordHead } from "../styles";

interface RecordHeadProps {
    engine: DiagramEngine;
    node: RecordNodeModel;
}

export function RecordHeadWidget(props: RecordHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.recordObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])



    return (
        <RecordHead>
            <RecordIcon/>
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
        </RecordHead>
    )
}
