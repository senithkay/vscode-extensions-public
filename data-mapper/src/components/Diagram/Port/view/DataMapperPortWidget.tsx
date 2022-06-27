import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import React, { useEffect } from "react";
import { DataMapperPortModel } from "./../model/DataMapperPortModel";
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';


export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: DataMapperPortModel;
}

export const DataMapperPortWidget: React.FC<DataMapperPortWidgetProps> = (props: DataMapperPortWidgetProps) =>  {
	const { engine, port } = props;
	return <PortWidget
		port={port}
		engine={engine}
	>
		<RadioButtonUncheckedIcon />
	</PortWidget>
}