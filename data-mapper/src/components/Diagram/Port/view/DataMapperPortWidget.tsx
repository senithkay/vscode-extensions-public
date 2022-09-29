import React, { useEffect, useState } from "react";

import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";

import { DataMapperLinkModel } from "../../Link"
import { IntermediatePortModel } from "../IntermediatePort";
import { RecordFieldPortModel } from "../model/RecordFieldPortModel";
import styled from "@emotion/styled";

export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: IntermediatePortModel | RecordFieldPortModel;
	disable?: boolean;
}

export const DataMapperPortWidget: React.FC<DataMapperPortWidgetProps> = (props: DataMapperPortWidgetProps) =>  {
	const { engine, port, disable } = props;
	const [ active, setActive ] = useState(false);

	const hasLinks = Object.entries(port.links).length > 0;

	const hasError =
		Object.entries(port.links).some((link) => {
			if (link[1] instanceof DataMapperLinkModel){
				return link[1].hasError();
			}
			return false;
		})

	useEffect(() => {
			port.registerListener({
				eventDidFire(event) {
					if (event.function === "mappingStartedFrom" || event.function === "mappingFinishedTo") {
						// setActive(true);
					} else if (event.function === "link-selected") {
						setActive(true);
					} else if (event.function === "link-unselected") {
						setActive(false);
					}
				},
			})
		
	}, []);

	const containerProps = {
		hasError,
		hasLinks,
		active,
		disable: disable
	};

	return <PortWidget
		port={port}
		engine={engine}
	>
		<PortContainer { ...containerProps }>
			{active && !disable ? <RadioButtonCheckedIcon/> : (hasLinks ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon/>)}
		</PortContainer>
	</PortWidget>
}

interface PortsContainerProps {
	active: boolean;
	hasLinks: boolean;
	hasError: boolean;
	disable: boolean
}

const PortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: props.disable ? "not-allowed" : "pointer",
	display: "inline",
	color: (props.hasLinks ? (props.hasError ? '#FE523C' : "#5567D5") : (props.active ? "rgb(0, 192, 255)" : "#8D91A3")),
	"&:hover": {
		color: !props.disable && "rgb(0, 192, 255)"
	}
}));
