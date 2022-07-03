import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import React, { useEffect, useState } from "react";
import { DataMapperPortModel } from "./../model/DataMapperPortModel";
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';

export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: DataMapperPortModel;
}

export const DataMapperPortWidget: React.FC<DataMapperPortWidgetProps> = (props: DataMapperPortWidgetProps) =>  {
	const { engine, port } = props;
	const [ active, setActive ] = useState(false);

	useEffect(() => {
		port.registerListener({
			eventDidFire(event) {
				if (event.function === "mappingStartedFrom" || event.function === "mappingFinishedTo") {
					setActive(true);
				}
			},
		})
	}, []);


	return <PortWidget
		port={port}
		engine={engine}
	>
		{active ? <RadioButtonCheckedIcon/> : <RadioButtonUncheckedIcon/>}
	</PortWidget>
}