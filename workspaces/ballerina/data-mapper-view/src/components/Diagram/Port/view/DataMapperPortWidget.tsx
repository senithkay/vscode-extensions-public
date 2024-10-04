import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";

import { DataMapperLinkModel } from "../../Link"
import { IntermediatePortModel } from "../IntermediatePort";
import { RecordFieldPortModel } from "../model/RecordFieldPortModel";
import { RadioButtonChecked, RadioButtonUnchecked } from "./DataMapperPortRadioButton";

export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: IntermediatePortModel | RecordFieldPortModel;
	disable?: boolean;
	dataTestId?: string;
	handlePortState?: (portState: PortState) => void ;
}

export enum PortState {
	PortSelected,
	LinkSelected,
	Unselected
}

export const DataMapperPortWidget: React.FC<DataMapperPortWidgetProps> = (props: DataMapperPortWidgetProps) =>  {
	const { engine, port, disable, dataTestId, handlePortState } = props;
	const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
	const [ disableNewLinking, setDisableNewLinking] = useState<boolean>(false);

	const isDisabled = disable || (port instanceof RecordFieldPortModel && port.isDisabled());
	const hasLinks = Object.entries(port.links).length > 0;
	const isPortSelected = portState === PortState.PortSelected;

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
						if (handlePortState) {
							handlePortState(PortState.PortSelected);
						}
					} else if (event.function === "link-selected") {
						setPortState(PortState.LinkSelected);
						if (handlePortState) {
							handlePortState(PortState.LinkSelected);
						}
					} else if (event.function === "link-unselected"
						|| event.function === "mappingStartedFromSelectedAgain") {
						setPortState(PortState.Unselected);
						if (handlePortState) {
							handlePortState(PortState.Unselected);
						}
					}
				},
			})
	}, []);

	useEffect(() => {
		port.registerListener({
			eventDidFire(event) {
				if (event.function === "disableNewLinking") {
					setDisableNewLinking(true);
				} else if (event.function === "enableNewLinking") {
					setDisableNewLinking(false);
				}
			},
		})
	}, []);

	let portColor = defaultPortColor;
	if (isPortSelected) {
		portColor = portActiveColor;
	} else if (hasLinks) {
		portColor = hasError ? errorPortColor : portActiveColor;
	}

	const containerProps = {
		active: portState === PortState.PortSelected,
		'data-testid': dataTestId,
		color: portColor
	};

	if (isDisabled) {
		return <RadioButtonUnchecked disabled={isDisabled} data-testid={dataTestId}/>;
	} else if (disableNewLinking) {
		return (
			<PortWidget
				port={port}
				engine={engine}
			>
				<DisabledNewLinkingPortContainer {...containerProps}>
					{hasLinks ? <RadioButtonChecked /> : <RadioButtonUnchecked /> }
				</DisabledNewLinkingPortContainer>
			</PortWidget>
		);
	}

	const isChecked = hasLinks || isPortSelected;

	return (
		<PortWidget
			port={port}
			engine={engine}
		>
			<ActivePortContainer {...containerProps}>
				{isChecked ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
			</ActivePortContainer>
		</PortWidget>
	);
}

interface PortsContainerProps {
	active: boolean;
	color: string;
}

const defaultPortColor = "var(--vscode-foreground)";
const errorPortColor = "var(--vscode-errorForeground)";
const portActiveColor = "var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-editorLink-activeForeground, var(--vscode-list-focusOutline))))";

const ActivePortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: "pointer",
	display: "flex",
	strokeOpacity: props.active ? 0.1 : 0,
	color: props.color,
	"&:hover": {
		color: portActiveColor
	}
}));

const DisabledNewLinkingPortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: "not-allowed",
	display: "flex",
	color: props.color,
}));
