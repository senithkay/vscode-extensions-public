import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import React, { useEffect, useState } from "react";
import { DataMapperPortModel } from "./../model/DataMapperPortModel";
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';

import Brightness1 from '@material-ui/icons/Brightness1';
import { IntermediatePortModel } from "../IntermediatePort";

export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: DataMapperPortModel|IntermediatePortModel;
}

export const DataMapperPortWidget: React.FC<DataMapperPortWidgetProps> = (props: DataMapperPortWidgetProps) =>  {
	const { engine, port } = props;
	const [ active, setActive ] = useState(false);

	const hasLinks = Object.entries(port.links).length > 0;
	useEffect(() => {
		port.registerListener({
			eventDidFire(event) {
				if (event.function === "mappingStartedFrom" || event.function === "mappingFinishedTo") {
					setActive(true);
				} else if (event.function === "link-selected") {
					setActive(true);
				} else if (event.function === "link-unselected") {
					setActive(false);
				}
			},
		})
	}, []);


	return <PortWidget
		port={port}
		engine={engine}
		style={{
			display: "inline",
			color: active ? "rgb(0, 192, 255)" : (hasLinks ? "#5567D5" : "#8D91A3")
		}}
	>
		{active ? <RadioButtonCheckedIcon/> : (hasLinks ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon/>)}
	</PortWidget>
}