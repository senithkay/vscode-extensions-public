/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { Icon } from "@wso2-enterprise/ui-toolkit";

import { DataMapperLinkModel } from "../../Link"
import { IntermediatePortModel } from "../IntermediatePort";
import { InputOutputPortModel } from "../model/InputOutputPortModel";
import { useDMExpressionBarStore } from "../../../../store/store";

export interface DataMapperPortWidgetProps {
	engine: DiagramEngine;
	port: IntermediatePortModel | InputOutputPortModel;
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

	const { setExprBarFocusedPort, resetExprBarFocusedPort } = useDMExpressionBarStore(state => ({
		setExprBarFocusedPort: state.setFocusedPort,
		resetExprBarFocusedPort: state.resetFocusedPort
	}));

	const hasLinks = Object.entries(port.links).length > 0;

	const hasError = Object.entries(port.links).some((link) => {
		if (link[1] instanceof DataMapperLinkModel){
			return link[1].hasError();
		}
		return false;
	});

	const handleExprBarFocusedPort = () => {
		if (port instanceof InputOutputPortModel) {
			setExprBarFocusedPort(port);
		}
	};

	useEffect(() => {
			port.registerListener({
				eventDidFire(event) {
					if (event.function === "mappingStartedFrom" || event.function === "mappingFinishedTo") {
						setPortState(PortState.PortSelected);
						if (handlePortState) {
							handlePortState(PortState.PortSelected);
							resetExprBarFocusedPort();
						}
					} else if (event.function === "link-selected") {
						setPortState(PortState.LinkSelected);
						if (handlePortState) {
							handlePortState(PortState.LinkSelected);
							resetExprBarFocusedPort();
						}
					} else if (event.function === "link-unselected"
						|| event.function === "mappingStartedFromSelectedAgain") {
						setPortState(PortState.Unselected);
						if (handlePortState) {
							handlePortState(PortState.Unselected);
						}
						resetExprBarFocusedPort();
					} else if (event.function === "expressionBarFocused") {
						handleExprBarFocusedPort();
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

	const RadioButton = (checked: boolean, disabled?: boolean) => {
		const iconSx = {
			display: "flex",
			fontSize: "18px"
		};
	
		if (disabled) {
			Object.assign(iconSx, {
				cursor: 'not-allowed',
				color: 'var(--vscode-disabledForeground)'
			});
		}

		return (
			<Icon
				sx={{ height: "18px", width: "18px" }}
				iconSx={iconSx}
				name={checked ? "radio-button-checked" : "radio-button-unchecked"}
			/>
		);
	};

	const RadioButtonChecked = styled(() => RadioButton(true))`
		user-select: none;
		pointer-events: auto;
	`;

	const RadioButtonUnchecked = styled(({ disabled = false }) => RadioButton(false, disabled))`
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

	) : <RadioButtonUnchecked disabled={disable} data-testid={dataTestId}/>;
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

const DisabledNewLinkingPortContainer = styled.div((props: PortsContainerProps) => ({
	cursor: "not-allowed",
	display: "flex",
	color: props.hasLinks ? (props.hasError ? 'var(--vscode-errorForeground)' : portActiveColor) : "var(--vscode-list-activeSelectionBackground)",
}));
