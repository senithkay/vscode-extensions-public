import React, { CSSProperties } from "react";

import { DiagramEngine, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "./GraphqlNodeBasePort";
import {
    inclusionPortStyles,
    sidePortStyles
} from "./styles";

interface CustomPortProps {
    port: GraphqlNodeBasePort;
    engine: DiagramEngine;
}

export function GraphqlBasePortWidget(props: CustomPortProps) {
    const { port, engine } = props;
    const portStyles: CSSProperties = port.getOptions().alignment === PortModelAlignment.LEFT ?
        { left: 0, ...sidePortStyles } : port.getOptions().alignment === PortModelAlignment.RIGHT ?
            { right: 0, ...sidePortStyles } : port.getOptions().alignment === PortModelAlignment.TOP ?
                { top: 0, ...inclusionPortStyles } : { bottom: 0, ...inclusionPortStyles };

    return (
        <PortWidget
            engine={engine}
            port={port}
            style={portStyles}
        />
    )
}
