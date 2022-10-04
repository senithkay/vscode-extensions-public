import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";

import { DataMapperLinkModel } from "../../Link"
import { IntermediatePortModel } from "../IntermediatePort";
import { RecordFieldPortModel } from "../model/RecordFieldPortModel";

export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: IntermediatePortModel | RecordFieldPortModel;
	disable?: boolean;
}

enum PortState {
	PortSelected,
	LinkSelected,
	Unselected
}

export const DataMapperPortWidget: React.FC<DataMapperPortWidgetProps> = (props: DataMapperPortWidgetProps) =>  {
	const { engine, port, disable } = props;
	const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);

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
						setPortState(PortState.PortSelected);
					} else if (event.function === "link-selected") {
						setPortState(PortState.LinkSelected);
					} else if (event.function === "link-unselected") {
						setPortState(PortState.Unselected);
					}
				},
			})
	}, []);

	const containerProps = {
		hasError,
		hasLinks,
		active: portState === PortState.PortSelected,
		disable
	};

	return !disable ? (
		<PortWidget
			port={port}
			engine={engine}
		>
			<ActivePortContainer {...containerProps}>
				{hasLinks || portState === PortState.PortSelected ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon/>}
			</ActivePortContainer>
		</PortWidget>
	) : (
		<DisabledPortContainer>
			<RadioButtonUncheckedIcon/>
		</DisabledPortContainer>
	);
}

interface PortsContainerProps {
	active: boolean;
	hasLinks: boolean;
	hasError: boolean;
}

const ActivePortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: "pointer",
	display: "inline",
	color: (props.active ? "rgb(0, 192, 255)" : props.hasLinks ? (props.hasError ? '#FE523C' : "#5567D5") : "#8D91A3"),
	"&:hover": {
		color: "rgb(0, 192, 255)"
	}
}));

const DisabledPortContainer = styled.div`
	cursor: not-allowed;
	color: #b7bcd3
`;

