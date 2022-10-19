import { MouseEvent, TouchEvent } from 'react';

import {
	Action,
	ActionEvent,
	DragCanvasState,
	InputType,
	SelectingState,
	State
} from '@projectstorm/react-canvas-core';
import { DiagramEngine, DragDiagramItemsState, PortModel } from '@projectstorm/react-diagrams-core';

import { DiagnosticTooltipID } from "../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { LinkOverayContainerID } from '../OverriddenLinkLayer/LinkOverlayPortal';

import { CreateLinkState } from './CreateLinkState';

export class DefaultState extends State<DiagramEngine> {
	dragCanvas: DragCanvasState;
	createLink: CreateLinkState;
	dragItems: DragDiagramItemsState;

	constructor() {
		super({ name: 'starting-state' });
		this.childStates = [new SelectingState()];
		this.dragCanvas = new DragCanvasState();
		this.createLink = new CreateLinkState();
		this.dragItems = new DragDiagramItemsState();

		// determine what was clicked on
		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event: ActionEvent<MouseEvent>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(event);

					// the canvas was clicked on, transition to the dragging canvas state
					if (!element) {
						const targetElement = event.event.target as Element;
						const linkOverlayContainer = targetElement.closest(`#${LinkOverayContainerID}`);
						const diagnosticsTooltip = targetElement.closest(`#${DiagnosticTooltipID}`);
						if (linkOverlayContainer || diagnosticsTooltip) {
							// Clicked on a link overlay item or a diagnostic tooltip,
							// hence, do not propagate as a canvas drag
						} else {
							this.transitionWithEvent(this.dragCanvas, event);
						}
					}
					// initiate dragging a new link
					else if (element instanceof PortModel || element instanceof DataMapperNodeModel) {
						return;
					}
					// move the items (and potentially link points)
					else {
						this.transitionWithEvent(this.dragItems, event);
					}
				}
			})
		);

		// touch drags the canvas
		this.registerAction(
			new Action({
				type: InputType.TOUCH_START,
				fire: (event: ActionEvent<TouchEvent>) => {
					this.transitionWithEvent(new DragCanvasState(), event);
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (event: ActionEvent<MouseEvent>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(event);

					if (element instanceof PortModel) this.transitionWithEvent(this.createLink, event);
				}
			})
		);
	}
}
