import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import React from "react";
import { DataMapperPortModel } from "./DataMapperPortModel";
import AdjustIcon from '@material-ui/icons/Adjust';


export interface DataMapperPortWidgetProps {
    engine: DiagramEngine;
    port: DataMapperPortModel;
}

export function DataMapperPortWidget(props: DataMapperPortWidgetProps) {
    const { engine, port } = props;
    return <PortWidget
					port={port}
					engine={engine}
				>
					<AdjustIcon/>
				</PortWidget>
}