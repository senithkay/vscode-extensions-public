import { DiagramEngine, PortModelAlignment, PortWidget } from "@projectstorm/react-diagrams";
import { WorkerPortModel } from "./WorkerPortModel";
import React, { CSSProperties } from "react";

interface CustomPortProps {
    port: WorkerPortModel;
    engine: DiagramEngine;
}

export const sidePortStyles: CSSProperties = {
    height: '10px',
    position: 'relative',
    width: '10px',
    backgroundColor: 'blue'
}

export const inclusionPortStyles: CSSProperties = {
    height: '2px',
    position: 'absolute',
    width: '2px'
}


export function WorkerPortWidget(props: CustomPortProps) {
    const { port, engine } = props;
    // const portStyles: CSSProperties = port.getOptions().alignment === PortModelAlignment.LEFT ?
    //     { left: 0, ...sidePortStyles } : port.getOptions().alignment === PortModelAlignment.RIGHT ?
    //         { right: 0, ...sidePortStyles } : port.getOptions().alignment === PortModelAlignment.TOP ?
    //             { top: 0, ...inclusionPortStyles } : { bottom: 0, ...inclusionPortStyles };

    return (
        <PortWidget
            engine={engine}
            port={port}
            style={sidePortStyles}
        />
    )
}