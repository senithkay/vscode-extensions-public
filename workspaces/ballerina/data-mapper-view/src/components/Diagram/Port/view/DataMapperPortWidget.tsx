import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";

import { DataMapperLinkModel } from "../../Link"
import { IntermediatePortModel } from "../IntermediatePort";
import { RecordFieldPortModel } from "../model/RecordFieldPortModel";
import { Icon } from "@wso2-enterprise/ui-toolkit";

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

	const containerProps = {
		hasError,
		hasLinks,
		active: portState === PortState.PortSelected,
		disable,
		'data-testid': dataTestId
	};

	const RadioButton = (checked: boolean) => (
		<Icon
			sx={{ height: "18px", width: "18px" }}
			iconSx={{ display: "flex", fontSize: "18px", color: "inherit" }}
			name={checked ? "radio-button-checked" : "radio-button-unchecked"}
		/>
	);

	const RadioButtonChecked = styled(() => RadioButton(true))`
		user-select: none;
		pointer-events: auto;
	`;

	const RadioButtonUnchecked = styled(() => RadioButton(false))`
		user-select: none;
		pointer-events: auto;
	`;

	return !disable ? (
		!disableNewLinking ? (
			<PortWidget
				port={port}
				engine={engine}
			>
				<ActivePortContainer {...containerProps}>
					{hasLinks || portState === PortState.PortSelected ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
				</ActivePortContainer>
			</PortWidget>
		) : (
			<PortWidget
				port={port}
				engine={engine}
			>
				<DisabledNewLinkingPortContainer {...containerProps}>
					{hasLinks ? <RadioButtonChecked /> : <RadioButtonUnchecked /> }
				</DisabledNewLinkingPortContainer>
			</PortWidget>
		)

	) : (
		<DisabledPortContainer data-testid={dataTestId}>
			<RadioButtonUnchecked />
		</DisabledPortContainer>
	);
}

interface PortsContainerProps {
	active: boolean;
	hasLinks: boolean;
	hasError: boolean;
}

const portActiveColor = "var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)))";

const ActivePortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: "pointer",
	display: "flex",
	strokeOpacity: props.active ? 0.1 : 0,
	color: (props.active ? portActiveColor : props.hasLinks ? (props.hasError ? "var(--vscode-errorForeground)" : portActiveColor) : "var(--vscode-list-activeSelectionBackground)"),
	"&:hover": {
		color: portActiveColor
	}
}));

const DisabledPortContainer = styled.div`
	cursor: not-allowed;
	color: #b7bcd3
`;

const DisabledNewLinkingPortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: "not-allowed",
	display: "flex",
	color: props.hasLinks ? (props.hasError ? 'var(--vscode-errorForeground)' : portActiveColor) : "var(--vscode-list-activeSelectionBackground)",
}));
